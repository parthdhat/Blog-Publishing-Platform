import { Pool } from "pg";
import { sql } from "@vercel/postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

/**
 * Exported pg Pool (used in local / non-Vercel environments)
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

/**
 * Unified query helper
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[] }> {
  // Vercel production → use @vercel/postgres
  if (process.env.VERCEL_ENV === "production") {
    const result = await sql.query(text, params);
    return { rows: result.rows as T[] };
  }

  // Local / self-hosted → use pg Pool
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return { rows: result.rows as T[] };
  } finally {
    client.release();
  }
}
