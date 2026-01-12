// app/posts/edit/[id]/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import { savePost } from "./actions";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const result = await query<any>(
    `
    SELECT id, title, content, author_id
    FROM posts
    WHERE id = $1
    `,
    [id]
  );

  const post = result.rows[0];

  if (!post) return <div>Post not found</div>;
  if (post.author_id !== user.id)
    return <div>You are not allowed to edit this post</div>;

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>

      <form action={savePost} className="space-y-4">
<input type="hidden" name="postId" defaultValue={post.id} />

        <input
          name="title"
          defaultValue={post.title}
          className="w-full border px-3 py-2 rounded"
        />

        <textarea
          name="content"
          defaultValue={post.content}
          rows={12}
          className="w-full border px-3 py-2 rounded"
        />

        <button className="px-4 py-2 bg-black text-white rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}
