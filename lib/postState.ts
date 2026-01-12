export type PostStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "PUBLISHED"
  | "REJECTED";

export type Role = "AUTHOR" | "EDITOR";

const transitions: Record<PostStatus, Record<Role, PostStatus[]>> = {
  DRAFT: {
    AUTHOR: ["IN_REVIEW"],
    EDITOR: [],
  },
  IN_REVIEW: {
    AUTHOR: [],
    EDITOR: ["PUBLISHED", "REJECTED"],
  },
  REJECTED: {
    AUTHOR: ["DRAFT"],
    EDITOR: [],
  },
  PUBLISHED: {
    AUTHOR: [],
    EDITOR: [],
  },
};

export function canTransition(
  from: PostStatus,
  to: PostStatus,
  role: Role
): boolean {
  return transitions[from][role].includes(to);
}
