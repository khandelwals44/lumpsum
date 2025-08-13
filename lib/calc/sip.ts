export interface SipPoint {
  month: number;
  invested: number;
  value: number;
}

export interface SipResult {
  maturity: number;
  totalInvested: number;
  gains: number;
  series: SipPoint[];
}

/** Monthly SIP with monthly compounding */
export function calculateSip(
  monthlyInvestment: number,
  annualReturnPct: number,
  years: number
): SipResult {
  const i = Math.max(0, annualReturnPct) / 12 / 100;
  const n = Math.max(0, Math.floor(years * 12));
  if (!isFinite(monthlyInvestment) || monthlyInvestment <= 0 || n === 0) {
    return { maturity: 0, totalInvested: 0, gains: 0, series: [] };
  }

  let value = 0;
  const series: SipPoint[] = [];
  for (let m = 1; m <= n; m++) {
    value = value * (1 + i) + monthlyInvestment;
    series.push({ month: m, invested: monthlyInvestment * m, value });
  }

  let maturity = value;
  if (i !== 0) {
    const maturityFormula = monthlyInvestment * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
    maturity = maturityFormula;
  }

  const totalInvested = monthlyInvestment * n;
  const gains = maturity - totalInvested;
  return { maturity, totalInvested, gains, series };
}
