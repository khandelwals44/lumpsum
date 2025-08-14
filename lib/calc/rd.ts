/**
 * Recurring Deposit (RD) calculator
 * - Monthly deposit grows at fixed rate with compounding monthly
 */
export interface RdPoint {
  month: number;
  invested: number;
  value: number;
}

export interface RdResult {
  maturity: number;
  totalInvested: number;
  interestEarned: number;
  series: RdPoint[];
}

export function calculateRd(
  monthlyDeposit: number,
  annualRatePct: number,
  years: number
): RdResult {
  const i = Math.max(0, annualRatePct) / 12 / 100;
  const n = Math.max(0, Math.floor(years * 12));
  let value = 0;
  const series: RdPoint[] = [];
  for (let m = 1; m <= n; m++) {
    value = value * (1 + i) + monthlyDeposit;
    series.push({ month: m, invested: monthlyDeposit * m, value });
  }
  const totalInvested = monthlyDeposit * n;
  return { maturity: value, totalInvested, interestEarned: value - totalInvested, series };
}
