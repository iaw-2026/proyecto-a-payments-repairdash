import { TransactionStatus, WithdrawalStatus } from "@/generated/prisma/client";

type SupportedStatus = TransactionStatus | WithdrawalStatus;

const STATUS_CONFIG: Record<
  SupportedStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  PENDING: {
    label: "Pendiente",
    dotClass: "bg-warning",
    badgeClass: "border-warning/20 bg-warning/10 text-warning",
  },
  RESERVED: {
    label: "Reservada",
    dotClass: "bg-accent",
    badgeClass: "border-accent/20 bg-accent-subtle text-accent",
  },
  LIQUIDATED: {
    label: "Liquidada",
    dotClass: "bg-success",
    badgeClass: "border-success/20 bg-success/10 text-success",
  },
  DISPUTED: {
    label: "En disputa",
    dotClass: "bg-danger",
    badgeClass: "border-danger/20 bg-danger/10 text-danger",
  },
  REFUNDED: {
    label: "Reembolsada",
    dotClass: "bg-muted",
    badgeClass: "border-border bg-surface-elevated/40 text-secondary",
  },
  FAILED: {
    label: "Fallida",
    dotClass: "bg-danger",
    badgeClass: "border-danger/20 bg-danger/10 text-danger",
  },
  REQUESTED: {
    label: "Solicitado",
    dotClass: "bg-warning",
    badgeClass: "border-warning/20 bg-warning/10 text-warning",
  },
  APPROVED: {
    label: "Transferido",
    dotClass: "bg-success",
    badgeClass: "border-success/20 bg-success/10 text-success",
  },
  REJECTED: {
    label: "Rechazado",
    dotClass: "bg-danger",
    badgeClass: "border-danger/20 bg-danger/10 text-danger",
  },
};

export function AdminStatusBadge({ status }: { status: SupportedStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
