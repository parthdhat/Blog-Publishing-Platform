// app/editor/review/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { redirect } from "next/navigation";

type PostStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "REJECTED";

type Post = {
  id: string;
  title: string;
  status: PostStatus;
  author_name: string;
  created_at: string;
  updated_at: string;
  word_count: number;
};

export default async function EditorReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  // ✅ FIX: await searchParams
  const { status, search } = await searchParams;

  const user = await getCurrentUser();
  if (!user || user.role !== "EDITOR") {
    redirect("/login");
  }

  const statusFilter: PostStatus =
    status === "PUBLISHED" || status === "REJECTED"
      ? status
      : "IN_REVIEW";

  const searchQuery = search ?? "";

  // Fetch posts
  const posts = await query<Post>(
    `
    SELECT
      p.id,
      p.title,
      p.status,
      p.created_at,
      p.updated_at,
      u.name AS author_name,
      length(p.content) / 5 AS word_count
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.status = $1
      AND (p.title ILIKE $2 OR u.name ILIKE $2)
    ORDER BY p.updated_at DESC
    LIMIT 50
    `,
    [statusFilter, `%${searchQuery}%`]
  );

  // Status counts
  const statusCounts = await query<{ status: PostStatus; count: number }>(
    `
    SELECT status, COUNT(*)::int AS count
    FROM posts
    WHERE status IN ('IN_REVIEW', 'PUBLISHED', 'REJECTED')
    GROUP BY status
    `
  );

  const getStatusCount = (status: PostStatus) =>
    statusCounts.rows.find((s) => s.status === status)?.count ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Editor Review Dashboard</h1>
        <p className="text-muted-foreground">
          Review and manage content submissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Pending Review"
          count={getStatusCount("IN_REVIEW")}
          icon={<Clock className="h-4 w-4 text-blue-500" />}
        />
        <StatCard
          title="Published"
          count={getStatusCount("PUBLISHED")}
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
        />
        <StatCard
          title="Rejected"
          count={getStatusCount("REJECTED")}
          icon={<XCircle className="h-4 w-4 text-red-500" />}
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Content Review</CardTitle>
              <CardDescription>
                Review and manage content submissions
              </CardDescription>
            </div>

            <form className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  defaultValue={searchQuery}
                  placeholder="Search posts or authors..."
                  className="pl-8 w-[280px]"
                />
              </div>
              <Button type="submit" variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Word Count</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {posts.rows.length > 0 ? (
                posts.rows.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/editor/review/${post.id}`}
                        className="hover:underline"
                      >
                        {post.title}
                      </Link>
                    </TableCell>
                    <TableCell>{post.author_name}</TableCell>
                    <TableCell>{Math.round(post.word_count)}</TableCell>
                    <TableCell>
                      {format(new Date(post.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/editor/review/${post.id}`}>
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No posts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="text-sm text-muted-foreground">
          Showing {posts.rows.length} posts
        </CardFooter>
      </Card>
    </div>
  );
}

/* ---------- Helper ---------- */

function StatCard({
  title,
  count,
  icon,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
      </CardContent>
    </Card>
  );
}
