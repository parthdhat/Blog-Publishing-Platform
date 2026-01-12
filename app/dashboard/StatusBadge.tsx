'use client';

export function StatusBadge({ status }: { status: string }) {
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