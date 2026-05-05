import { StatusBadge } from "@/components/ui/StatusBadge";

type TransactionLike = {
  id: string;
  amount: { toNumber: () => number } | number;
  status: string;
  createdAt?: Date;
};

type TransactionTableProps = {
  rows: TransactionLike[];
};

export function TransactionTable({ rows }: TransactionTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10">
      <table className="w-full text-left text-sm">
        <tbody className="divide-y divide-white/10 bg-slate-950/30 text-slate-200">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3 font-mono text-xs">{row.id}</td>
              <td className="px-4 py-3">{typeof row.amount === "number" ? row.amount : row.amount.toNumber()}</td>
              <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}