import type { IncomeDataPoint } from "@/lib/types/income";

/**
 * Datos mock para el dashboard del Driver.
 *
 * Estos mocks se usan mientras el modelo de datos no tenga
 * los campos necesarios (e.g. "total ganado del mes" requiere
 * agregar timestamps o un campo calculado en el schema).
 *
 * TODO: Reemplazar con queries reales de Prisma cuando el schema lo soporte.
 */

/** Total ganado en el mes actual (mock) */
export const MOCK_EARNED_THIS_MONTH = "187500.00";

/** Datos del gráfico de ingresos — últimos 7 días */
export const MOCK_INCOME_CHART: IncomeDataPoint[] = [
  { day: "Lun", amount: 24_300 },
  { day: "Mar", amount: 18_700 },
  { day: "Mié", amount: 31_200 },
  { day: "Jue", amount: 27_800 },
  { day: "Vie", amount: 42_100 },
  { day: "Sáb", amount: 35_600 },
  { day: "Dom", amount: 7_800 },
];
