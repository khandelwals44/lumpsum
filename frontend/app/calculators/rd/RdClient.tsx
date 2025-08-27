"use client";
import { useMemo, useState } from "react";
import { calculateRd } from "@/lib/calc/rd";
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
import { getApiBaseUrl } from "@/lib/env.client";
import { Calculation, SavedCalculation } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
export default function RdClient() {
  const sp = useSearchParams();
  const [monthly, setMonthly] = useState(parseParamNumber(sp, "m", 5000));
  const [rate, setRate] = useState(parseParamNumber(sp, "r", 7));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 5));
  useUrlState({ m: monthly, r: rate, y: years });

  const STORAGE_KEY = "savedCalculations"; // Define STORAGE_KEY
  const result = useMemo(() => calculateRd(monthly, rate, years), [monthly, rate, years]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <FadeIn>
        <section className="space-y-4">
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">RD Calculator</h1>
              <ShareButton />
            </div>
            <div className="mt-4 space-y-4">
              <SliderWithInput
                label="Monthly deposit"
                value={monthly}
                onChange={setMonthly}
                min={500}
                max={200000}
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
                max={10}
                step={1}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const newCalculation: Calculation = {
                type: "rd",
                inputs: { monthly, rate, years },
                results: {
                  maturity: result.maturity,
                  totalInvested: result.totalInvested,
                  interestEarned: result.interestEarned
                },
                timestamp: Date.now()
              };
              const savedCalculations = loadLocal<SavedCalculation[]>(STORAGE_KEY, []);
              saveLocal(STORAGE_KEY, [...savedCalculations, { ...newCalculation, id: uuidv4() }]);
                              if (getAuthToken() && getApiBaseUrl()) {
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
            <summary>What is a Recurring Deposit (RD)?</summary>
            <p>
              A Recurring Deposit (RD) is a special kind of term deposit which helps people with
              regular incomes to deposit a fixed amount every calendar month into their Recurring
              Deposit account and earn interest at the rate applicable to Fixed Deposits.
            </p>
          </details>
        </FadeIn>
        <FadeIn delay={0.3}>
          <details>
            <summary>How it works (formula)</summary>
            <p>
              The maturity value of an RD is calculated using a formula that compounds interest
              quarterly, even if the deposits are monthly. The formula is:
            </p>
            <p>
              <code>M = P * (1 + R/400)^(n*4)</code>
              <br />
              Where:
              <br />
              <code>M</code> = Maturity Value
              <br />
              <code>P</code> = Monthly Installment
              <br />
              <code>R</code> = Annual Interest Rate (percentage)
              <br />
              <code>n</code> = Tenure in years
            </p>
          </details>
        </FadeIn>
        <FadeIn delay={0.4}>
          <details>
            <summary>How to use this calculator</summary>
            <ol>
              <li>Enter your desired monthly deposit amount for the RD.</li>
              <li>Input the annual interest rate offered by the bank/institution.</li>
              <li>Specify the duration of your RD in years.</li>
              <li>
                The calculator will display your estimated maturity value, total invested, and the
                interest earned.
              </li>
              <li>The chart visualizes how your recurring deposits grow over time.</li>
            </ol>
          </details>
        </FadeIn>
        <FadeIn delay={0.5}>
          <details>
            <summary>FAQs</summary>
            <ul>
              <li>
                <strong>Is interest on RD taxable?</strong> Yes, interest earned on RDs is taxable
                as per your income tax slab.
              </li>
              <li>
                <strong>Can I withdraw from RD prematurely?</strong> Most banks allow premature
                withdrawal of RDs, but it may involve a penalty or a lower interest rate.
              </li>
              <li>
                <strong>What happens if I miss an RD installment?</strong> Banks may charge a
                penalty for missed installments. Repeated defaults can lead to the closure of the RD
                account.
              </li>
              <li>
                <strong>How is interest calculated on RD?</strong> Interest on RDs is typically
                compounded quarterly, even if you make monthly deposits.
              </li>
            </ul>
          </details>
        </FadeIn>
      </article>
    </div>
  );
}
