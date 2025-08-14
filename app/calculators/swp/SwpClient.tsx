"use client";
import { useMemo, useState } from "react";
import { calculateSwp } from "@/lib/calc/swp";
import { SliderWithInput } from "@/components/SliderWithInput";
import { ResultStat } from "@/components/ResultStat";
import { ShareButton } from "@/components/ShareButton";
import { ChartContainer } from "@/components/ChartContainer";
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "@/lib/charts";
import { useSearchParams } from "next/navigation";
import { parseParamNumber, useUrlState } from "@/lib/url";
import { formatINR } from "@/lib/format";
import { FadeIn } from "@/components/FadeIn";
import { saveLocal, loadLocal } from "@/lib/persist";
import { Calculation, SavedCalculation } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
export default function SwpClient() {
  const sp = useSearchParams();
  const [corpus, setCorpus] = useState(parseParamNumber(sp, "c", 1000000));
  const [withdrawal, setWithdrawal] = useState(parseParamNumber(sp, "w", 15000));
  const [rate, setRate] = useState(parseParamNumber(sp, "r", 10));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 20));
  useUrlState({ c: corpus, w: withdrawal, r: rate, y: years });

  const STORAGE_KEY = "savedCalculations"; // Define STORAGE_KEY

  const result = useMemo(
    () => calculateSwp(corpus, withdrawal, rate, years),
    [corpus, withdrawal, rate, years]
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <FadeIn>
        <section className="space-y-4">
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">SWP Calculator</h1>
              <ShareButton />
            </div>
            <div className="mt-4 space-y-4">
              <SliderWithInput
                label="Initial corpus"
                value={corpus}
                onChange={setCorpus}
                min={10000}
                max={50000000}
                step={10000}
                suffix="₹"
              />
              <SliderWithInput
                label="Monthly withdrawal"
                value={withdrawal}
                onChange={setWithdrawal}
                min={1000}
                max={1000000}
                step={1000}
                suffix="₹"
              />
              <SliderWithInput
                label="Expected return (p.a.)"
                value={rate}
                onChange={setRate}
                min={0}
                max={20}
                step={0.1}
                suffix="%"
              />
              <SliderWithInput
                label="Duration (years)"
                value={years}
                onChange={setYears}
                min={1}
                max={40}
                step={1}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const newCalculation: Calculation = {
                type: "swp",
                inputs: { corpus, withdrawal, rate, years },
                results: {
                  monthsSurvived: result.monthsSurvived,
                  totalWithdrawn: result.totalWithdrawn,
                  totalInterest: result.totalInterest,
                  endingBalance: result.endingBalance
                },
                timestamp: Date.now()
              };
              const savedCalculations = loadLocal<SavedCalculation[]>(STORAGE_KEY, []);
              saveLocal(STORAGE_KEY, [...savedCalculations, { ...newCalculation, id: uuidv4() }]);
              alert("Calculation saved!");
            }}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Save Calculation
          </button>
          <div className="grid grid-cols-2 gap-3">
            <ResultStat label="Months survived" value={result.monthsSurvived} />
            <ResultStat label="Total withdrawn" value={result.totalWithdrawn} currency />
            <ResultStat label="Total interest" value={result.totalInterest} currency />
            <ResultStat label="Ending balance" value={result.endingBalance} currency />
          </div>
        </section>
      </FadeIn>
      <FadeIn>
        <section className="space-y-4">
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-lg font-medium">Balance over time</h2>
            <ChartContainer>
              <AreaChart data={result.series} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => formatINR(v as number)} />
                <Tooltip formatter={(v) => formatINR(v as number)} />
                <Legend />
                <Area
                  dataKey="balance"
                  type="monotone"
                  stroke={chartColors.value}
                  fill={chartColors.value}
                  name="Balance"
                />
                <Area
                  dataKey="withdrawal"
                  type="monotone"
                  stroke={chartColors.principal}
                  fill={chartColors.principal}
                  name="Withdrawal"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </section>
      </FadeIn>
      {/* Educational content: what, how, steps, and FAQ */}
      <article className="prose mt-4 dark:prose-invert md:col-span-2">
        <FadeIn delay={0.2}>
          <details open>
            <summary>What is SWP?</summary>
            <p>
              SWP (Systematic Withdrawal Plan) allows investors to withdraw a fixed amount of money
              from their mutual fund investments at regular intervals (e.g., monthly, quarterly,
              annually). It&apos;s a popular option for retirees or those needing a regular income
              stream from their corpus.
            </p>
          </details>
        </FadeIn>
        <FadeIn delay={0.3}>
          <details>
            <summary>How it works (formula)</summary>
            <p>
              The calculator simulates the withdrawal process over the specified duration. Each
              month, the withdrawal amount is deducted from the corpus, and the remaining balance
              earns interest at the expected return rate.
            </p>
            <p>
              The primary goal is to see how long the corpus can sustain the withdrawals given the
              expected return.
            </p>
          </details>
        </FadeIn>
        <FadeIn delay={0.4}>
          <details>
            <summary>How to use this calculator</summary>
            <ol>
              <li>Enter your initial investment corpus (e.g., your retirement savings).</li>
              <li>Input your desired monthly withdrawal amount.</li>
              <li>Specify your expected annual return on the remaining corpus.</li>
              <li>Set the duration in years to see if your corpus lasts.</li>
              <li>
                The calculator will show how many months your corpus survives, total withdrawn, and
                ending balance.
              </li>
              <li>
                The chart visualizes the corpus balance over time, showing the impact of
                withdrawals.
              </li>
            </ol>
          </details>
        </FadeIn>
        <FadeIn delay={0.5}>
          <details>
            <summary>FAQs</summary>
            <ul>
              <li>
                <strong>Who should use SWP?</strong> SWP is ideal for individuals seeking a regular
                income from their investments, such as retirees, or those with a large corpus
                looking for a disciplined withdrawal strategy.
              </li>
              <li>
                <strong>Is SWP tax-efficient?</strong> Withdrawals from mutual funds via SWP are
                subject to capital gains tax. Long-term capital gains (LTCG) and short-term capital
                gains (STCG) rules apply.
              </li>
              <li>
                <strong>Can I change my SWP amount?</strong> Yes, you can usually modify your SWP
                amount or frequency as per your needs through your fund house or platform.
              </li>
              <li>
                <strong>What if the market underperforms?</strong> If returns are lower than
                expected, your corpus might deplete faster. It&apos;s crucial to have a realistic
                expected return and potentially adjust withdrawals.
              </li>
            </ul>
          </details>
        </FadeIn>
      </article>
    </div>
  );
}
