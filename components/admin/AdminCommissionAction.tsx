"use client";

import { useActionState, useState } from "react";
import { updateAdminCommissionRate } from "@/app/actions/admin";
import { Modal } from "@/components/ui/Modal";

type AdminCommissionActionProps = {
  currentRate: string;
};

const initialState = {
  ok: false,
  message: "",
};

function SubmitButton() {
  return (
    <button
      type="submit"
      className="w-full rounded-xl bg-accent py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_0_25px_rgba(245,0,241,0.4)]"
    >
      Guardar comision
    </button>
  );
}

export function AdminCommissionAction({
  currentRate,
}: AdminCommissionActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateAdminCommissionRate,
    initialState,
  );

  return (
    <>
      <div className="flex flex-col justify-between rounded-xl border border-border bg-surface/70 p-5 backdrop-blur transition-all hover:bg-surface-elevated sm:p-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-muted">
            Accion rapida
          </p>
          <h3 className="mt-2 text-xl font-bold text-foreground">
            Modificar comision
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-secondary">
            Ajusta el porcentaje que se aplicara a las proximas liquidaciones.
          </p>
          <p className="mt-4 font-mono text-2xl font-bold text-accent sm:mt-5 sm:text-3xl">
            {currentRate}%
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(245,0,241,0.25)]"
        >
          Modificar
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-2 h-4 w-4"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modificar comision"
      >
        <form action={formAction} className="space-y-6">
          <div>
            <label
              htmlFor="commissionRate"
              className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted"
            >
              Nuevo porcentaje
            </label>
            <div className="relative">
              <input
                id="commissionRate"
                name="commissionRate"
                type="text"
                inputMode="decimal"
                defaultValue={currentRate}
                disabled={isPending}
                className="w-full rounded-xl border border-border bg-background py-4 pl-4 pr-12 font-mono text-2xl font-bold text-foreground placeholder:text-muted/30 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-lg text-muted">
                %
              </span>
            </div>
            <p className="mt-3 text-sm text-secondary">
              Afecta solo pagos que todavia no fueron liquidados.
            </p>
          </div>

          {state.message ? (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                state.ok
                  ? "border-success/20 bg-success/10 text-success"
                  : "border-danger/20 bg-danger/10 text-danger"
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <div className={isPending ? "pointer-events-none opacity-70" : ""}>
            <SubmitButton />
          </div>
        </form>
      </Modal>
    </>
  );
}
