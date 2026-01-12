// app/dashboard/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import { PostRow } from './postRow';

import { submitForReview } from "./actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { FileText, Plus } from "lucide-react";
import { redirect } from "next/navigation";

type Post = {
  id: string;
  title: string;
  status: "DRAFT" | "IN_REVIEW" | "PUBLISHED";
  created_at: string;
  updated_at: string;
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch recent posts
  const posts = await query<Post>(
    `
    SELECT
      id,
      title,
      status,
      created_at,
      updated_at
    FROM posts
    WHERE author_id = $1
    ORDER BY updated_at DESC
    LIMIT 10
    `,
    [user.id]
  );

  // Status counts
  const statusCounts = await query<{ status: string; count: number }>(
    `
    SELECT
      status,
      COUNT(*)::int AS count
    FROM posts
    WHERE author_id = $1
    GROUP BY status
    `,
    [user.id]
  );

  const getStatusCount = (status: string) =>
    statusCounts.rows.find((s) => s.status === status)?.count ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/posts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Drafts"
          count={getStatusCount("DRAFT")}
          subtitle="In progress"
        />

        <StatCard
          title="In Review"
          count={getStatusCount("IN_REVIEW")}
          subtitle="Under review"
          color="blue"
        />

        <StatCard
          title="Published"
          count={getStatusCount("PUBLISHED")}
          subtitle="Live posts"
          color="green"
        />
      </div>

      {/* Recent Posts */}
       <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.rows.length > 0 ? (
                posts.rows.map((post) => (
                  <PostRow
  key={post.id}
  post={post}
  submitForReview={submitForReview}
/>

                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No posts yet. Create your first post!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Small Components ---------- */

function StatCard({
  title,
  count,
  subtitle,
  color,
}: {
  title: string;
  count: number;
  subtitle: string;
  color?: "blue" | "green";
}) {
  const iconColor =
    color === "blue"
      ? "text-blue-500"
      : color === "green"
      ? "text-green-500"
      : "text-muted-foreground";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <FileText className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: Post["status"] }) {
  const styles =
    status === "PUBLISHED"
      ? "bg-green-100 text-green-800"
      : status === "IN_REVIEW"
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles}`}>
      {status.replace("_", " ").toLowerCase()}
    </span>
  );
}
