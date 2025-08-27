"use client";
import { useMemo, useState } from "react";
import { calculateFd } from "@/lib/calc/fd";
import { SliderWithInput } from "@/components/SliderWithInput";
import { ResultStat } from "@/components/ResultStat";
import { ChartContainer } from "@/components/ChartContainer";
import { ShareButton } from "@/components/ShareButton";
import { Line, LineChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "@/lib/charts";
import { formatINR } from "@/lib/format";
import { parseParamNumber, useUrlState } from "@/lib/url";
import { useSearchParams } from "next/navigation";
import { PresetChips } from "@/components/PresetChips";
import { FadeIn } from "@/components/FadeIn";
import { saveLocal, loadLocal } from "@/lib/persist";
import { Calculation, SavedCalculation } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
export default function FdClient() {
  const sp = useSearchParams();
  const [principal, setPrincipal] = useState(parseParamNumber(sp, "p", 200000));
  const [rate, setRate] = useState(parseParamNumber(sp, "r", 7));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 5));
  const [m, setM] = useState(parseParamNumber(sp, "m", 4));
  useUrlState({ p: principal, r: rate, y: years, m });

  const STORAGE_KEY = "savedCalculations"; // Define STORAGE_KEY

  const result = useMemo(() => calculateFd(principal, rate, years, m), [principal, rate, years, m]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <FadeIn>
        <section className="space-y-4">
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">FD Calculator</h1>
              <ShareButton />
            </div>
            <div className="mt-4 space-y-4">
              <PresetChips
                label="Bank presets"
                presets={[
                  { name: "Bank A 7%", value: 7 },
                  { name: "Bank B 7.5%", value: 7.5 },
                  { name: "Bank C 8%", value: 8 }
                ]}
                onApply={setRate}
              />
              <SliderWithInput
                label="Principal"
                value={principal}
                onChange={setPrincipal}
                min={1000}
                max={10000000}
                step={1000}
                suffix="₹"
              />
              <SliderWithInput
                label="Interest rate (p.a.)"
                value={rate}
                onChange={setRate}
                min={0}
                max={15}
                step={0.1}
                suffix="%"
              />
              <SliderWithInput
                label="Years"
                value={years}
                onChange={setYears}
                min={1}
                max={30}
                step={1}
              />
              <SliderWithInput
                label="Compounding per year"
                value={m}
                onChange={setM}
                min={1}
                max={12}
                step={1}
              />
              <button
                type="button"
                onClick={() => {
                  setPrincipal(200000);
                  setRate(7);
                  setYears(5);
                  setM(4);
                }}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  const newCalculation: Calculation = {
                    type: "fd",
                    inputs: { principal, rate, years, m },
                    results: { maturity: result.maturity, interestEarned: result.interestEarned },
                    timestamp: Date.now()
                  };
                  const savedCalculations = loadLocal<SavedCalculation[]>(STORAGE_KEY, []);
                  saveLocal(STORAGE_KEY, [
                    ...savedCalculations,
                    { ...newCalculation, id: uuidv4() }
                  ]);
                  alert("Calculation saved!");
                }}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Save Calculation
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ResultStat label="Maturity" value={result.maturity} currency />
            <ResultStat label="Interest Earned" value={result.interestEarned} currency />
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
                <XAxis dataKey="year" tickLine={false} />
                <YAxis tickFormatter={(v) => formatINR(v as number)} tickLine={false} />
                <Tooltip formatter={(v) => formatINR(v as number)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
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
            <summary>What is a Fixed Deposit (FD)?</summary>
            <p>
              A Fixed Deposit (FD) is a financial instrument provided by banks and financial
              institutions that provides investors with a higher rate of interest than a regular
              savings account, until the given maturity date.
            </p>
          </details>
        </FadeIn>
        <FadeIn delay={0.3}>
          <details>
            <summary>How it works (formula)</summary>
            <p>
              The formula for calculating FD maturity value depends on whether the interest is
              compounded annually, half-yearly, quarterly, or monthly.
            </p>
            <p>
              <code>A = P * (1 + r/n)^(n*t)</code>
              <br />
              Where:
              <br />
              <code>A</code> = Maturity Amount
              <br />
              <code>P</code> = Principal Investment Amount
              <br />
              <code>r</code> = Annual Interest Rate (decimal)
              <br />
              <code>n</code> = Number of times interest is compounded per year
              <br />
              <code>t</code> = Tenure in years
            </p>
          </details>
        </FadeIn>
        <FadeIn delay={0.4}>
          <details>
            <summary>How to use this calculator</summary>
            <ol>
              <li>Enter your principal investment amount.</li>
              <li>Input the annual interest rate offered by your bank/institution.</li>
              <li>Specify the tenure of the FD in years.</li>
              <li>Choose the compounding frequency (e.g., quarterly, monthly, annually).</li>
              <li>
                The calculator will display your estimated maturity value and total interest earned.
              </li>
              <li>Use the chart to visualize the growth of your investment over time.</li>
            </ol>
          </details>
        </FadeIn>
        <FadeIn delay={0.5}>
          <details>
            <summary>FAQs</summary>
            <ul>
              <li>
                <strong>Is interest on FD taxable?</strong> Yes, interest earned on FDs is fully
                taxable and is added to your income. TDS may be deducted by the bank.
              </li>
              <li>
                <strong>Can I break my FD prematurely?</strong> Most FDs allow premature withdrawal,
                but it usually comes with a penalty (e.g., lower interest rate).
              </li>
              <li>
                <strong>What is cumulative vs. non-cumulative FD?</strong> Cumulative FDs reinvest
                interest, paying it all at maturity. Non-cumulative FDs pay interest out
                periodically (monthly, quarterly, etc.). This calculator assumes cumulative.
              </li>
              <li>
                <strong>Are FDs safe?</strong> FDs are generally considered very safe as they are
                not market-linked. Deposits up to INR 5 lakhs per bank are insured by DICGC.
              </li>
            </ul>
          </details>
        </FadeIn>
      </article>
    </div>
  );
}
