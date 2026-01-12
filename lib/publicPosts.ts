import { query } from "./db";

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at: string;
  status: string;
  author_id: string;
  author_name?: string;
  author_email?: string;
};

export async function getPublishedPostBySlug(slug: string) {
  try {
    const result = await query<Post>(
      `SELECT 
        p.*,
        u.name as author_name,
        u.email as author_email
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.slug = $1 AND p.status = 'PUBLISHED'`,
      [slug]
    );
    return result.rows[0] ?? null;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function getAllPublishedPosts() {
  try {
    const result = await query<Post>(
      `SELECT 
        p.id,
        p.title,
        p.slug,
        LEFT(p.content, 200) as excerpt,
        p.created_at,
        p.updated_at,
        u.name as author_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.status = 'PUBLISHED'
      ORDER BY p.created_at DESC`
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}