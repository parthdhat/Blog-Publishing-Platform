import { pool } from "./db";

export async function getPostsByAuthor(authorId: string) {
  const res = await pool.query(
    `
    SELECT id, title, status
    FROM posts
    WHERE author_id = $1
    ORDER BY created_at DESC
    `,
    [authorId]
  );
  return res.rows;
}

export async function getPostsInReview() {
  const res = await pool.query(
    `
    SELECT posts.id, posts.title, users.name AS author
    FROM posts
    JOIN users ON users.id = posts.author_id
    WHERE posts.status = 'IN_REVIEW'
    ORDER BY posts.created_at ASC
    `
  );
  return res.rows;
}
