"use server";

import { getCurrentUser } from "@/lib/auth";
import { updatePostStatus } from "@/lib/posts";

export async function submitForReview(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const postId = formData.get("postId") as string;
  if (!postId) throw new Error("Missing postId");

  await updatePostStatus(postId, "IN_REVIEW", user);
}
