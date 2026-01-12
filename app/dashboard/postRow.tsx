'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';

type Post = {
  id: string;
  title: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED';
  updated_at: string;
};

export function PostRow({
  post,
  submitForReview,
}: {
  post: Post;
  submitForReview: (formData: FormData) => void;
}) {
  const router = useRouter();

  const isEditable = post.status !== 'PUBLISHED';
  const rowHref = isEditable
    ? `/posts/edit/${post.id}`
    : `/posts/${post.id}`;

  const handleRowClick = () => {
    router.push(rowHref);
  };

  return (
    <tr
      className={isEditable ? 'cursor-pointer hover:bg-muted/50' : ''}
      onClick={handleRowClick}
    >
      {/* Title */}
      <td className="px-6 py-4 whitespace-nowrap">
        <Link
          href={rowHref}
          className="text-sm font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {post.title}
        </Link>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={post.status} />
      </td>

      {/* Updated */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
        {format(new Date(post.updated_at), 'MMM d, yyyy')}
      </td>

      {/* Actions */}
      <td
        className="px-6 py-4 whitespace-nowrap text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {post.status === 'DRAFT' && (
          <form action={submitForReview}>
            <input type="hidden" name="postId" value={post.id} />
            <Button type="submit" variant="outline" size="sm">
              Submit for Review
            </Button>
          </form>
        )}

        {post.status === 'IN_REVIEW' && (
          <span className="text-sm text-muted-foreground">In Review</span>
        )}

        {post.status === 'PUBLISHED' && (
          <Link href={`/posts/${post.id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
        )}
      </td>
    </tr>
  );
}
