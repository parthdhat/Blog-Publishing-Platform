"use server";

import { getCurrentUser } from "@/lib/auth";
import { updatePostStatus } from "@/lib/posts";

export async function approvePost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "EDITOR") {
    throw new Error("Forbidden");
  }

  const postId = formData.get("postId") as string;
  if (!postId) {
    throw new Error("Missing postId");
  }

  await updatePostStatus(postId, "PUBLISHED", user);
}

export async function rejectPost(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "EDITOR") {
    throw new Error("Forbidden");
  }

  const postId = formData.get("postId") as string;
  if (!postId) {
    throw new Error("Missing postId");
  }

  await updatePostStatus(postId, "REJECTED", user);
}
