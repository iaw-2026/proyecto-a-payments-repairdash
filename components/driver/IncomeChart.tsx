"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatARS } from "@/lib/money";
import type { IncomeDataPoint } from "@/lib/types/income";

interface IncomeChartProps {
  data: IncomeDataPoint[];
}

/** Formatea valores del eje Y en formato compacto (e.g. "25K") */
function formatCompact(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
}

function getTooltipAmount(item: unknown) {
  if (!item || typeof item !== "object" || !("payload" in item)) {
    return "0.00";
  }

  return (item as { payload?: IncomeDataPoint }).payload?.amount ?? "0.00";
}

/**
 * Gráfico de área que muestra ingresos de los últimos 7 días.
 *
 * Usa Recharts con un gradiente magenta acorde al design system.
 * Es un Client Component porque Recharts necesita el DOM para renderizar SVGs.
 */
export function IncomeChart({ data }: IncomeChartProps) {
  return (
    <div className="rounded-xl border border-border bg-surface/70 p-6 backdrop-blur">
      <div className="mb-6">
        <p className="text-sm font-medium text-muted uppercase tracking-wider">
          Ingresos
        </p>
        <h2 className="mt-1 text-xl font-bold text-foreground">
          Últimos 7 días
        </h2>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F500F1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#F500F1" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(141, 98, 165, 0.15)"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#BE97D5", fontSize: 12, fontWeight: 500 }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={formatCompact}
              tick={{ fill: "#BE97D5", fontSize: 12 }}
              width={45}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#321442",
                border: "1px solid rgba(141, 98, 165, 0.3)",
                borderRadius: "0.5rem",
                color: "#FFFFFF",
                fontSize: "0.875rem",
              }}
              labelStyle={{ color: "#C392DD", fontWeight: 500 }}
              formatter={(_, __, item) => [
                formatARS(getTooltipAmount(item)),
                "Ingreso",
              ]}
            />

            <Area
              type="monotone"
              dataKey="chartAmount"
              stroke="#F500F1"
              strokeWidth={2}
              fill="url(#incomeGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#F500F1",
                stroke: "#271033",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
