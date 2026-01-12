// app/editor/review/[id]/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { approvePost, rejectPost } from "./actions";

export default async function ReviewPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user || user.role !== "EDITOR") {
    redirect("/login");
  }

  const result = await query<any>(
    `
    SELECT
      p.id,
      p.title,
      p.content,
      p.status,
      p.created_at,
      u.name AS author_name
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.id = $1
    `,
    [id]
  );

  const post = result.rows[0];
  if (!post) redirect("/editor/review");

  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="text-sm text-muted-foreground">
          By {post.author_name} • {format(new Date(post.created_at), "MMM d, yyyy")}
        </p>
      </div>

      <div className="prose max-w-none">
        {post.content}
      </div>

      <div className="flex gap-4 pt-6 border-t">
  <form action={approvePost}>
    <input type="hidden" name="postId" defaultValue={post.id} />
    <button className="px-4 py-2 bg-green-600 text-white rounded">
      Approve & Publish
    </button>
  </form>

  <form action={rejectPost}>
    <input type="hidden" name="postId" defaultValue={post.id} />
    <button className="px-4 py-2 bg-red-600 text-white rounded">
      Reject
    </button>
  </form>

  <a
    href="/editor/review"
    className="px-4 py-2 border rounded"
  >
    Back
  </a>
</div>

    </div>
  );
}
