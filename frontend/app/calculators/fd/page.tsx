/**
 * FD Calculator (UI only)
 * - Uses lib/calc/fd for maturity and yearly series
 * - Modern UI/UX with improved styling
 */
"use client";
import { Suspense, useMemo, useState, useRef } from "react";
import { calculateFd } from "@/lib/calc/fd";
import { SliderWithInput } from "@/components/SliderWithInput";
import { ResultStat } from "@/components/ResultStat";
import { ChartContainer } from "@/components/ChartContainer";
import { ShareButton } from "@/components/ShareButton";
import ExportButton from "@/components/export/ExportButton";
import { CalculatorLayout, CalculatorCard, ResultsCard } from "@/components/CalculatorLayout";
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
    url: typeof window !== 'undefined' ? window.location.href : '',
    calculatorType: "FD",
    results: getExportData()
  };

  return (
    <CalculatorLayout 
      title="FD Calculator" 
      description="Calculate your Fixed Deposit returns with detailed maturity projections"
    >
      {/* Input Section */}
      <CalculatorCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">FD Details</h2>
          <ShareButton />
        </div>
        
        <div className="space-y-6">
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
            label="Duration (years)"
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
        </div>
      </CalculatorCard>

      {/* Results Section */}
      <div className="space-y-6">
        <ResultsCard>
          <div ref={resultRef}>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">FD Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultStat label="Maturity Amount" value={result.maturity} currency />
              <ResultStat label="Interest Earned" value={result.interestEarned} currency />
              <ResultStat label="ROI" value={(result.interestEarned / principal) * 100} suffix="%" />
              <ResultStat label="Effective Annual Rate" value={(Math.pow(1 + rate / (100 * m), m) - 1) * 100} suffix="%" />
            </div>
          </div>
          
          {/* Export and Share Buttons */}
          {result.maturity > 0 && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
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
        </ResultsCard>

        {/* Chart Section */}
        <CalculatorCard>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Growth Over Time</h3>
          <ChartContainer>
            <LineChart 
              data={result.series} 
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
              <Line
                dataKey="value"
                type="monotone"
                stroke={chartColors.value}
                name="FD Value"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        </CalculatorCard>
      </div>
    </CalculatorLayout>
  );
}
