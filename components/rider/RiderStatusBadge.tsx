import { TransactionStatus } from "@/generated/prisma/client";

function getStatusClassName(status: TransactionStatus) {
  const statusStyles: Record<TransactionStatus, string> = {
    PENDING: "border-warning/20 bg-warning/10 text-warning",
    RESERVED: "border-success/20 bg-success/10 text-success",
    LIQUIDATED: "border-success/20 bg-success/10 text-success",
    DISPUTED: "border-danger/20 bg-danger/10 text-danger",
    REFUNDED: "border-muted/20 bg-muted/10 text-muted",
    FAILED: "border-danger/20 bg-danger/10 text-danger",
  };

  return statusStyles[status];
}

export function RiderStatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wider ${getStatusClassName(status)}`}
    >
      {status}
    </span>
  );
}
