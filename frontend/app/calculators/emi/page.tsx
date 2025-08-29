/**
 * EMI Calculator Page (UI only)
 * - Keeps state, inputs, charts, and table rendering here
 * - Delegates all math to lib/calc/emi
 * - Syncs URL for shareable state
 * - Modern UI/UX with improved styling
 */
"use client";
import { Suspense, useMemo, useState, useRef } from "react";
import { calculateEmi } from "@/lib/calc/emi";
import { NumberInput } from "@/components/NumberInput";
import { SliderWithInput } from "@/components/SliderWithInput";
import { ResultStat } from "@/components/ResultStat";
import { ChartContainer } from "@/components/ChartContainer";
import { ShareButton } from "@/components/ShareButton";
import ExportButton from "@/components/export/ExportButton";
import { SocialShare } from "@/components/SocialShare";
import { CalculatorLayout, CalculatorCard, ResultsCard } from "@/components/CalculatorLayout";
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
  const resultRef = useRef<HTMLDivElement>(null);

  useUrlState({ p: principal, r: rate, n: months });

  const result = useMemo(() => calculateEmi(principal, rate, months), [principal, rate, months]);

  const getExportData = () => ({
    inputs: {
      "Loan Amount": `₹${principal.toLocaleString()}`,
      "Interest Rate (p.a.)": `${rate}%`,
      "Tenure": `${months} months`
    },
    results: {
      "EMI": `₹${result.emi.toLocaleString()}`,
      "Total Interest": `₹${result.totalInterest.toLocaleString()}`,
      "Total Payment": `₹${result.totalPayment.toLocaleString()}`,
      "Interest Rate": `${((result.totalInterest / principal) * 100).toFixed(2)}%`
    },
    chartData: result.schedule
  });

  const shareData = {
    title: "EMI Calculator Results",
    description: `EMI of ₹${result.emi.toLocaleString()} for loan of ₹${principal.toLocaleString()} at ${rate}% p.a. for ${months} months`,
    url: typeof window !== 'undefined' ? window.location.href : '',
    calculatorType: "EMI",
    results: getExportData()
  };

  return (
    <CalculatorLayout 
      title="EMI Calculator" 
      description="Calculate your Equated Monthly Installment (EMI) for loans with detailed amortization schedule"
    >
      {/* Input Section */}
      <CalculatorCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Loan Details</h2>
          <ShareButton />
        </div>
        
        <div className="space-y-6">
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
          
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setPrincipal(1000000);
                setRate(9);
                setMonths(120);
              }}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors duration-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Reset
            </button>
            <SocialShare />
          </div>
        </div>
      </CalculatorCard>

      {/* Results Section */}
      <div className="space-y-6">
        <ResultsCard>
          <div ref={resultRef}>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">EMI Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ResultStat label="Monthly EMI" value={result.emi} currency />
              <ResultStat label="Total Interest" value={result.totalInterest} currency />
              <ResultStat label="Total Payment" value={result.totalPayment} currency />
            </div>
          </div>
          
          {/* Export and Share Buttons */}
          {result.emi > 0 && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
              <ExportButton
                data={getExportData()}
                title="EMI Calculator Results"
                calculatorType="EMI"
                elementRef={resultRef}
                className="flex-1"
              />
              <ShareButton />
            </div>
          )}
        </ResultsCard>

        {/* Chart Section */}
        <CalculatorCard>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Amortization Chart</h3>
          <ChartContainer>
            <AreaChart 
              data={result.schedule} 
              margin={{ left: 60, right: 30, top: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                tickFormatter={(v) => formatINR(v as number)} 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                width={80}
              />
              <Tooltip 
                formatter={(v) => formatINR(v as number)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="principal"
                stackId="1"
                stroke={chartColors.principal}
                fill={chartColors.principal}
                name="Principal"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="interest"
                stackId="1"
                stroke={chartColors.interest}
                fill={chartColors.interest}
                name="Interest"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
                 </CalculatorCard>

         {/* Amortization Table */}
         <CalculatorCard>
           <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Amortization Schedule</h3>
           <ExportTable schedule={result.schedule} />
         </CalculatorCard>

         {/* Educational Content */}
        <CalculatorCard>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Understanding EMI</h3>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <details open className="mb-4">
              <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400">
                What is EMI?
              </summary>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                EMI (Equated Monthly Instalment) is a fixed payment you make every month to repay a
                loan. It includes both interest and principal components.
              </p>
            </details>
            <details className="mb-4">
              <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400">
                How it works (formula)
              </summary>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Monthly rate r = annual rate / 12 / 100. EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
              </p>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Each month the interest is computed on the outstanding balance and the remaining goes
                towards principal. The schedule above shows this breakup.
              </p>
            </details>
            <details className="mb-4">
              <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400">
                How to use this calculator
              </summary>
              <ol className="mt-2 text-zinc-600 dark:text-zinc-400 list-decimal list-inside space-y-1">
                <li>Enter loan amount, annual interest rate, and tenure in months.</li>
                <li>Use the sliders for quick adjustments.</li>
                <li>Share the URL to send your scenario to others.</li>
              </ol>
            </details>
            <details>
              <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400">
                FAQs
              </summary>
              <ul className="mt-2 text-zinc-600 dark:text-zinc-400 list-disc list-inside space-y-1">
                <li>Can I prepay? Yes—prepayment reduces balance and total interest.</li>
                <li>Why does EMI change at zero rate? At 0%, EMI is simply principal/tenure.</li>
                <li>
                  Is processing fee included? Not in this calculator; add it to principal if needed.
                </li>
              </ul>
            </details>
          </div>
        </CalculatorCard>
      </div>
    </CalculatorLayout>
  );
}

function ExportTable({ schedule }: { schedule: ReturnType<typeof calculateEmi>["schedule"] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-800">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">Amortization Schedule</span>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(
            ["Month,Principal,Interest,Balance"]
              .concat(schedule.map((s) => `${s.month},${s.principal},${s.interest},${s.balance}`))
              .join("\n")
          )}`}
          download="emi-amortization.csv"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors duration-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Export CSV
        </a>
      </div>
      <div className="max-h-80 overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
            <tr>
              <th className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">Month</th>
              <th className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">Principal</th>
              <th className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">Interest</th>
              <th className="p-3 font-semibold text-zinc-900 dark:text-zinc-100">Balance</th>
            </tr>
          </thead>
          <tbody>
            {schedule.slice(0, 240).map((s) => (
              <tr
                key={s.month}
                className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors duration-150"
              >
                <td className="p-3 font-medium text-zinc-900 dark:text-zinc-100">{s.month}</td>
                <td className="p-3 text-zinc-700 dark:text-zinc-300">{formatINR(s.principal)}</td>
                <td className="p-3 text-zinc-700 dark:text-zinc-300">{formatINR(s.interest)}</td>
                <td className="p-3 text-zinc-700 dark:text-zinc-300">{formatINR(s.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
