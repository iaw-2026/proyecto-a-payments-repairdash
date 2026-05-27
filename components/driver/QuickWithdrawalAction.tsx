"use client";

import { useState } from "react";
import { WithdrawalModal } from "./WithdrawalModal";

interface QuickWithdrawalActionProps {
  balanceAvailable: string; // Recibimos string para evitar problemas de serialización
}

export function QuickWithdrawalAction({ balanceAvailable }: QuickWithdrawalActionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col justify-between rounded-xl border border-border bg-surface/70 p-6 backdrop-blur transition-all hover:bg-surface-elevated">
        <div>
          <p className="text-sm font-medium text-muted uppercase tracking-wider">
            Acción rápida
          </p>
          <h2 className="mt-2 text-xl font-bold text-foreground">
            Solicitar retiro
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-secondary">
            Retirá fondos de tu saldo disponible a tu cuenta bancaria registrada.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(245,0,241,0.25)]"
        >
          Iniciar Retiro
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-2 w-4 h-4"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <WithdrawalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        balanceAvailable={balanceAvailable}
      />
    </>
  );
}
