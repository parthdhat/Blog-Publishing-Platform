import { createPostAction } from "@/app/actions/createPost";

export default function NewPostPage() {
  return (
    <form action={createPostAction}>
      <h1>New Draft</h1>

      <input name="title" placeholder="Title" required />
      <br />
      <textarea name="content" placeholder="Content" required />
      <br />

      <button type="submit">Create Draft</button>
    </form>
  );
}
