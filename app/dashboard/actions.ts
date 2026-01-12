// app/dashboard/actions.ts
'use server';

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitForReview(formData: FormData): Promise<void> {
  const postId = formData.get("postId");

  if (!postId || typeof postId !== "string") return;

  await query(
    `
    UPDATE posts
    SET status = 'IN_REVIEW', updated_at = NOW()
    WHERE id = $1 AND status = 'DRAFT'
    `,
    [postId]
  );

  revalidatePath("/dashboard");
}
