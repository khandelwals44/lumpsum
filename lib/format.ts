/** Number and currency formatting helpers for en-IN */

export const formatINR = (value: number, options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    ...options
  }).format(isFinite(value) ? value : 0);

export const formatNumber = (value: number, options: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2, ...options }).format(
    isFinite(value) ? value : 0
  );

export function toCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (!rows || rows.length === 0) return "";
  const first = rows[0] as Record<string, unknown>;
  const headers = Object.keys(first);
  const escape = (val: unknown) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes("\n") || s.includes('"'))
      return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [headers.join(",")].concat(
    rows.map((r) => headers.map((h) => escape(r[h])).join(","))
  );
  return lines.join("\n");
}
