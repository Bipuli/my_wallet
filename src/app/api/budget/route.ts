import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/budget?user_id=1&month=5&year=2026
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("user_id");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!userId) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 },
      );
    }

    const conditions: string[] = ["b.user_id = $1"];
    const values: (string | number)[] = [Number(userId)];
    let index = 2;

    if (month) {
      conditions.push(`b.month = $${index}`);
      values.push(Number(month));
      index++;
    }

    if (year) {
      conditions.push(`b.year = $${index}`);
      values.push(Number(year));
      index++;
    }

    const query = `
  SELECT
    b.id,
    b.amount,
    b.month,
    b.year,
    b.user_id,
    b.category_id,
    b.created_at,
    b.updated_at,
    c.name AS category_name,

    COALESCE(
      SUM(
        CASE 
          WHEN t.type = 'EXPENSE' THEN t.amount 
          ELSE 0 
        END
      ),
      0
    ) AS spent

  FROM budgets b

  LEFT JOIN categories c 
    ON c.id = b.category_id

  LEFT JOIN transactions t 
    ON t.category_id = b.category_id
    AND t.user_id = b.user_id
    AND EXTRACT(MONTH FROM t.date) = b.month
    AND EXTRACT(YEAR FROM t.date) = b.year

  WHERE ${conditions.join(" AND ")}

  GROUP BY 
    b.id, c.name

  ORDER BY b.year DESC, b.month DESC
`;

    const result = await db.query(query, values);

    const budgets = result.rows.map((row) => ({
      id: row.id,
      amount: Number(row.amount),
      month: row.month,
      year: row.year,
      user_id: row.user_id,
      category_id: row.category_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      categoryName: row.category_name,
      spent: Number(row.spent),
    }));
    return NextResponse.json({ budgets }, { status: 200 });
  } catch (error) {
    console.error("GET Budget Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/budget
 */
export async function POST(req: Request) {
  try {
    const { amount, month, year, user_id, category_id } = await req.json();

    if (!amount || !month || !year || !user_id || !category_id) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const result = await db.query(
      `
      INSERT INTO budgets
        (amount, month, year, user_id, category_id)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [amount, month, year, user_id, category_id],
    );

    return NextResponse.json(
      {
        message: "Budget created successfully",
        budget: result.rows[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST Budget Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/budget
 */
export async function PUT(req: Request) {
  try {
    const { id, amount, month, year, category_id } = await req.json();

    if (!id || !amount || !month || !year || !category_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await db.query(
      `
      UPDATE budgets
      SET
        amount = $1,
        month = $2,
        year = $3,
        category_id = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
      `,
      [amount, month, year, category_id, id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Budget updated successfully",
        budget: result.rows[0],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PUT Budget Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/budget?id=1
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const result = await db.query(
      `DELETE FROM budgets WHERE id = $1 RETURNING id`,
      [Number(id)],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Budget deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE Budget Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
