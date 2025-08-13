export interface LumpsumPoint {
  month: number;
  value: number;
}

export interface LumpsumResult {
  futureValue: number;
  gains: number;
  series: LumpsumPoint[];
}

export function calculateLumpsum(
  principal: number,
  annualReturnPct: number,
  years: number
): LumpsumResult {
  const i = Math.max(0, annualReturnPct) / 12 / 100;
  const n = Math.max(0, Math.floor(years * 12));
  if (!isFinite(principal) || principal <= 0 || n === 0)
    return { futureValue: 0, gains: 0, series: [] };

  const series: LumpsumPoint[] = [];
  let value = principal;
  for (let m = 1; m <= n; m++) {
    value = value * (1 + i);
    series.push({ month: m, value });
  }
  const futureValue = principal * Math.pow(1 + i, n);
  const gains = futureValue - principal;
  return { futureValue, gains, series };
}
