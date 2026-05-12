import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getUserFromSession();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const result = await db.query(
    `SELECT id, name, email FROM users WHERE id = $1`,
    [session.userId]
  );

  const user = result.rows[0];

  return NextResponse.json({ user });
}