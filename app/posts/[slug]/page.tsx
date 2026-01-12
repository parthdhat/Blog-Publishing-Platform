"use server";

import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { query } from "@/lib/db";

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_email?: string;
};

async function getPublishedPost(slug: string): Promise<Post | null> {
  try {
    const result = await query(
      `SELECT 
        p.*, 
        u.name as author_name,
        u.email as author_email
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.slug = $1 AND p.status = 'PUBLISHED'`,
      [slug]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch post');
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPublishedPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested post does not exist.",
    };
  }

  return {
    title: `${post.title} | EditorialFlow`,
    description: post.content.slice(0, 160),
  };
}

export default async function PublicPostPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const post = await getPublishedPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="inline-flex items-center text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-6 py-8 sm:px-10">
            {/* Post Header */}
            <header className="mb-8">
              <div className="flex items-center space-x-3 text-sm text-gray-500 mb-4">
                <time dateTime={post.created_at}>
                  {format(new Date(post.created_at), "MMMM d, yyyy")}
                </time>
                {post.updated_at !== post.created_at && (
                  <>
                    <span>•</span>
                    <span>
                      Updated {format(new Date(post.updated_at), "MMMM d, yyyy")}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
                {post.title}
              </h1>

              {post.author_name && (
                <div className="flex items-center mt-6">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {post.author_name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {post.author_name}
                    </p>
                    {post.author_email && (
                      <p className="text-sm text-gray-500">{post.author_email}</p>
                    )}
                  </div>
                </div>
              )}
            </header>

            {/* Post Content */}
            <div className="prose prose-indigo max-w-none">
              <div
                className="prose-lg text-gray-700 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Last Updated */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Last updated on {format(new Date(post.updated_at), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        </article>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">
              &copy; {new Date().getFullYear()} EditorialFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}