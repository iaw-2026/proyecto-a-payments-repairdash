export type DecimalLike = { toString: () => string } | string | null | undefined;

export function formatARS(value: DecimalLike) {
  const normalized = value?.toString() ?? "0";
  const [rawInteger = "0", rawFraction = ""] = normalized.split(".");
  const isNegative = rawInteger.startsWith("-");
  const integer = isNegative ? rawInteger.slice(1) : rawInteger;
  const fraction = rawFraction.padEnd(2, "0").slice(0, 2);
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `$ ${isNegative ? "-" : ""}${formattedInteger},${fraction}`;
}
