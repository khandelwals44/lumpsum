"use client";
/** Step-up SIP Calculator (UI only) */
import { Suspense, useMemo, useState } from "react";
import { calculateStepUpSip } from "@/lib/calc/stepupSip";
import { SliderWithInput } from "@/components/SliderWithInput";
import { ResultStat } from "@/components/ResultStat";
import { ShareButton } from "@/components/ShareButton";
import { ChartContainer } from "@/components/ChartContainer";
import { Line, LineChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "@/lib/charts";
import { formatINR } from "@/lib/format";
import { parseParamNumber, useUrlState } from "@/lib/url";
import { useSearchParams } from "next/navigation";

export default function StepUpSipPage() {
  return (
    <Suspense
      fallback={
        <div className="h-80 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
      }
    >
      <StepUpClient />
    </Suspense>
  );
}

function StepUpClient() {
  const sp = useSearchParams();
  const [base, setBase] = useState(parseParamNumber(sp, "a", 10000));
  const [rate, setRate] = useState(parseParamNumber(sp, "r", 12));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 15));
  const [step, setStep] = useState(parseParamNumber(sp, "s", 10));
  useUrlState({ a: base, r: rate, y: years, s: step });

  const result = useMemo(
    () => calculateStepUpSip(base, rate, years, step),
    [base, rate, years, step]
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section className="space-y-4">
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Step-up SIP Calculator</h1>
            <ShareButton />
          </div>
          <div className="mt-4 space-y-4">
            <SliderWithInput
              label="Base monthly amount"
              value={base}
              onChange={setBase}
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
            <SliderWithInput
              label="Step-up per year"
              value={step}
              onChange={setStep}
              min={0}
              max={50}
              step={1}
              suffix="%"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ResultStat label="Maturity" value={result.maturity} currency />
          <ResultStat label="Total Invested" value={result.totalInvested} currency />
          <ResultStat label="Gains" value={result.gains} currency />
        </div>
      </section>
      <section>
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
    </div>
  );
}
