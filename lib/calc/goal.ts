export interface GoalPoint {
  month: number;
  requiredCorpus: number;
}

export interface GoalResult {
  inflatedGoal: number;
  requiredSIP: number;
  requiredLumpsum: number;
  series: GoalPoint[];
}

export function calculateGoal(
  goalToday: number,
  years: number,
  inflationPct: number,
  annualReturnPct: number
): GoalResult {
  const y = Math.max(0, years);
  const iInfl = Math.max(0, inflationPct) / 100;
  const i = Math.max(0, annualReturnPct) / 12 / 100;
  const n = Math.max(0, Math.floor(y * 12));

  if (!isFinite(goalToday) || goalToday <= 0 || n === 0) {
    return { inflatedGoal: 0, requiredSIP: 0, requiredLumpsum: 0, series: [] };
  }

  const inflatedGoal = goalToday * Math.pow(1 + iInfl, y);

  let requiredSIP = 0;
  if (i === 0) {
    requiredSIP = inflatedGoal / n;
  } else {
    requiredSIP = inflatedGoal / (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
  }

  const requiredLumpsum = inflatedGoal / Math.pow(1 + i, n);

  const series: GoalPoint[] = [];
  for (let m = 1; m <= n; m++) {
    const monthsRemaining = n - m;
    const corpusNeeded = inflatedGoal / Math.pow(1 + i, monthsRemaining);
    series.push({ month: m, requiredCorpus: corpusNeeded });
  }

  return { inflatedGoal, requiredSIP, requiredLumpsum, series };
}
