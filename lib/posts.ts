import { query } from "./db";
import { canTransition, PostStatus } from "./postState";
import { getCurrentUser } from "@/lib/auth";
import { pool } from "@/lib/db";

export async function updatePostStatus(
  postId: string,
  nextStatus: PostStatus,
  user: { id: string; role: "AUTHOR" | "EDITOR" }
) {
  const result = await query(
    "SELECT status, author_id FROM posts WHERE id = $1",
    [postId]
  );

  const post = result.rows[0];
  if (!post) throw new Error("Post not found");

  // Author can only act on their own posts
  if (user.role === "AUTHOR" && post.author_id !== user.id) {
    throw new Error("Forbidden");
  }

  if (!canTransition(post.status, nextStatus, user.role)) {
    throw new Error("Invalid state transition");
  }

  await query(
    "UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [nextStatus, postId]
  );
}
export async function submitForReview(formData: FormData) {
  const postId = formData.get("postId") as string;
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Only allow author to submit own post
  const res = await pool.query(
    `
    UPDATE posts
    SET status = 'IN_REVIEW', updated_at = NOW()
    WHERE id = $1
      AND author_id = $2
      AND status IN ('DRAFT', 'REJECTED')
    RETURNING id
    `,
    [postId, user.id]
  );

  if (res.rowCount === 0) {
    throw new Error("Invalid state transition");
  }
}
export async function createPost(
  title: string,
  content: string,
  authorId: string
) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const result = await query(
    `INSERT INTO posts (title, slug, content, author_id, status)
     VALUES ($1, $2, $3, $4, 'DRAFT')
     RETURNING id, title, slug, content, status, created_at`,
    [title, slug, content, authorId]
  );

  return result.rows[0];
}

// Add these additional useful functions
export async function getPostById(id: string) {
  const result = await query(
    `SELECT p.*, u.name as author_name 
     FROM posts p 
     JOIN users u ON p.author_id = u.id 
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function getPostsByAuthor(authorId: string) {
  const result = await query(
    `SELECT p.*, 
            (SELECT COUNT(*) FROM posts WHERE author_id = $1) as total_count
     FROM posts p 
     WHERE p.author_id = $1
     ORDER BY p.updated_at DESC
     LIMIT 10`,
    [authorId]
  );
  return {
    posts: result.rows,
    total: result.rows[0]?.total_count || 0
  };
}

export async function updatePost(
  id: string,
  updates: { title?: string; content?: string; status?: PostStatus },
  userId: string
) {
  const updatesSet = [];
  const values = [];
  let paramCount = 1;

  if (updates.title) {
    updatesSet.push(`title = $${paramCount++}`);
    values.push(updates.title);
    // Update slug when title changes
    const slug = updates.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    updatesSet.push(`slug = $${paramCount++}`);
    values.push(slug);
  }

  if (updates.content) {
    updatesSet.push(`content = $${paramCount++}`);
    values.push(updates.content);
  }

  if (updates.status) {
    updatesSet.push(`status = $${paramCount++}`);
    values.push(updates.status);
  }

  if (updatesSet.length === 0) {
    throw new Error("No updates provided");
  }

  values.push(id, userId); // For WHERE clause

  const result = await query(
    `UPDATE posts 
     SET ${updatesSet.join(", ")}, updated_at = NOW() 
     WHERE id = $${paramCount} AND author_id = $${paramCount + 1}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new Error("Post not found or not authorized");
  }

  return result.rows[0];
}