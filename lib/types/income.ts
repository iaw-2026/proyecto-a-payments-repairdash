/**
 * Interfaz para datos de gráficos de ingresos.
 *
 * No tiene un modelo Prisma correspondiente — se calcula
 * agregando transacciones por día.
 */

/** Un punto de datos para el gráfico de ingresos diarios */
export interface IncomeDataPoint {
  /** Label del eje X, e.g. "Lun", "Mar" */
  day: string;
  /** Monto total ingresado ese día */
  amount: number;
}
