/**
 * XIRR (extended IRR) for irregular cash flows using Newton-Raphson.
 * Cash flows: array of { date: Date, amount: number } where investments are negative, redemptions positive.
 * Returns annualized rate in percent.
 */

/**
 * A single cash flow entry with date and amount.
 */
export interface CashFlow {
  date: Date;
  amount: number;
}

/**
 * Calculate days between two dates.
 */
function daysBetween(a: Date, b: Date): number {
  return (a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * Calculate XIRR (Extended Internal Rate of Return) using Newton-Raphson method.
 * @param cashflows array of cash flows with dates and amounts
 * @param guessPct initial guess for the rate in percent (default: 10)
 * @returns annualized rate in percent
 */
export function xirr(cashflows: CashFlow[], guessPct = 10): number {
  if (cashflows.length < 2) return 0;
  const cf = cashflows.slice().sort((a, b) => a.date.getTime() - b.date.getTime());
  const d0 = cf[0]?.date ?? new Date();

  // Convert guess to rate per day
  let rate = guessPct / 100;
  const maxIter = 100;
  const tol = 1e-7;

  for (let iter = 0; iter < maxIter; iter++) {
    let f = 0;
    let df = 0;
    for (const c of cf) {
      const t = daysBetween(c.date, d0) / 365;
      const v = Math.pow(1 + rate, t);
      f += c.amount / v;
      df += (-t * c.amount) / (v * (1 + rate));
    }
    const newRate = rate - f / df;
    if (!isFinite(newRate)) break;
    if (Math.abs(newRate - rate) <= tol) {
      rate = newRate;
      break;
    }
    rate = newRate;
  }
  return rate * 100; // percent
}

/**
 * Parse cashflows from a compact URL param, e.g.
 * cf=2024-01-01:-100000|2024-12-31:112000
 * @param sp URLSearchParams or similar object
 * @param key parameter name to look for
 * @returns array of parsed cash flows
 */
export function parseParamCashflows(
  sp: URLSearchParams | { get: (k: string) => string | null } | null,
  key: string
): CashFlow[] {
  if (!sp) return [];
  const raw = sp.get(key);
  if (!raw) return [];
  const parts = raw.split(/\|/g);
  const flows: CashFlow[] = [];
  for (const p of parts) {
    const [d, a] = p.split(":");
    if (!d || !a) continue;
    const date = new Date(d);
    const amount = Number(a);
    if (!isFinite(amount) || isNaN(date.getTime())) continue;
    flows.push({ date, amount });
  }
  return flows;
}
