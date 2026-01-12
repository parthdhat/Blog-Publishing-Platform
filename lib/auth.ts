import { cookies } from "next/headers";
import { getUserFromSession } from "./session";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) return null;

  return await getUserFromSession(session);
}
