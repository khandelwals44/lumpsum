/**
 * PPF calculator (Public Provident Fund)
 * - Annual contribution (we model monthly for smooth charts)
 * - Interest is declared annually; we approximate monthly accrual at R/12
 */
export interface PpfPoint {
  month: number;
  invested: number;
  value: number;
}

export interface PpfResult {
  maturity: number;
  totalInvested: number;
  gains: number;
  series: PpfPoint[];
}

export function calculatePpf(
  monthlyContribution: number,
  annualRatePct: number,
  years: number
): PpfResult {
  const i = Math.max(0, annualRatePct) / 12 / 100;
  const n = Math.max(0, Math.floor(years * 12));
  let value = 0;
  const series: PpfPoint[] = [];
  for (let m = 1; m <= n; m++) {
    value = value * (1 + i) + monthlyContribution;
    series.push({ month: m, invested: monthlyContribution * m, value });
  }
  const totalInvested = monthlyContribution * n;
  return { maturity: value, totalInvested, gains: value - totalInvested, series };
}
