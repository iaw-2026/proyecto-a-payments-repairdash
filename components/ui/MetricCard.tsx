import type { ReactNode } from "react";

export interface MetricCardProps {
  /** Icono o elemento visual a la izquierda */
  icon: ReactNode;
  /** Label descriptivo (e.g. "Saldo Disponible") */
  label: string;
  /** Valor principal formateado (e.g. "$24.300,00") */
  value: string;
  /** Color del valor: usa clases de Tailwind (e.g. "text-success", "text-accent") */
  valueColor?: string;
  /** Texto secundario debajo del valor (opcional) */
  subtitle?: string;
}

/**
 * Tarjeta de métrica reutilizable para dashboards.
 *
 * Diseñada con densidad espaciosa, border radius contenido (0.75rem)
 * y la paleta purple/magenta del design system.
 */
export function MetricCard({
  icon,
  label,
  value,
  valueColor = "text-foreground",
  subtitle,
}: MetricCardProps) {
  return (
    <div className="relative rounded-xl border border-border bg-surface overflow-hidden transition-all hover:border-muted/50 hover:bg-surface-elevated">
      {/* Accent top strip */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-accent opacity-70" />

      <div className="p-6">
        {/* Icon + Label */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle text-accent">
            {icon}
          </div>
          <p className="text-xs font-semibold text-muted uppercase tracking-widest">
            {label}
          </p>
        </div>

        {/* Value — color por tipo de métrica */}
        <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>
          {value}
        </p>

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
