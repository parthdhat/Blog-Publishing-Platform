// app/editor/review/[id]/actions.ts
'use server';

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function approvePost(formData: FormData) {
  const postId = formData.get("postId") as string;

  if (!postId) throw new Error("Post ID missing");

  await query(
    `
    UPDATE posts
    SET status = 'PUBLISHED', updated_at = NOW()
    WHERE id = $1 AND status = 'IN_REVIEW'
    `,
    [postId]
  );

  revalidatePath("/editor/review");
  redirect("/editor/review");
}

export async function rejectPost(formData: FormData) {
  const postId = formData.get("postId") as string;

  if (!postId) throw new Error("Post ID missing");

  await query(
    `
    UPDATE posts
    SET status = 'REJECTED', updated_at = NOW()
    WHERE id = $1 AND status = 'IN_REVIEW'
    `,
    [postId]
  );

  revalidatePath("/editor/review");
  redirect("/editor/review");
}
