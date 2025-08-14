"use client";
import { Suspense, useMemo, useState } from "react";
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

export default function SwpPage() {
  return (
    <Suspense
      fallback={
        <div className="h-80 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
      }
    >
      <SwpClient />
    </Suspense>
  );
}

function SwpClient() {
  const sp = useSearchParams();
  const [corpus, setCorpus] = useState(parseParamNumber(sp, "c", 1000000));
  const [withdrawal, setWithdrawal] = useState(parseParamNumber(sp, "w", 15000));
  const [rate, setRate] = useState(parseParamNumber(sp, "r", 10));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 20));
  useUrlState({ c: corpus, w: withdrawal, r: rate, y: years });

  const result = useMemo(
    () => calculateSwp(corpus, withdrawal, rate, years),
    [corpus, withdrawal, rate, years]
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
        <div className="grid grid-cols-2 gap-3">
          <ResultStat label="Months survived" value={result.monthsSurvived} />
          <ResultStat label="Total withdrawn" value={result.totalWithdrawn} currency />
          <ResultStat label="Total interest" value={result.totalInterest} currency />
          <ResultStat label="Ending balance" value={result.endingBalance} currency />
        </div>
      </section>
      <section>
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
    </div>
  );
}
