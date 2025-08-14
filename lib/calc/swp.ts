/**
 * Systematic Withdrawal Plan (SWP) projection.
 * - Start with an initial corpus and withdraw a fixed amount each month
 * - Apply monthly growth on the remaining balance
 */
export interface SwpPoint {
  month: number;
  withdrawal: number;
  interest: number;
  balance: number;
}

export interface SwpResult {
  monthsSurvived: number;
  totalWithdrawn: number;
  totalInterest: number;
  endingBalance: number;
  series: SwpPoint[];
}

export function calculateSwp(
  initialCorpus: number,
  monthlyWithdrawal: number,
  annualReturnPct: number,
  years: number
): SwpResult {
  const i = Math.max(0, annualReturnPct) / 12 / 100;
  const nMax = Math.max(0, Math.floor(years * 12));
  let balance = Math.max(0, initialCorpus);
  const series: SwpPoint[] = [];
  let totalWithdrawn = 0;
  let totalInterest = 0;
  let m = 0;

  while (m < nMax && balance > 0) {
    m += 1;
    const interest = balance * i;
    balance += interest;
    const wd = Math.min(monthlyWithdrawal, balance);
    balance -= wd;
    series.push({ month: m, withdrawal: wd, interest, balance });
    totalWithdrawn += wd;
    totalInterest += interest;
  }

  return {
    monthsSurvived: m,
    totalWithdrawn,
    totalInterest,
    endingBalance: balance,
    series
  };
}
