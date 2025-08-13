"use client";
import { Suspense, useMemo, useState } from "react";
import { calculateEmi } from "@/lib/calc/emi";
import { NumberInput } from "@/components/NumberInput";
import { SliderWithInput } from "@/components/SliderWithInput";
import { ResultStat } from "@/components/ResultStat";
import { ChartContainer } from "@/components/ChartContainer";
import { ShareButton } from "@/components/ShareButton";
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "@/lib/charts";
import { formatINR } from "@/lib/format";
import { useSearchParams } from "next/navigation";
import { parseParamNumber, useUrlState } from "@/lib/url";

export default function EmiPage() {
  return (
    <Suspense
      fallback={
        <div className="h-80 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
      }
    >
      <EmiClient />
    </Suspense>
  );
}

function EmiClient() {
  const sp = useSearchParams();
  const [principal, setPrincipal] = useState<number>(parseParamNumber(sp, "p", 1000000));
  const [rate, setRate] = useState<number>(parseParamNumber(sp, "r", 9));
  const [months, setMonths] = useState<number>(parseParamNumber(sp, "n", 120));

  useUrlState({ p: principal, r: rate, n: months });

  const result = useMemo(() => calculateEmi(principal, rate, months), [principal, rate, months]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section className="space-y-4">
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">EMI Calculator</h1>
            <ShareButton />
          </div>
          <div className="mt-4 space-y-4">
            <NumberInput label="Loan amount" value={principal} onChange={setPrincipal} suffix="₹" />
            <SliderWithInput
              label="Interest rate"
              value={rate}
              onChange={setRate}
              min={0}
              max={30}
              step={0.1}
              suffix="%"
            />
            <SliderWithInput
              label="Tenure (months)"
              value={months}
              onChange={setMonths}
              min={1}
              max={480}
              step={1}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPrincipal(1000000);
                  setRate(9);
                  setMonths(120);
                }}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ResultStat label="EMI" value={result.emi} currency />
          <ResultStat label="Total Interest" value={result.totalInterest} currency />
          <ResultStat label="Total Payment" value={result.totalPayment} currency />
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-lg font-medium">Amortization</h2>
          <ChartContainer>
            <AreaChart data={result.schedule} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} />
              <YAxis tickFormatter={(v) => formatINR(v as number)} tickLine={false} />
              <Tooltip formatter={(v) => formatINR(v as number)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="principal"
                stackId="1"
                stroke={chartColors.principal}
                fill={chartColors.principal}
                name="Principal"
              />
              <Area
                type="monotone"
                dataKey="interest"
                stackId="1"
                stroke={chartColors.interest}
                fill={chartColors.interest}
                name="Interest"
              />
            </AreaChart>
          </ChartContainer>
        </div>
        <ExportTable schedule={result.schedule} />
      </section>
    </div>
  );
}

function ExportTable({ schedule }: { schedule: ReturnType<typeof calculateEmi>["schedule"] }) {
  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 p-3 text-sm dark:border-zinc-800">
        <span>Amortization table</span>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(
            ["Month,Principal,Interest,Balance"]
              .concat(schedule.map((s) => `${s.month},${s.principal},${s.interest},${s.balance}`))
              .join("\n")
          )}`}
          download="emi-amortization.csv"
          className="rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Export CSV
        </a>
      </div>
      <div className="max-h-80 overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="p-2">Month</th>
              <th className="p-2">Principal</th>
              <th className="p-2">Interest</th>
              <th className="p-2">Balance</th>
            </tr>
          </thead>
          <tbody>
            {schedule.slice(0, 240).map((s) => (
              <tr
                key={s.month}
                className="odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-950 dark:even:bg-zinc-900"
              >
                <td className="p-2">{s.month}</td>
                <td className="p-2">{formatINR(s.principal)}</td>
                <td className="p-2">{formatINR(s.interest)}</td>
                <td className="p-2">{formatINR(s.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
