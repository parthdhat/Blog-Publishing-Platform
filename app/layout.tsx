import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html>
      <body>
        <header style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
          <nav style={{ display: "flex", gap: "1rem" }}>
            <Link href="/">Home</Link>
            <Link href="/posts">Posts</Link>

            {user && user.role === "AUTHOR" && (
              <Link href="/dashboard">Dashboard</Link>
            )}

            {user && user.role === "EDITOR" && (
              <Link href="/editor/review">Review</Link>
            )}

            {!user && <Link href="/login">Login</Link>}

            {user && (
              <form action="/api/logout" method="POST">
                <button>Logout</button>
              </form>
            )}
          </nav>
        </header>

        <main style={{ padding: "2rem" }}>{children}</main>
      </body>
    </html>
  );
}
