/**
 * A datapoint for the FD time series (yearly values).
 */
export interface FdPoint {
  year: number;
  value: number;
}

/**
 * Results of a fixed deposit calculation.
 */
export interface FdResult {
  maturity: number;
  interestEarned: number;
  series: FdPoint[];
}

/**
 * Calculate future value of a fixed deposit with compound interest.
 * @param principal initial amount invested
 * @param annualRatePct annual interest rate in percent
 * @param years investment horizon in years
 * @param m compounding frequency per year (default: 4 for quarterly)
 * @returns maturity value, interest earned, and yearly time series
 */
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
