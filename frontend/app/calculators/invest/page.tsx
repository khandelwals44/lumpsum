/**
 * Combined SIP/Lumpsum page
 * - Keeps UI concerns here (inputs, layout, charts)
 * - All math stays in lib/calc/{sip,lumpsum}.ts so it is testable and reusable
 * - State is synced to the URL for shareable links
 */
"use client";
import { Suspense, useMemo, useState } from "react";
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

type Mode = "sip" | "lumpsum";

export default function InvestPage() {
  return (
    <Suspense
      fallback={
        <div className="h-80 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
      }
    >
      <InvestClient />
    </Suspense>
  );
}

function InvestClient() {
  const sp = useSearchParams();
  // UI state – defaults, then hydrated from URL if present
  const [mode, setMode] = useState<Mode>((sp?.get("mode") as Mode) || "sip");
  const [amount, setAmount] = useState(parseParamNumber(sp, "a", 10000));
  const [principal, setPrincipal] = useState(parseParamNumber(sp, "p", 500000));
  const [rate, setRate] = useState(parseParamNumber(sp, "r", 12));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 10));
  useUrlState({ mode, a: amount, p: principal, r: rate, y: years });

  // Pure calculations – no UI logic inside calc files
  const sip = useMemo(() => calculateSip(amount, rate, years), [amount, rate, years]);
  const lump = useMemo(() => calculateLumpsum(principal, rate, years), [principal, rate, years]);

  const data = mode === "sip" ? sip.series : lump.series;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
      </section>
      <section>
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
    </div>
  );
}
