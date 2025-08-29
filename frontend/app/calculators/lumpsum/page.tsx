/**
 * Lumpsum Calculator Page (UI only)
 * - Delegates FV math to lib/calc/lumpsum
 * - Modern UI/UX with improved styling
 */
"use client";
import { Suspense, useMemo, useState, useRef } from "react";
import { calculateLumpsum } from "@/lib/calc/lumpsum";
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
    url: typeof window !== 'undefined' ? window.location.href : '',
    calculatorType: "Lumpsum",
    results: getExportData()
  };

  return (
    <CalculatorLayout 
      title="Lumpsum Calculator" 
      description="Calculate your one-time investment returns with detailed growth projections"
    >
      {/* Input Section */}
      <CalculatorCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Investment Details</h2>
          <ShareButton />
        </div>
        
        <div className="space-y-6">
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
          
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setPrincipal(500000);
                setRate(12);
                setYears(10);
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
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Investment Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultStat label="Future Value" value={result.futureValue} currency />
              <ResultStat label="Total Gains" value={result.gains} currency />
              <ResultStat label="ROI" value={(result.gains / principal) * 100} suffix="%" />
            </div>
          </div>
          
          {/* Export and Share Buttons */}
          {result.futureValue > 0 && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
              <ExportButton
                data={getExportData()}
                title="Lumpsum Calculator Results"
                calculatorType="Lumpsum"
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
                name="Investment Value"
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
