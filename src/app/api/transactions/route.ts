import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const UserId = searchParams.get("user_id");
    const type = searchParams.get("type");
    const categoryId = searchParams.get("category_id");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!UserId) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

     const userId = Number(UserId);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user_id" },
        { status: 400 }
      );
    }

    const conditions: string[] = ["t.user_id = $1"];
    const values: (string | number)[] = [Number(userId)];
    let paramIndex = 2;

    if (type) {
      conditions.push(`t.type = $${paramIndex}`);
      values.push(type);
      paramIndex++;
    }

    if (categoryId) {
      conditions.push(`t.category_id = $${paramIndex}`);
      values.push(Number(categoryId));
      paramIndex++;
    }

    if (from) {
      conditions.push(`t.date >= $${paramIndex}`);
      values.push(from);
      paramIndex++;
    }

    if (to) {
      conditions.push(`t.date <= $${paramIndex}`);
      values.push(to);
      paramIndex++;
    }

    const query = `
      SELECT
        t.id,
        t.title,
        t.amount,
        t.type,
        t.date,
        t.note,
        t.user_id,
        t.category_id,
        t.created_at,
        t.updated_at,
        c.id AS category_ref_id,
        c.name AS category_name,
        c.type AS category_type
      FROM transactions t
      LEFT JOIN categories c
        ON c.id = t.category_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY t.date DESC, t.created_at DESC
    `;

    const result = await db.query(query, values);

    const transactions = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      amount: Number(row.amount),
      type: row.type,
      date: row.date,
      note: row.note,
      user_id: row.user_id,
      category_id: row.category_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category: row.category_ref_id
        ? {
            id: row.category_ref_id,
            name: row.category_name,
            type: row.category_type,
          }
        : null,
    }));

    return NextResponse.json(
      { transactions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Transactions Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions
 */
export async function POST(req: Request) {
  try {
    const {
      title,
      amount,
      type,
      date,
      note,
      user_id,
      category_id,
    } = await req.json();

    if (
      !title ||
      amount === undefined ||
      !type ||
      !date ||
      !user_id ||
      !category_id
    ) {
      return NextResponse.json(
        {
          error:
            "title, amount, type, date, user_id and category_id are required",
        },
        { status: 400 }
      );
    }

    const result = await db.query(
      `
      INSERT INTO transactions
        (title, amount, type, date, note, user_id, category_id)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        title,
        amount,
        type,
        date,
        note,
        user_id,
        category_id,
        created_at,
        updated_at
      `,
      [
        title,
        amount,
        type,
        date,
        note || null,
        user_id,
        category_id,
      ]
    );

    return NextResponse.json(
      {
        message: "Transaction created successfully",
        transaction: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Transaction Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/transactions
 */
export async function PUT(req: Request) {
  try {
    const {
      id,
      title,
      amount,
      type,
      date,
      note,
      category_id,
    } = await req.json();

    if (
      !id ||
      !title ||
      amount === undefined ||
      !type ||
      !date ||
      !category_id
    ) {
      return NextResponse.json(
        {
          error:
            "id, title, amount, type, date and category_id are required",
        },
        { status: 400 }
      );
    }

    const result = await db.query(
      `
      UPDATE transactions
      SET
        title = $1,
        amount = $2,
        type = $3,
        date = $4,
        note = $5,
        category_id = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING
        id,
        title,
        amount,
        type,
        date,
        note,
        user_id,
        category_id,
        created_at,
        updated_at
      `,
      [
        title,
        amount,
        type,
        date,
        note || null,
        category_id,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Transaction updated successfully",
        transaction: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Transaction Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

//delete
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const result = await db.query(
      `
      DELETE FROM transactions
      WHERE id = $1
      RETURNING id
      `,
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Transaction deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Transaction Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}