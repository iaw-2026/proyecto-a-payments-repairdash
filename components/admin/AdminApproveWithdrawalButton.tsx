"use client";

import type { FormEvent } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { approveAdminWithdrawal } from "@/app/actions/admin";

const buttonClassName =
  "rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition hover:bg-success/15 disabled:cursor-wait disabled:opacity-60";

export function AdminApproveWithdrawalButton({
  withdrawalId,
}: {
  withdrawalId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await approveAdminWithdrawal(formData);

      if (result.ok) {
        toast.success(result.message);
      }

      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="withdrawalId" value={withdrawalId} />
      <button type="submit" disabled={isPending} className={buttonClassName}>
        {isPending ? "Aprobando..." : "Aprobar"}
      </button>
    </form>
  );
}
