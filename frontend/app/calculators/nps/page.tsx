/**
 * NPS Calculator (UI only)
 * - Accumulation via SIP math in lib/calc/nps and simple annuity estimate
 */
"use client";
import { Suspense, useMemo, useState, useRef } from "react";
import { calculateNps } from "@/lib/calc/nps";
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

export default function NpsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-80 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
      }
    >
      <NpsClient />
    </Suspense>
  );
}

function NpsClient() {
  const sp = useSearchParams();
  const [amount, setAmount] = useState(parseParamNumber(sp, "a", 5000));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 25));
  const [pre, setPre] = useState(parseParamNumber(sp, "pre", 10));
  const [post, setPost] = useState(parseParamNumber(sp, "post", 6));
  const resultRef = useRef<HTMLDivElement>(null);
  useUrlState({ a: amount, y: years, pre, post });

  const result = useMemo(() => calculateNps(amount, years, pre, post), [amount, years, pre, post]);

  const getExportData = () => ({
    inputs: {
      "Monthly Contribution": `₹${amount.toLocaleString()}`,
      "Years to Retirement": `${years} years`,
      "Pre-retirement Return": `${pre}%`,
      "Annuity Rate": `${post}%`
    },
    results: {
      "Corpus at Retirement": `₹${result.corpus.toLocaleString()}`,
      "Estimated Monthly Pension": `₹${result.estimatedPension.toLocaleString()}`,
      "Total Investment": `₹${(amount * years * 12).toLocaleString()}`,
      "Total Returns": `₹${(result.corpus - amount * years * 12).toLocaleString()}`
    },
    chartData: result.series
  });

  const shareData = {
    title: "NPS Calculator Results",
    description: `Monthly NPS contribution of ₹${amount.toLocaleString()} for ${years} years will create a corpus of ₹${result.corpus.toLocaleString()} with monthly pension of ₹${result.estimatedPension.toLocaleString()}`,
    url: typeof window !== 'undefined' ? window.location.href : '',
    calculatorType: "NPS",
    results: getExportData()
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
        </div>
        <div ref={resultRef} className="grid grid-cols-2 gap-3">
          <ResultStat label="Corpus at retirement" value={result.corpus} currency />
          <ResultStat label="Estimated monthly pension" value={result.estimatedPension} currency />
        </div>
        
        {/* Export and Share Buttons */}
        {result.corpus > 0 && (
          <div className="flex gap-2">
            <ExportButton
              data={getExportData()}
              title="NPS Calculator Results"
              calculatorType="NPS"
              elementRef={resultRef}
              className="flex-1"
            />
            <ShareButton />
          </div>
        )}
      </section>
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
    </div>
  );
}
