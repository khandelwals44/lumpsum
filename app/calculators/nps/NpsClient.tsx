"use client";
import { useMemo, useState } from "react";
import { calculateNps } from "@/lib/calc/nps";
import { SliderWithInput } from "@/components/SliderWithInput";
import { ResultStat } from "@/components/ResultStat";
import { ChartContainer } from "@/components/ChartContainer";
import { ShareButton } from "@/components/ShareButton";
import { Line, LineChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "@/lib/charts";
import { formatINR } from "@/lib/format";
import { parseParamNumber, useUrlState } from "@/lib/url";
import { useSearchParams } from "next/navigation";
import { FadeIn } from "@/components/FadeIn";
import { saveLocal, loadLocal } from "@/lib/persist";
import { Calculation, SavedCalculation } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
export default function NpsClient() {
  const sp = useSearchParams();
  const [amount, setAmount] = useState(parseParamNumber(sp, "a", 5000));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 25));
  const [pre, setPre] = useState(parseParamNumber(sp, "pre", 10));
  const [post, setPost] = useState(parseParamNumber(sp, "post", 6));
  useUrlState({ a: amount, y: years, pre, post });

  const STORAGE_KEY = "savedCalculations"; // Define STORAGE_KEY

  const result = useMemo(() => calculateNps(amount, years, pre, post), [amount, years, pre, post]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <FadeIn>
        <section className="space-y-4">
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">NPS Calculator</h1>
              <ShareButton />
            </div>
            <div className="mt-4 space-y-4">
              <SliderWithInput
                label="Monthly contribution"
                value={amount}
                onChange={setAmount}
                min={500}
                max={100000}
                step={500}
                suffix="₹"
              />
              <SliderWithInput
                label="Years to retire"
                value={years}
                onChange={setYears}
                min={1}
                max={45}
                step={1}
              />
              <SliderWithInput
                label="Expected return pre-retirement"
                value={pre}
                onChange={setPre}
                min={0}
                max={20}
                step={0.1}
                suffix="%"
              />
              <SliderWithInput
                label="Annuity rate (post-retirement)"
                value={post}
                onChange={setPost}
                min={0}
                max={12}
                step={0.1}
                suffix="%"
              />
              <button
                type="button"
                onClick={() => {
                  setAmount(5000);
                  setYears(25);
                  setPre(10);
                  setPost(6);
                }}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Reset
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                const newCalculation: Calculation = {
                  type: "nps",
                  inputs: { monthly: amount, years, returnPct: pre, increasePct: 0, age: 0 }, // Adding dummy increasePct and age, as per dashboard needs
                  results: { corpusAt60: result.corpus, estimatedPension: result.estimatedPension },
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ResultStat label="Corpus at retirement" value={result.corpus} currency />
            <ResultStat
              label="Estimated monthly pension"
              value={result.estimatedPension}
              currency
            />
          </div>
        </section>
      </FadeIn>
      <FadeIn>
        <section className="space-y-4">
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-lg font-medium">Accumulation</h2>
            <ChartContainer>
              <LineChart data={result.series} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis tickFormatter={(v) => formatINR(v as number)} tickLine={false} />
                <Tooltip formatter={(v) => formatINR(v as number)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="invested"
                  stroke={chartColors.invested}
                  name="Invested"
                  dot={false}
                />
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
            <summary>What is NPS?</summary>
            <p>
              The National Pension System (NPS) is a government-backed, voluntary retirement savings
              scheme in India. It aims to provide retirement income to subscribers. NPS is a
              market-linked product, and a portion of the corpus must be used to purchase an annuity
              at retirement.
            </p>
          </details>
        </FadeIn>
        <FadeIn delay={0.3}>
          <details>
            <summary>How it works (formula)</summary>
            <p>
              The corpus accumulation is calculated using the SIP maturity formula, considering your
              monthly contributions and the expected return rate until retirement.
            </p>
            <p>
              At retirement, a minimum of 40% of the corpus must be used to purchase an annuity,
              which provides a regular pension. The remaining corpus can be withdrawn as a lumpsum.
            </p>
            <p>
              <code>Corpus = Monthly_Contribution × [((1+i)^n − 1)/i] × (1+i)</code> (SIP formula)
              <br />
              <code>Estimated Pension = (60% of Corpus × Annuity_Rate) / 12</code> (assuming 60% is
              annuitized)
            </p>
          </details>
        </FadeIn>
        <FadeIn delay={0.4}>
          <details>
            <summary>How to use this calculator</summary>
            <ol>
              <li>Enter your planned monthly contribution to NPS.</li>
              <li>Specify the number of years until you plan to retire.</li>
              <li>
                Input your expected annual return rate during the accumulation phase
                (pre-retirement).
              </li>
              <li>
                Enter the expected annuity rate you anticipate post-retirement (for pension
                calculation).
              </li>
              <li>
                The calculator will estimate your corpus at retirement and your potential monthly
                pension.
              </li>
              <li>The chart shows the growth of your NPS corpus over the accumulation period.</li>
            </ol>
          </details>
        </FadeIn>
        <FadeIn delay={0.5}>
          <details>
            <summary>FAQs</summary>
            <ul>
              <li>
                <strong>Is NPS tax-efficient?</strong> Yes, NPS offers tax benefits under Section
                80C, 80CCD(1B), and 80CCD(2) of the Income Tax Act.
              </li>
              <li>
                <strong>Can I withdraw from NPS before retirement?</strong> Partial withdrawals are
                allowed for specific purposes after 3 years, subject to conditions. Full withdrawal
                before 60 is generally not allowed, with exceptions.
              </li>
              <li>
                <strong>What is an annuity?</strong> An annuity is a financial product that pays out
                a fixed stream of payments over time, often for the rest of your life, in exchange
                for a lumpsum amount.
              </li>
              <li>
                <strong>What are Tier I and Tier II accounts?</strong> Tier I is the primary,
                tax-advantaged retirement account with withdrawal restrictions. Tier II is a
                voluntary savings account with no tax benefits and flexible withdrawals.
              </li>
            </ul>
          </details>
        </FadeIn>
      </article>
    </div>
  );
}
