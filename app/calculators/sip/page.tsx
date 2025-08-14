/**
 * SIP Calculator Page (UI only)
 * - Uses calculateSip from lib/calc/sip for all math
 * - Offers monthly/yearly toggle for the chart
 */
"use client";
import { Suspense, useMemo, useState } from "react";
import { calculateSip } from "@/lib/calc/sip";
import { SliderWithInput } from "@/components/SliderWithInput";
import { ResultStat } from "@/components/ResultStat";
import { ChartContainer } from "@/components/ChartContainer";
import { ShareButton } from "@/components/ShareButton";
import { Line, LineChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis, Brush } from "recharts";
import { chartColors } from "@/lib/charts";
import { formatINR } from "@/lib/format";
import { parseParamNumber, useUrlState } from "@/lib/url";
import { useSearchParams } from "next/navigation";
import { Timeframe, TimeframeToggle } from "@/components/TimeframeToggle";
import { SocialShare } from "@/components/SocialShare";
import { FadeIn } from "@/components/FadeIn";

export default function SipPage() {
  return (
    <Suspense
      fallback={
        <div className="h-80 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
      }
    >
      <SipClient />
    </Suspense>
  );
}

function SipClient() {
  const sp = useSearchParams();
  const [amount, setAmount] = useState(parseParamNumber(sp, "a", 10000));
  const [rate, setRate] = useState(parseParamNumber(sp, "r", 12));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 15));
  const [tf, setTf] = useState<Timeframe>("monthly");
  useUrlState({ a: amount, r: rate, y: years });

  const result = useMemo(() => calculateSip(amount, rate, years), [amount, rate, years]);
  const chartData = useMemo(() => {
    if (tf === "monthly") return result.series;
    const out: { month: number; invested: number; value: number }[] = [];
    for (let i = 0; i < result.series.length; i += 12) {
      const chunk = result.series.slice(i, i + 12);
      if (chunk.length) {
        const last = chunk[chunk.length - 1]!;
        out.push({ month: (i + 12) / 12, invested: last.invested, value: last.value });
      }
    }
    return out;
  }, [result.series, tf]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section className="space-y-4">
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">SIP Calculator</h1>
            <ShareButton />
          </div>
          <div className="mt-4 space-y-4">
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
            <button
              type="button"
              onClick={() => {
                setAmount(10000);
                setRate(12);
                setYears(15);
              }}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ResultStat label="Maturity" value={result.maturity} currency />
          <ResultStat label="Total Invested" value={result.totalInvested} currency />
          <ResultStat label="Gains" value={result.gains} currency />
        </div>
      </section>
      <section className="space-y-4">
        <FadeIn>
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-medium">Growth over time</h2>
              <TimeframeToggle value={tf} onChange={setTf} />
            </div>
            <ChartContainer>
              <LineChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
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
                <Brush dataKey="month" height={20} stroke="#8884d8" />
              </LineChart>
            </ChartContainer>
          </div>
          <div className="mt-3">
            <SocialShare />
          </div>
        </FadeIn>
        {/* Educational content for SIP */}
        <article className="prose mt-2 dark:prose-invert">
          <details open>
            <summary>What is SIP?</summary>
            <p>
              SIP (Systematic Investment Plan) is a way to invest a fixed amount regularly (usually
              monthly) into mutual funds. It builds discipline and smooths out market volatility.
            </p>
          </details>
          <details>
            <summary>How it works (formula)</summary>
            <p>Monthly rate i = R/12/100, n = years×12. Maturity = A × [((1+i)^n − 1)/i] × (1+i)</p>
          </details>
          <details>
            <summary>How to use this calculator</summary>
            <ol>
              <li>Enter monthly amount, expected annual return, and duration.</li>
              <li>Switch the chart between monthly/yearly for a condensed view.</li>
              <li>Share the resulting URL with friends or advisors.</li>
            </ol>
          </details>
          <details>
            <summary>FAQs</summary>
            <ul>
              <li>Can I pause a SIP? Many funds allow pausing; check with your AMC.</li>
              <li>Are SIP returns guaranteed? No—returns depend on markets.</li>
              <li>Taxation? Equity funds are taxed as per capital gains rules.</li>
            </ul>
          </details>
        </article>
      </section>
    </div>
  );
}
