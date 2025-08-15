/**
 * GST calculator (India)
 * - For exclusive prices: tax = base * rate; gross = base + tax
 * - For inclusive prices: base = gross / (1 + rate); tax = gross - base
 * - Splits tax equally into CGST and SGST for intra-state illustration
 */

/**
 * GST calculation mode - exclusive or inclusive of tax.
 */
export type GstMode = "exclusive" | "inclusive";

/**
 * GST calculation breakdown with all components.
 */
export interface GstBreakup {
  base: number;
  tax: number;
  cgst: number;
  sgst: number;
  gross: number;
}

/**
 * Calculate GST components for a given amount and rate.
 * @param amount the base amount (exclusive) or gross amount (inclusive)
 * @param ratePct GST rate in percent (e.g., 18 for 18%)
 * @param mode whether amount is exclusive or inclusive of GST
 * @returns breakdown of base, tax, CGST, SGST, and gross amounts
 */
export function calculateGst(amount: number, ratePct: number, mode: GstMode): GstBreakup {
  const r = Math.max(0, ratePct) / 100;
  let base = 0;
  let tax = 0;
  let gross = 0;
  if (mode === "exclusive") {
    base = Math.max(0, amount);
    tax = base * r;
    gross = base + tax;
  } else {
    gross = Math.max(0, amount);
    base = gross / (1 + r);
    tax = gross - base;
  }
  const cgst = tax / 2;
  const sgst = tax / 2;
  return { base, tax, cgst, sgst, gross };
}
