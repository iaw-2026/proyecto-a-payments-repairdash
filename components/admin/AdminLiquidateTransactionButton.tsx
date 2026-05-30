"use client";

import type { FormEvent } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { liquidateAdminTransaction } from "@/app/actions/admin";

const buttonClassName =
  "rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition hover:bg-success/15 disabled:cursor-wait disabled:opacity-60";

export function AdminLiquidateTransactionButton({
  transactionId,
  className = "",
}: {
  transactionId: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await liquidateAdminTransaction(formData);

      if (result.ok) {
        toast.success(result.message);
      }

      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input type="hidden" name="transactionId" value={transactionId} />
      <button type="submit" disabled={isPending} className={buttonClassName}>
        {isPending ? "Liquidando..." : "Liquidar"}
      </button>
    </form>
  );
}
