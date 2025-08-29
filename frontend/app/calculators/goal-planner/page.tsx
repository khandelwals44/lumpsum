/**
 * Goal Planner (UI only)
 * - Computes inflation-adjusted goal and required SIP/Lumpsum via lib/calc/goal
 */
"use client";
import { Suspense, useMemo, useState, useRef } from "react";
import { calculateGoal } from "@/lib/calc/goal";
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

export default function GoalPlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="h-80 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
      }
    >
      <GoalPlannerClient />
    </Suspense>
  );
}

function GoalPlannerClient() {
  const sp = useSearchParams();
  const [goalToday, setGoalToday] = useState(parseParamNumber(sp, "g", 5000000));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 10));
  const [inflation, setInflation] = useState(parseParamNumber(sp, "inf", 6));
  const [returnPct, setReturnPct] = useState(parseParamNumber(sp, "r", 12));
  const resultRef = useRef<HTMLDivElement>(null);
  useUrlState({ g: goalToday, y: years, inf: inflation, r: returnPct });

  const result = useMemo(
    () => calculateGoal(goalToday, years, inflation, returnPct),
    [goalToday, years, inflation, returnPct]
  );

  const getExportData = () => ({
    inputs: {
      "Goal Today": `₹${goalToday.toLocaleString()}`,
      "Years": `${years} years`,
      "Inflation Rate": `${inflation}%`,
      "Expected Return": `${returnPct}%`
    },
    results: {
      "Inflation-adjusted Goal": `₹${result.inflatedGoal.toLocaleString()}`,
      "Required SIP": `₹${result.requiredSIP.toLocaleString()}`,
      "Equivalent Lumpsum": `₹${result.requiredLumpsum.toLocaleString()}`,
      "Inflation Impact": `₹${(result.inflatedGoal - goalToday).toLocaleString()}`
    },
    chartData: result.series
  });

  const shareData = {
    title: "Goal Planner Results",
    description: `To achieve ₹${goalToday.toLocaleString()} in ${years} years, you need ₹${result.requiredSIP.toLocaleString()} monthly SIP or ₹${result.requiredLumpsum.toLocaleString()} lumpsum`,
    url: window.location.href,
    calculatorType: "Goal Planner",
    results: getExportData()
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section className="space-y-4">
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Goal Planner</h1>
            <ShareButton />
          </div>
          <div className="mt-4 space-y-4">
            <SliderWithInput
              label="Goal today"
              value={goalToday}
              onChange={setGoalToday}
              min={50000}
              max={200000000}
              step={10000}
              suffix="₹"
            />
            <SliderWithInput
              label="Years"
              value={years}
              onChange={setYears}
              min={1}
              max={40}
              step={1}
            />
            <SliderWithInput
              label="Inflation"
              value={inflation}
              onChange={setInflation}
              min={0}
              max={15}
              step={0.1}
              suffix="%"
            />
            <SliderWithInput
              label="Expected return"
              value={returnPct}
              onChange={setReturnPct}
              min={0}
              max={30}
              step={0.1}
              suffix="%"
            />
            <button
              type="button"
              onClick={() => {
                setGoalToday(5000000);
                setYears(10);
                setInflation(6);
                setReturnPct(12);
              }}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Reset
            </button>
          </div>
        </div>
        <div ref={resultRef} className="grid grid-cols-2 gap-3">
          <ResultStat label="Inflation-adjusted goal" value={result.inflatedGoal} currency />
          <ResultStat label="Required SIP" value={result.requiredSIP} currency />
          <ResultStat label="Equivalent Lumpsum" value={result.requiredLumpsum} currency />
        </div>
        
        {/* Export and Share Buttons */}
        {result.inflatedGoal > 0 && (
          <div className="flex gap-2">
            <ExportButton
              data={getExportData()}
              title="Goal Planner Results"
              calculatorType="Goal Planner"
              elementRef={resultRef}
              className="flex-1"
            />
            <ShareButton />
          </div>
        )}
      </section>
      <section className="space-y-4">
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-lg font-medium">Required corpus over time</h2>
          <ChartContainer>
            <LineChart data={result.series} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} />
              <YAxis tickFormatter={(v) => formatINR(v as number)} tickLine={false} />
              <Tooltip formatter={(v) => formatINR(v as number)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="requiredCorpus"
                stroke={chartColors.value}
                name="Required corpus"
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </section>
    </div>
  );
}
