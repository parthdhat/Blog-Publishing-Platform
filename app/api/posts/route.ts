// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Get the current user from the session
    const authHeader = request.headers.get("cookie") || "";
    const sessionToken = authHeader
      .split("; ")
      .find((row) => row.startsWith("session="))
      ?.split("=")[1];

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user from session
    const userResult = await query(
      `SELECT user_id FROM sessions WHERE token = $1`,
      [sessionToken]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const userId = userResult.rows[0].user_id;

    // Create the post
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const result = await query(
      `INSERT INTO posts (title, slug, content, author_id, status)
       VALUES ($1, $2, $3, $4, 'DRAFT')
       RETURNING id, title, slug, content, status, created_at`,
      [title, slug, content, userId]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}