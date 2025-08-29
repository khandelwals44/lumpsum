/**
 * Lumpsum Calculator Page (UI only)
 * - Delegates FV math to lib/calc/lumpsum
 */
"use client";
import { Suspense, useMemo, useState, useRef } from "react";
import { calculateLumpsum } from "@/lib/calc/lumpsum";
import { SliderWithInput } from "@/components/SliderWithInput";
import { ResultStat } from "@/components/ResultStat";
import { ChartContainer } from "@/components/ChartContainer";
import { ShareButton } from "@/components/ShareButton";
import ExportButton from "@/components/export/ExportButton";
import { Line, LineChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "@/lib/charts";
import { formatINR } from "@/lib/format";
import { parseParamNumber, useUrlState } from "@/lib/url";
import { useSearchParams } from "next/navigation";
import { SocialShare } from "@/components/SocialShare";
import { FadeIn } from "@/components/FadeIn";

export default function LumpsumPage() {
  return (
    <Suspense
      fallback={
        <div className="h-80 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
      }
    >
      <LumpsumClient />
    </Suspense>
  );
}

function LumpsumClient() {
  const sp = useSearchParams();
  const [principal, setPrincipal] = useState(parseParamNumber(sp, "p", 500000));
  const [rate, setRate] = useState(parseParamNumber(sp, "r", 12));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 10));
  const resultRef = useRef<HTMLDivElement>(null);
  useUrlState({ p: principal, r: rate, y: years });

  const result = useMemo(() => calculateLumpsum(principal, rate, years), [principal, rate, years]);

  const getExportData = () => ({
    inputs: {
      "Investment Amount": `₹${principal.toLocaleString()}`,
      "Expected Return (p.a.)": `${rate}%`,
      "Duration": `${years} years`
    },
    results: {
      "Future Value": `₹${result.futureValue.toLocaleString()}`,
      "Total Gains": `₹${result.gains.toLocaleString()}`,
      "Return on Investment": `${((result.gains / principal) * 100).toFixed(2)}%`
    },
    chartData: result.series
  });

  const shareData = {
    title: "Lumpsum Calculator Results",
    description: `Investment of ₹${principal.toLocaleString()} for ${years} years at ${rate}% p.a. would grow to ₹${result.futureValue.toLocaleString()}`,
    url: window.location.href,
    calculatorType: "Lumpsum",
    results: getExportData()
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section className="space-y-4">
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Lumpsum Calculator</h1>
            <ShareButton />
          </div>
          <div className="mt-4 space-y-4">
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
            <button
              type="button"
              onClick={() => {
                setPrincipal(500000);
                setRate(12);
                setYears(10);
              }}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Reset
            </button>
            <SocialShare />
          </div>
        </div>
        <div ref={resultRef} className="grid grid-cols-2 gap-3">
          <ResultStat label="Future Value" value={result.futureValue} currency />
          <ResultStat label="Gains" value={result.gains} currency />
        </div>
        
        {/* Export and Share Buttons */}
        {result.futureValue > 0 && (
          <div className="flex gap-2">
            <ExportButton
              data={getExportData()}
              title="Lumpsum Calculator Results"
              calculatorType="Lumpsum"
              elementRef={resultRef}
              className="flex-1"
            />
            <ShareButton data={shareData} className="flex-1" />
          </div>
        )}
      </section>
      <section className="space-y-4">
        <FadeIn>
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-lg font-medium">Growth over time</h2>
            <ChartContainer>
              <LineChart data={result.series} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} />
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
        </FadeIn>
        <article className="prose mt-2 dark:prose-invert">
          <details open>
            <summary>What is a Lumpsum investment?</summary>
            <p>A one-time investment amount that grows with compounding over time.</p>
          </details>
          <details>
            <summary>How it works (formula)</summary>
            <p>Monthly rate i = R/12/100, n = years×12. Future Value = P × (1+i)^n</p>
          </details>
          <details>
            <summary>How to use this calculator</summary>
            <ol>
              <li>Enter the one-time amount, expected annual return, and duration.</li>
              <li>Observe the compounding curve; adjust inputs to compare scenarios.</li>
              <li>Share the URL to keep your input state.</li>
            </ol>
          </details>
          <details>
            <summary>FAQs</summary>
            <ul>
              <li>Is the return guaranteed? No—market-linked.</li>
              <li>How often is compounding? We use monthly compounding here.</li>
            </ul>
          </details>
        </article>
      </section>
    </div>
  );
}
