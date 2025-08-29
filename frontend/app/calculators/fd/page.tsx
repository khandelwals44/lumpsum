/**
 * FD Calculator (UI only)
 * - Uses lib/calc/fd for maturity and yearly series
 */
"use client";
import { Suspense, useMemo, useState, useRef } from "react";
import { calculateFd } from "@/lib/calc/fd";
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

export default function FdPage() {
  return (
    <Suspense
      fallback={
        <div className="h-80 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
      }
    >
      <FdClient />
    </Suspense>
  );
}

function FdClient() {
  const sp = useSearchParams();
  const [principal, setPrincipal] = useState(parseParamNumber(sp, "p", 200000));
  const [rate, setRate] = useState(parseParamNumber(sp, "r", 7));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 5));
  const [m, setM] = useState(parseParamNumber(sp, "m", 4));
  const resultRef = useRef<HTMLDivElement>(null);
  useUrlState({ p: principal, r: rate, y: years, m });

  const result = useMemo(() => calculateFd(principal, rate, years, m), [principal, rate, years, m]);

  const getExportData = () => ({
    inputs: {
      "Principal": `₹${principal.toLocaleString()}`,
      "Interest Rate (p.a.)": `${rate}%`,
      "Duration": `${years} years`,
      "Compounding per Year": `${m} times`
    },
    results: {
      "Maturity Amount": `₹${result.maturity.toLocaleString()}`,
      "Interest Earned": `₹${result.interestEarned.toLocaleString()}`,
      "Return on Investment": `${((result.interestEarned / principal) * 100).toFixed(2)}%`,
      "Effective Annual Rate": `${(Math.pow(1 + rate / (100 * m), m) - 1) * 100}%`
    },
    chartData: result.series
  });

  const shareData = {
    title: "FD Calculator Results",
    description: `FD of ₹${principal.toLocaleString()} for ${years} years at ${rate}% p.a. compounded ${m} times yearly will mature to ₹${result.maturity.toLocaleString()}`,
    url: window.location.href,
    calculatorType: "FD",
    results: getExportData()
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section className="space-y-4">
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">FD Calculator</h1>
            <ShareButton />
          </div>
          <div className="mt-4 space-y-4">
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
          </div>
        </div>
        <div ref={resultRef} className="grid grid-cols-2 gap-3">
          <ResultStat label="Maturity" value={result.maturity} currency />
          <ResultStat label="Interest Earned" value={result.interestEarned} currency />
        </div>
        
        {/* Export and Share Buttons */}
        {result.maturity > 0 && (
          <div className="flex gap-2">
            <ExportButton
              data={getExportData()}
              title="FD Calculator Results"
              calculatorType="FD"
              elementRef={resultRef}
              className="flex-1"
            />
            <ShareButton />
          </div>
        )}
      </section>
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
    </div>
  );
}
