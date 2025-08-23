/**
 * A datapoint for the NPS time series.
 */
export interface NpsPoint {
  month: number;
  invested: number;
  value: number;
}

/**
 * Results of an NPS calculation.
 */
export interface NpsResult {
  corpus: number;
  estimatedPension: number;
  series: NpsPoint[];
}

/**
 * Calculate NPS corpus and estimated monthly pension.
 * @param monthlyContribution amount contributed each month
 * @param years contribution period in years
 * @param preRetAnnualReturnPct pre-retirement annual return in percent
 * @param postRetAnnuityAnnualPct post-retirement annuity rate in percent
 * @returns corpus, estimated monthly pension, and time series
 */
export function calculateNps(
  monthlyContribution: number,
  years: number,
  preRetAnnualReturnPct: number,
  postRetAnnuityAnnualPct: number
): NpsResult {
  const i = Math.max(0, preRetAnnualReturnPct) / 12 / 100;
  const n = Math.max(0, Math.floor(years * 12));
  if (!isFinite(monthlyContribution) || monthlyContribution <= 0 || n === 0) {
    return { corpus: 0, estimatedPension: 0, series: [] };
  }

  let value = 0;
  const series: NpsPoint[] = [];
  for (let m = 1; m <= n; m++) {
    value = value * (1 + i) + monthlyContribution;
    series.push({ month: m, invested: monthlyContribution * m, value });
  }

  const corpus = value;
  const estimatedPension = corpus * (Math.max(0, postRetAnnuityAnnualPct) / 12 / 100);
  return { corpus, estimatedPension, series };
}
