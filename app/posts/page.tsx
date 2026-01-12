"use server";

import Link from "next/link";
import { query } from "@/lib/db";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  read_time?: number;
};

async function getAllPublishedPosts(): Promise<Post[]> {
  try {
    console.log('Running query...');
    const result = await query<Post>(
      `SELECT 
        p.id,
        p.title,
        p.slug,
        LEFT(p.content, 200) as excerpt,
        p.created_at,
        p.updated_at,
        u.name as author_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.status = 'PUBLISHED'
      ORDER BY p.created_at DESC`
    );
    
    console.log('Query result:', result);
    
    if (!result) return [];
    
    // Handle different possible result structures
    const rows = (result as any)?.rows || result;
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export default async function PostsPage() {
  const posts = await getAllPublishedPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Latest Articles</h1>
          <p className="mt-1 text-gray-600">Discover our latest stories and updates</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No posts yet</h3>
              <p className="mt-1 text-gray-500">Check back later for new articles.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-xl bg-white"
                >
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="flex-1">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <time dateTime={post.created_at}>
                          {format(new Date(post.created_at), "MMMM d, yyyy")}
                        </time>
                        {post.read_time && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{post.read_time} min read</span>
                          </>
                        )}
                      </div>
                      <Link href={`/posts/${post.slug}`} className="block mt-2">
                        <h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="mt-3 text-base text-gray-500 line-clamp-3">
                            {post.excerpt}...
                          </p>
                        )}
                      </Link>
                    </div>
                    <div className="mt-6 flex items-center">
                      <div className="flex-shrink-0">
                        <span className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                          {post.author_name ? post.author_name.charAt(0) : 'A'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {post.author_name || 'Anonymous'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={`/posts/${post.slug}`}
                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Read more
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} EditorialFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}