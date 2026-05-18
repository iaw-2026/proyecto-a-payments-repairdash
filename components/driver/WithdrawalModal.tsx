"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { requestWithdrawal } from "@/app/actions/withdrawals";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  balanceAvailable: string; // Recibimos como string
}

export function WithdrawalModal({ isOpen, onClose, balanceAvailable }: WithdrawalModalProps) {
  const [amount, setAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  // Convertimos a número para validaciones en el cliente
  const availableNumber = parseFloat(balanceAvailable) || 0;
  const amountNumber = parseFloat(amount) || 0;
  const isBalanceZero = availableNumber <= 0;
  const isAmountInvalid = amountNumber <= 0 || amountNumber > availableNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const result = await requestWithdrawal(amountNumber);

        if (result.ok) {
          toast.success(
            () => (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="text-xl font-bold text-success mb-1">¡Retiro Exitoso!</div>
                <div className="text-sm text-secondary">
                  Dinero enviado a CVU:
                </div>
                <div className="font-mono text-accent bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                  {result.cbuCvu}
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight">
                  {result.amountFormatted}
                </div>
              </div>
            ),
            { duration: 6000 }
          );
          setAmount("");
          onClose();
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error("No se pudo procesar el retiro. Intentá de nuevo.");
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Solicitar Retiro">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-widest block mb-2">
            Monto a retirar
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">
              $
            </span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={isPending || isBalanceZero}
              className="w-full rounded-xl border border-border bg-background py-4 pl-10 pr-4 text-2xl font-bold text-foreground placeholder:text-muted/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all disabled:opacity-50"
              autoFocus
            />
          </div>
          <p className="mt-3 text-sm text-secondary">
            Disponible: <span className="font-semibold text-success">${availableNumber.toLocaleString("es-AR")}</span>
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending || isAmountInvalid || isBalanceZero}
            className={`w-full rounded-xl py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300
              ${
                isPending || isAmountInvalid || isBalanceZero
                  ? "bg-muted/10 text-muted cursor-not-allowed border border-border"
                  : "bg-accent text-accent-foreground hover:bg-accent-hover hover:shadow-[0_0_25px_rgba(245,0,241,0.4)] shadow-lg"
              }`}
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-accent-foreground" fill="none" viewBox="0 0 24 24">
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
            <p className="mt-4 text-center text-xs text-danger font-medium">
              No tenés saldo disponible para retirar.
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
