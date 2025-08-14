/**
 * Simplified Income Tax calculator (India) – FY 2024-25 new regime (illustrative only)
 * NOTE: This is a simplified slab model for educational purposes. Always verify with official rules.
 */

export interface TaxBreakup {
  slab: string;
  tax: number;
}
export interface TaxResult {
  taxableIncome: number;
  taxPayable: number;
  cess: number;
  totalTax: number;
  breakup: TaxBreakup[];
}

export function calculateIncomeTaxNewRegime(
  grossIncome: number,
  deductions: number = 0
): TaxResult {
  const income = Math.max(0, grossIncome - Math.max(0, deductions));
  const slabs: { upto: number; rate: number }[] = [
    { upto: 300000, rate: 0 },
    { upto: 700000, rate: 5 },
    { upto: 1000000, rate: 10 },
    { upto: 1200000, rate: 15 },
    { upto: 1500000, rate: 20 },
    { upto: Infinity, rate: 30 }
  ];

  let prev = 0;
  let tax = 0;
  const breakup: TaxBreakup[] = [];
  for (const s of slabs) {
    const span = Math.max(0, Math.min(income, s.upto) - prev);
    if (span > 0) {
      const part = (span * s.rate) / 100;
      tax += part;
      breakup.push({
        slab: `${prev + 1}-${s.upto === Infinity ? "∞" : s.upto} @ ${s.rate}%`,
        tax: part
      });
      prev = s.upto;
    }
  }
  const cess = tax * 0.04; // 4% health and education cess
  return { taxableIncome: income, taxPayable: tax, cess, totalTax: tax + cess, breakup };
}
