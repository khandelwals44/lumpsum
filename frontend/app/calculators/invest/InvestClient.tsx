"use client";
import { useMemo, useState } from "react";
import { calculateSip } from "@/lib/calc/sip";
import { calculateLumpsum } from "@/lib/calc/lumpsum";
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
import Link from "next/link";
import { saveLocal, loadLocal } from "@/lib/persist";
import { Api, getAuthToken } from "@/lib/api";
import { getApiBaseUrl } from "@/lib/env.client";
import { Calculation, SavedCalculation, Mode } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
export default function InvestClient() {
  const sp = useSearchParams();
  // UI state – defaults, then hydrated from URL if present
  const [mode, setMode] = useState<Mode>((sp?.get("mode") as Mode) || "sip");
  const [amount, setAmount] = useState(parseParamNumber(sp, "a", 10000));
  const [principal, setPrincipal] = useState(parseParamNumber(sp, "p", 500000));
  const [rate, setRate] = useState(parseParamNumber(sp, "r", 12));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 10));
  useUrlState({ mode, a: amount, p: principal, r: rate, y: years });

  const STORAGE_KEY = "savedCalculations"; // Define STORAGE_KEY

  // Pure calculations – no UI logic inside calc files
  const sip = useMemo(() => calculateSip(amount, rate, years), [amount, rate, years]);
  const lump = useMemo(() => calculateLumpsum(principal, rate, years), [principal, rate, years]);

  const data = mode === "sip" ? sip.series : lump.series;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <FadeIn>
        <section className="space-y-4">
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Invest: SIP or Lumpsum</h1>
              <ShareButton />
            </div>
            {/* Simple, accessible toggle between SIP and Lumpsum */}
            <div className="mt-4 flex items-center gap-2 text-sm">
              <button
                className={`rounded px-3 py-1 ${mode === "sip" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 dark:border-zinc-700"}`}
                onClick={() => setMode("sip")}
              >
                SIP
              </button>
              <button
                className={`rounded px-3 py-1 ${mode === "lumpsum" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 dark:border-zinc-700"}`}
                onClick={() => setMode("lumpsum")}
              >
                Lumpsum
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {/* Inputs differ per mode, but both reuse the same SliderWithInput component */}
              {mode === "sip" ? (
                <>
                  <SliderWithInput
                    label="Monthly investment"
                    value={amount}
                    onChange={setAmount}
                    min={500}
                    max={200000}
                    step={500}
                    suffix="₹"
                  />
                  <SliderWithInput
                    label="Expected return (p.a.)"
                    value={rate}
                    onChange={setRate}
                    min={0}
                    max={30}
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
                </>
              ) : (
                <>
                  <SliderWithInput
                    label="Investment amount"
                    value={principal}
                    onChange={setPrincipal}
                    min={1000}
                    max={10000000}
                    step={1000}
                    suffix="₹"
                  />
                  <SliderWithInput
                    label="Expected return (p.a.)"
                    value={rate}
                    onChange={setRate}
                    min={0}
                    max={30}
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
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                let newCalculation: Calculation;
                if (mode === "sip") {
                  newCalculation = {
                    type: "invest-sip",
                    inputs: { amount, rate, years },
                    results: {
                      maturity: sip.maturity,
                      totalInvested: sip.totalInvested,
                      gains: sip.gains
                    },
                    timestamp: Date.now()
                  };
                } else {
                  newCalculation = {
                    type: "invest-lumpsum",
                    inputs: { principal, rate, years },
                    results: { futureValue: lump.futureValue, gains: lump.gains },
                    timestamp: Date.now()
                  };
                }
                const savedCalculations = loadLocal<SavedCalculation[]>(STORAGE_KEY, []);
                saveLocal(STORAGE_KEY, [...savedCalculations, { ...newCalculation, id: uuidv4() }]);
                // If a backend token exists, also persist to backend history
                if (getAuthToken() && getApiBaseUrl()) {
                  const inputs = newCalculation.inputs;
                  const outputs = newCalculation.results as any;
                  Api.saveCalculation(newCalculation.type, inputs, outputs).catch(() => {});
                }
                alert("Calculation saved!");
              }}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Save Calculation
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Summary tiles reuse ResultStat for consistent formatting */}
            {mode === "sip" ? (
              <>
                <ResultStat label="Maturity" value={sip.maturity} currency />
                <ResultStat label="Total Invested" value={sip.totalInvested} currency />
                <ResultStat label="Gains" value={sip.gains} currency />
              </>
            ) : (
              <>
                <ResultStat label="Future Value" value={lump.futureValue} currency />
                <ResultStat label="Gains" value={lump.gains} currency />
              </>
            )}
          </div>
          <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            <p>Looking for a specific calculator?</p>
            <ul className="mt-2 list-inside list-disc">
              <li>
                <Link
                  href="/calculators/sip"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Individual SIP Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/calculators/lumpsum"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Individual Lumpsum Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/calculators/step-up-sip"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Step-up SIP Calculator
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </FadeIn>
      <FadeIn>
        <section className="space-y-4">
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-lg font-medium">Growth over time</h2>
            {/* Charts are lazy-mounted via ChartContainer to keep bundle light */}
            <ChartContainer>
              <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => formatINR(v as number)} />
                <Tooltip formatter={(v) => formatINR(v as number)} />
                <Legend />
                {mode === "sip" ? (
                  <>
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
                  </>
                ) : (
                  <Line
                    dataKey="value"
                    type="monotone"
                    stroke={chartColors.value}
                    name="Value"
                    dot={false}
                  />
                )}
              </LineChart>
            </ChartContainer>
          </div>
        </section>
      </FadeIn>
      {/* Educational content: what, how, steps, and FAQ */}
      <article className="prose mt-4 dark:prose-invert md:col-span-2">
        <FadeIn delay={0.2}>
          <details open>
            <summary>What is SIP vs Lumpsum?</summary>
            <p>
              SIP (Systematic Investment Plan) involves investing a fixed amount regularly, while a
              Lumpsum investment is a one-time, large investment. Both are popular methods for
              wealth creation, and the best choice depends on your financial goals, risk tolerance,
              and market conditions.
            </p>
          </details>
        </FadeIn>
        <FadeIn delay={0.3}>
          <details>
            <summary>How it works (formulas)</summary>
            <p>
              The calculator uses the standard future value formulas for SIP (annuity due) and
              Lumpsum (compound interest).
            </p>
            <p>
              <strong>SIP Formula (monthly compounding):</strong>
              <code>Maturity = A × [((1+i)^n − 1)/i] × (1+i)</code>
              <br />
              Where A is monthly investment, i is monthly return rate, n is total months.
            </p>
            <p>
              <strong>Lumpsum Formula (monthly compounding):</strong>
              <code>Future Value = P × (1+i)^n</code>
              <br />
              Where P is principal, i is monthly return rate, n is total months.
            </p>
          </details>
        </FadeIn>
        <FadeIn delay={0.4}>
          <details>
            <summary>How to use this calculator</summary>
            <ol>
              <li>
                Toggle between &quot;SIP&quot; and &quot;Lumpsum&quot; modes based on your
                investment type.
              </li>
              <li>
                Enter the relevant investment amount, expected annual return, and duration in years.
              </li>
              <li>
                The calculator will display the estimated maturity value, total invested, and gains.
              </li>
              <li>
                Use the chart to visualize the growth of your investment over time for the selected
                mode.
              </li>
              <li>Compare scenarios by switching modes and adjusting inputs.</li>
            </ol>
          </details>
        </FadeIn>
        <FadeIn delay={0.5}>
          <details>
            <summary>FAQs</summary>
            <ul>
              <li>
                <strong>Which is better, SIP or Lumpsum?</strong> It depends. SIPs are good for
                rupee-cost averaging and disciplined investing. Lumpsum is ideal when you have a
                large sum and expect market to rise.
              </li>
              <li>
                <strong>Can I do both?</strong> Yes, many investors use a combination of both
                strategies based on their financial situation and market outlook.
              </li>
              <li>
                <strong>Are returns guaranteed?</strong> No, all investments are subject to market
                risks. The returns shown are estimates based on your input.
              </li>
              <li>
                <strong>How does inflation affect my returns?</strong> Inflation reduces the real
                value of your returns. Always consider inflation when planning for long-term goals.
              </li>
            </ul>
          </details>
        </FadeIn>
      </article>
    </div>
  );
}
