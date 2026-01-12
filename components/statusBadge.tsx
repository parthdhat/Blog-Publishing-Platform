type Props = {
  status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "REJECTED";
};

export function StatusBadge({ status }: Props) {
  const color =
    status === "DRAFT"
      ? "#999"
      : status === "IN_REVIEW"
      ? "#f0ad4e"
      : status === "PUBLISHED"
      ? "#5cb85c"
      : "#d9534f";

  return (
    <span
      style={{
        padding: "0.2rem 0.5rem",
        borderRadius: "4px",
        background: color,
        color: "white",
        fontSize: "0.8rem",
      }}
    >
      {status}
    </span>
  );
}
