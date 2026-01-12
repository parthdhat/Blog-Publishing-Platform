// app/posts/edit/[id]/actions.ts
'use server';

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function savePost(formData: FormData) {
  const postId = formData.get("postId") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!postId || !title || !content) {
    throw new Error("Missing fields");
  }

  await query(
    `
    UPDATE posts
    SET title = $1,
        content = $2,
        updated_at = NOW()
    WHERE id = $3
    `,
    [title, content, postId]
  );

  // Refresh dashboard data
  revalidatePath("/dashboard");

  // Go back after save
  redirect("/dashboard");
}
