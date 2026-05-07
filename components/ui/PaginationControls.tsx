"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
}

/**
 * Componente de paginación reutilizable.
 * Actualiza la URL manteniendo otros parámetros de búsqueda existentes.
 */
export function PaginationControls({
  currentPage,
  totalPages,
}: PaginationControlsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Crea una nueva URL de navegación preservando los searchParams actuales
   * y actualizando solo el parámetro 'page'.
   */
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-between" aria-label="Paginación">
      <p className="text-sm text-muted">
        Página{" "}
        <span className="font-semibold text-secondary">{currentPage}</span> de{" "}
        <span className="font-semibold text-secondary">{totalPages}</span>
      </p>

      <div className="flex gap-2">
        {/* Botón Anterior */}
        {currentPage > 1 ? (
          <Link
            href={createPageURL(currentPage - 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/60 px-4 py-2 text-sm font-medium text-secondary transition-all hover:border-accent/40 hover:bg-surface-elevated/40 hover:text-foreground"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
            Anterior
          </Link>
        ) : (
          <button
            disabled
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-border/50 bg-surface/30 px-4 py-2 text-sm font-medium text-muted/50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
            Anterior
          </button>
        )}

        {/* Botón Siguiente */}
        {currentPage < totalPages ? (
          <Link
            href={createPageURL(currentPage + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/60 px-4 py-2 text-sm font-medium text-secondary transition-all hover:border-accent/40 hover:bg-surface-elevated/40 hover:text-foreground"
          >
            Siguiente
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </Link>
        ) : (
          <button
            disabled
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-border/50 bg-surface/30 px-4 py-2 text-sm font-medium text-muted/50"
          >
            Siguiente
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        )}
      </div>
    </nav>
  );
}
