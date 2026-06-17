"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { requestWithdrawal } from "@/app/actions/withdrawals";
import { Modal } from "@/components/ui/Modal";
import { formatARS } from "@/lib/money";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  balanceAvailable: string;
}

function parseMoneyCents(value: string): bigint | null {
  const normalized = value.trim().replace(",", ".");

  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) {
    return null;
  }

  const [integer, fraction = ""] = normalized.split(".");
  return BigInt(integer) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
}

export function WithdrawalModal({ isOpen, onClose, balanceAvailable }: WithdrawalModalProps) {
  const [amount, setAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  const zeroCents = BigInt(0);
  const availableCents = parseMoneyCents(balanceAvailable) ?? zeroCents;
  const amountCents = parseMoneyCents(amount);
  const isBalanceZero = availableCents <= zeroCents;
  const isAmountInvalid = amountCents === null || amountCents <= zeroCents || amountCents > availableCents;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const result = await requestWithdrawal(amount);

        if (result.ok) {
          toast.success(
            () => (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mb-1 text-xl font-bold text-success">Retiro exitoso</div>
                <div className="text-sm text-secondary">Dinero enviado a CVU:</div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-mono text-accent">
                  {result.cbuCvu}
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight">
                  {result.amountFormatted}
                </div>
              </div>
            ),
            { duration: 6000 },
          );
          setAmount("");
          onClose();
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error("No se pudo procesar el retiro. Intenta de nuevo.");
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Solicitar Retiro">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted">
            Monto a retirar
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-muted">
              $
            </span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={isPending || isBalanceZero}
              className="w-full rounded-xl border border-border bg-background py-4 pl-10 pr-4 text-2xl font-bold text-foreground placeholder:text-muted/30 transition-all focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
              autoFocus
            />
          </div>
          <p className="mt-3 text-sm text-secondary">
            Disponible: <span className="font-semibold text-success">{formatARS(balanceAvailable)}</span>
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending || isAmountInvalid || isBalanceZero}
            className={`w-full rounded-xl py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
              isPending || isAmountInvalid || isBalanceZero
                ? "cursor-not-allowed border border-border bg-muted/10 text-muted"
                : "bg-accent text-accent-foreground shadow-lg hover:bg-accent-hover hover:shadow-[0_0_25px_rgba(245,0,241,0.4)]"
            }`}
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin text-accent-foreground" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando...
              </div>
            ) : (
              "Confirmar Retiro"
            )}
          </button>

          {isBalanceZero && (
            <p className="mt-4 text-center text-xs font-medium text-danger">
              No tenes saldo disponible para retirar.
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
