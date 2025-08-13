export interface FdPoint {
  year: number;
  value: number;
}

export interface FdResult {
  maturity: number;
  interestEarned: number;
  series: FdPoint[];
}

export function calculateFd(
  principal: number,
  annualRatePct: number,
  years: number,
  m = 4
): FdResult {
  const freq = Math.max(1, Math.floor(m));
  const i = Math.max(0, annualRatePct) / (100 * freq);
  const n = Math.max(0, Math.floor(freq * years));
  if (!isFinite(principal) || principal <= 0 || n === 0)
    return { maturity: 0, interestEarned: 0, series: [] };

  const maturity = principal * Math.pow(1 + i, n);
  const interestEarned = maturity - principal;

  const series: FdPoint[] = [];
  for (let y = 1; y <= Math.ceil(years); y++) {
    const steps = Math.min(n, y * freq);
    const value = principal * Math.pow(1 + i, steps);
    series.push({ year: y, value });
  }

  return { maturity, interestEarned, series };
}
