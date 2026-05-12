import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    const id = Number(userId);

    /**
     * 1. TOTAL INCOME
     */
    const incomeRes = await db.query(
      `SELECT COALESCE(SUM(amount),0) as total
       FROM transactions
       WHERE user_id = $1 AND type = 'INCOME'`,
      [id]
    );

    /**
     * 2. TOTAL EXPENSE
     */
    const expenseRes = await db.query(
      `SELECT COALESCE(SUM(amount),0) as total
       FROM transactions
       WHERE user_id = $1 AND type = 'EXPENSE'`,
      [id]
    );

    const income = Number(incomeRes.rows[0].total);
    const expense = Number(expenseRes.rows[0].total);

    //  BALANCE
     
    const balance = income - expense;

    //   BUDGET + SPENT
  
    const budgetRes = await db.query(
      `
      SELECT 
        b.id,
        b.amount,
        b.month,
        b.year,
        b.category_id,
        c.name as category_name,
        COALESCE(SUM(t.amount),0) as spent
      FROM budgets b
      LEFT JOIN categories c ON c.id = b.category_id
      LEFT JOIN transactions t 
        ON t.category_id = b.category_id
        AND t.user_id = b.user_id
        AND EXTRACT(MONTH FROM t.date) = b.month
        AND EXTRACT(YEAR FROM t.date) = b.year
      WHERE b.user_id = $1
      GROUP BY b.id, c.name
      ORDER BY b.year DESC, b.month DESC
      `,
      [id]
    );

    return NextResponse.json(
      {
        income,
        expense,
        balance,
        budgets: budgetRes.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dashboard Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}