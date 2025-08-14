/**
 * Step-up SIP Calculator
 * - Base monthly amount increases by stepUpPercent each year
 * - Compounding monthly at expected annual return
 */
export interface StepUpSipPoint {
  month: number;
  invested: number;
  contribution: number;
  value: number;
}

export interface StepUpSipResult {
  maturity: number;
  totalInvested: number;
  gains: number;
  series: StepUpSipPoint[];
}

export function calculateStepUpSip(
  baseMonthly: number,
  annualReturnPct: number,
  years: number,
  stepUpPercentPerYear: number
): StepUpSipResult {
  const i = Math.max(0, annualReturnPct) / 12 / 100;
  const n = Math.max(0, Math.floor(years * 12));
  const s = Math.max(0, stepUpPercentPerYear) / 100;

  let value = 0;
  const series: StepUpSipPoint[] = [];
  let totalInvested = 0;
  for (let m = 1; m <= n; m++) {
    const yearIndex = Math.floor((m - 1) / 12);
    const contribution = baseMonthly * Math.pow(1 + s, yearIndex);
    value = value * (1 + i) + contribution;
    totalInvested += contribution;
    series.push({ month: m, invested: totalInvested, contribution, value });
  }
  return { maturity: value, totalInvested, gains: value - totalInvested, series };
}
