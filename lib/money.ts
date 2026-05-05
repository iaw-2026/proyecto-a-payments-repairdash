export type DecimalLike = { toNumber: () => number } | number | null | undefined;

export function formatARS(value: DecimalLike) {
  const amount = typeof value === "number" ? value : value?.toNumber?.() ?? 0;

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(amount);
}