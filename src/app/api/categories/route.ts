
import { NextResponse } from "next/server";
import {db} from "@/lib/db";

export const runtime = "nodejs";

// create category(POST)
export async function POST(req:Request){
      try {
    const { name, type, user_id } = await req.json();

    //  Validation
    if (!name || !type || !user_id) {
      return NextResponse.json(
        { error: "name, type and user_id are required" },
        { status: 400 }
      );
    }

    //  Insert category
    const result = await db.query(
      `
      INSERT INTO categories (name, type, user_id)
      VALUES ($1, $2, $3)
      RETURNING id, name, type, user_id, created_at
      `,
      [name, type, user_id]
    );

    return NextResponse.json(
      {
        message: "Category created successfully",
        category: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Category Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

//GET ALL CATEGORIES (for user)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    const result = await db.query(
      `
      SELECT id, name, type, user_id, created_at
      FROM categories
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [user_id]
    );

    return NextResponse.json(
      {
        categories: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Categories Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

//Update
export async function PUT(req: Request) {
  try {
    const { id, name, type } = await req.json();

    if (!id || !name || !type) {
      return NextResponse.json(
        { error: "id, name and type are required" },
        { status: 400 }
      );
    }

    const result = await db.query(
      `
      UPDATE categories
      SET name = $1,
          type = $2
      WHERE id = $3
      RETURNING id, name, type, user_id, created_at
      `,
      [name, type, id]
    );

    return NextResponse.json(
      {
        message: "Category updated successfully",
        category: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Category Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

//Delete
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

    await db.query(
      `DELETE FROM categories WHERE id = $1`,
      [id]
    );

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Category Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}