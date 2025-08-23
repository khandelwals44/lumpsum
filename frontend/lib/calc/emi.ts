/**
 * EMI calculator
 * Inputs: principal (₹), annual rate %, tenure months
 * Returns: EMI amount, totals, and an amortization schedule for charts/tables
 *
 * Keep this file pure (no UI or formatting). This helps testing and reuse.
 */
export interface EmiPoint {
  month: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface EmiResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  schedule: EmiPoint[];
}

/**
 * Calculate EMI schedule.
 * r = r_annual/12/100
 * EMI = P * r * (1 + r)^n / ((1 + r)^n − 1)
 */
export function calculateEmi(principal: number, annualRatePct: number, months: number): EmiResult {
  const n = Math.max(0, Math.floor(months));
  const r = Math.max(0, annualRatePct) / 12 / 100;
  if (!isFinite(principal) || principal <= 0 || n === 0) {
    return { emi: 0, totalInterest: 0, totalPayment: 0, schedule: [] };
  }

  let emi = 0;
  if (r === 0) {
    emi = principal / n;
  } else {
    const pow = Math.pow(1 + r, n);
    emi = (principal * r * pow) / (pow - 1);
  }

  let balance = principal;
  let totalInterest = 0;
  const schedule: EmiPoint[] = [];
  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    const principalComp = Math.min(emi - interest, balance);
    balance = Math.max(0, balance - principalComp);
    totalInterest += interest;
    schedule.push({ month: m, principal: principalComp, interest, balance });
  }

  const totalPayment = principal + totalInterest;
  return { emi, totalInterest, totalPayment, schedule };
}
