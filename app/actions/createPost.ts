// app/actions/createPost.ts
"use server";

import { getCurrentUser } from "@/lib/auth";
import { createPost } from "@/lib/posts";

export async function createPostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  await createPost(title, content, user.id);
}
