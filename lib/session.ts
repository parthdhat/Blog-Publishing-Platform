import crypto from "crypto";
import { query } from "./db";

type User = {
  id: string;
  name: string;
  role: string;
  email?: string;
};

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID();

  try {
    await query(
      "INSERT INTO sessions (token, user_id) VALUES ($1, $2)",
      [token, userId]
    );
    return token;
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }
}

export async function getUserFromSession(token: string): Promise<User | null> {
  try {
    const result = await query<User>(
      `SELECT 
        users.id, 
        users.name, 
        users.role,
        users.email
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token = $1`,
      [token]
    );
    return result.rows[0] ?? null;
  } catch (error) {
    console.error('Error getting user from session:', error);
    return null;
  }
}

export async function deleteSession(token: string): Promise<void> {
  try {
    await query(
      "DELETE FROM sessions WHERE token = $1",
      [token]
    );
  } catch (error) {
    console.error('Error deleting session:', error);
    throw new Error('Failed to delete session');
  }
}