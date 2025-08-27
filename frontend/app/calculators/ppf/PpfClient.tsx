"use client";
import { useMemo, useState } from "react";
import { calculatePpf } from "@/lib/calc/ppf";
import { SliderWithInput } from "@/components/SliderWithInput";
import { ResultStat } from "@/components/ResultStat";
import { ShareButton } from "@/components/ShareButton";
import { ChartContainer } from "@/components/ChartContainer";
import { Line, LineChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "@/lib/charts";
import { useSearchParams } from "next/navigation";
import { parseParamNumber, useUrlState } from "@/lib/url";
import { formatINR } from "@/lib/format";
import { FadeIn } from "@/components/FadeIn";
import { saveLocal, loadLocal } from "@/lib/persist";
import { Api, getAuthToken } from "@/lib/api";
import { Calculation, SavedCalculation } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
export default function PpfClient() {
  const sp = useSearchParams();
  const [monthly, setMonthly] = useState(parseParamNumber(sp, "m", 5000));
  const [rate, setRate] = useState(parseParamNumber(sp, "r", 7.1));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 15));
  useUrlState({ m: monthly, r: rate, y: years });

  const STORAGE_KEY = "savedCalculations"; // Define STORAGE_KEY

  const result = useMemo(() => calculatePpf(monthly, rate, years), [monthly, rate, years]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <FadeIn>
        <section className="space-y-4">
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">PPF Calculator</h1>
              <ShareButton />
            </div>
            <div className="mt-4 space-y-4">
              <SliderWithInput
                label="Monthly contribution"
                value={monthly}
                onChange={setMonthly}
                min={500}
                max={150000}
                step={500}
                suffix="₹"
              />
              <SliderWithInput
                label="Interest rate (p.a.)"
                value={rate}
                onChange={setRate}
                min={0}
                max={12}
                step={0.1}
                suffix="%"
              />
              <SliderWithInput
                label="Duration (years)"
                value={years}
                onChange={setYears}
                min={1}
                max={15}
                step={1}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const newCalculation: Calculation = {
                type: "ppf",
                inputs: { monthly, rate, years },
                results: {
                  maturity: result.maturity,
                  totalInvested: result.totalInvested,
                  gains: result.gains
                },
                timestamp: Date.now()
              };
              const savedCalculations = loadLocal<SavedCalculation[]>(STORAGE_KEY, []);
              saveLocal(STORAGE_KEY, [...savedCalculations, { ...newCalculation, id: uuidv4() }]);
              if (getAuthToken() && process.env.NEXT_PUBLIC_API_BASE_URL) {
                Api.saveCalculation(
                  newCalculation.type,
                  newCalculation.inputs,
                  newCalculation.results
                ).catch(() => {});
              }
              alert("Calculation saved!");
            }}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Save Calculation
          </button>
          <div className="grid grid-cols-2 gap-3">
            <ResultStat label="Maturity" value={result.maturity} currency />
            <ResultStat label="Total Invested" value={result.totalInvested} currency />
            <ResultStat label="Gains" value={result.gains} currency />
          </div>
        </section>
      </FadeIn>
      <FadeIn>
        <section className="space-y-4">
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-lg font-medium">Growth over time</h2>
            <ChartContainer>
              <LineChart data={result.series} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => formatINR(v as number)} />
                <Tooltip formatter={(v) => formatINR(v as number)} />
                <Legend />
                <Line
                  dataKey="invested"
                  type="monotone"
                  stroke={chartColors.invested}
                  name="Invested"
                  dot={false}
                />
                <Line
                  dataKey="value"
                  type="monotone"
                  stroke={chartColors.value}
                  name="Value"
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </section>
      </FadeIn>
      {/* Educational content: what, how, steps, and FAQ */}
      <article className="prose mt-4 dark:prose-invert md:col-span-2">
        <FadeIn delay={0.2}>
          <details open>
            <summary>What is PPF?</summary>
            <p>
              PPF (Public Provident Fund) is a popular long-term investment option in India, backed
              by the government. It offers tax benefits, guaranteed returns, and a lock-in period,
              making it suitable for retirement planning or long-term financial goals.
            </p>
          </details>
        </FadeIn>
        <FadeIn delay={0.3}>
          <details>
            <summary>How it works (formula)</summary>
            <p>
              PPF interest is compounded annually and calculated on the lowest balance between the
              5th day and the last day of each month. Deposits made before the 5th of a month earn
              interest for that month.
            </p>
            <p>
              The calculator uses the SIP formula, adjusting for annual compounding and the
              PPF&apos;s specific interest calculation method, where deposits for a month earn
              interest from that month if made before the 5th.
            </p>
            <p>
              <code>Maturity = A × [((1+i)^n − 1)/i]</code>
              <br />
              Where A is monthly investment, i is annual return rate (decimal), n is total years.
            </p>
          </details>
        </FadeIn>
        <FadeIn delay={0.4}>
          <details>
            <summary>How to use this calculator</summary>
            <ol>
              <li>Enter your monthly contribution amount to your PPF account.</li>
              <li>
                Input the current annual interest rate declared for PPF (it may change over time).
              </li>
              <li>
                Specify the duration of your investment in years (minimum 15 years for maturity).
              </li>
              <li>
                The calculator will show you the estimated maturity value, total invested, and the
                gains earned.
              </li>
              <li>The chart will illustrate the growth of your PPF corpus over the years.</li>
            </ol>
          </details>
        </FadeIn>
        <FadeIn delay={0.5}>
          <details>
            <summary>FAQs</summary>
            <ul>
              <li>
                <strong>What is the lock-in period for PPF?</strong> PPF has a lock-in period of 15
                years. Partial withdrawals are allowed after 6 years, and premature closure is
                allowed after 5 years under specific conditions.
              </li>
              <li>
                <strong>Is PPF tax-free?</strong> Yes, PPF falls under the EEE
                (Exempt-Exempt-Exempt) category, meaning contributions, interest earned, and
                maturity amount are all tax-exempt.
              </li>
              <li>
                <strong>Can I extend my PPF account after 15 years?</strong> Yes, you can extend
                your PPF account in blocks of 5 years, with or without further contributions.
              </li>
              <li>
                <strong>What is the maximum and minimum investment in PPF?</strong> The minimum
                investment is INR 500 per year, and the maximum is INR 1.5 lakh per financial year.
              </li>
            </ul>
          </details>
        </FadeIn>
      </article>
    </div>
  );
}
