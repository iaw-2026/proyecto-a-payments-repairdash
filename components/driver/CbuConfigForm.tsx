"use client";

import { useState, useTransition } from "react";
import { updateCbuCvuAction } from "@/app/actions/profile";
import toast from "react-hot-toast";

interface CbuConfigFormProps {
  initialCbuCvu: string;
}

export function CbuConfigForm({ initialCbuCvu }: CbuConfigFormProps) {
  const [cbuCvu, setCbuCvu] = useState(initialCbuCvu);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación cliente
    if (!/^\d{22}$/.test(cbuCvu)) {
      toast.error("El CBU/CVU debe tener exactamente 22 dígitos numéricos.");
      return;
    }

    startTransition(async () => {
      const result = await updateCbuCvuAction(cbuCvu);

      if (result.ok) {
        toast.success("Cuenta guardada exitosamente.");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir solo números y máximo 22 caracteres
    const value = e.target.value.replace(/\D/g, "").slice(0, 22);
    setCbuCvu(value);
  };

  const isEditing = Boolean(initialCbuCvu);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isEditing && (
        <div className="rounded-lg bg-warning/10 p-4 border border-warning/20">
          <p className="text-sm text-warning">
            Aún no tenés un CBU registrado. Ingresalo para poder retirar tus fondos.
          </p>
        </div>
      )}

      {isEditing && (
        <div className="rounded-lg bg-success/10 p-4 border border-success/20">
          <p className="text-sm text-success">
            Ya tenés un CBU registrado. Podés actualizarlo a continuación.
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="cbuCvu"
          className="mb-2 block text-sm font-medium text-secondary"
        >
          {isEditing ? "Nuevo CBU / CVU (22 dígitos)" : "CBU / CVU (22 dígitos)"}
        </label>
        <input
          type="text"
          id="cbuCvu"
          name="cbuCvu"
          value={cbuCvu}
          onChange={handleInputChange}
          placeholder="Ej: 0000003100000000000001"
          required
          maxLength={22}
          className="w-full rounded-lg border border-border bg-surface-elevated/40 px-4 py-3 font-mono text-foreground placeholder-muted/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <p className="mt-2 text-xs text-muted">
          Este es el CBU/CVU al que se enviarán tus retiros de fondos.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending || cbuCvu.length !== 22 || (isEditing && cbuCvu === initialCbuCvu)}
        className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isPending ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin text-accent-foreground"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Guardando...
          </>
        ) : isEditing ? (
          "Actualizar Cuenta"
        ) : (
          "Guardar Cuenta"
        )}
      </button>
    </form>
  );
}
