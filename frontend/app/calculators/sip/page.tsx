/**
 * SIP Calculator Page (UI only)
 * - Uses calculateSip from lib/calc/sip for all math
 * - Offers monthly/yearly toggle for the chart
 * - Modern UI/UX with improved styling
 */
"use client";
import { Suspense, useMemo, useState, useRef } from "react";
import { calculateSip } from "@/lib/calc/sip";
import { SliderWithInput } from "@/components/SliderWithInput";
import { ResultStat } from "@/components/ResultStat";
import { ChartContainer } from "@/components/ChartContainer";
import { ShareButton } from "@/components/ShareButton";
import ExportButton from "@/components/export/ExportButton";
import { CalculatorLayout, CalculatorCard, ResultsCard } from "@/components/CalculatorLayout";
import { Line, LineChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis, Brush } from "recharts";
import { chartColors } from "@/lib/charts";
import { formatINR } from "@/lib/format";
import { parseParamNumber, useUrlState } from "@/lib/url";
import { useSearchParams } from "next/navigation";
import { Timeframe, TimeframeToggle } from "@/components/TimeframeToggle";
import { SocialShare } from "@/components/SocialShare";
import { FadeIn } from "@/components/FadeIn";
import { saveLocal, loadLocal } from "@/lib/persist";
import { Calculation, SavedCalculation } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { Api } from "@/lib/api";
import { getApiConfig } from '@/lib/env.client';

export default function SipPage() {
  return (
    <Suspense
      fallback={
        <div className="h-80 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
      }
    >
      <SipClient />
    </Suspense>
  );
}

function SipClient() {
  const sp = useSearchParams();
  const [amount, setAmount] = useState(parseParamNumber(sp, "a", 10000));
  const [rate, setRate] = useState(parseParamNumber(sp, "r", 12));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 15));
  const [tf, setTf] = useState<Timeframe>("monthly");
  const resultRef = useRef<HTMLDivElement>(null);
  useUrlState({ a: amount, r: rate, y: years });

  const result = useMemo(() => calculateSip(amount, rate, years), [amount, rate, years]);
  const chartData = useMemo(() => {
    if (tf === "monthly") return result.series;
    const out: { month: number; invested: number; value: number }[] = [];
    for (let i = 0; i < result.series.length; i += 12) {
      const chunk = result.series.slice(i, i + 12);
      if (chunk.length) {
        const last = chunk[chunk.length - 1]!;
        out.push({ month: (i + 12) / 12, invested: last.invested, value: last.value });
      }
    }
    return out;
  }, [result.series, tf]);

  const getExportData = () => ({
    inputs: {
      "Monthly Investment": `₹${amount.toLocaleString()}`,
      "Expected Return (p.a.)": `${rate}%`,
      "Duration": `${years} years`
    },
    results: {
      "Maturity Amount": `₹${result.maturity.toLocaleString()}`,
      "Total Invested": `₹${result.totalInvested.toLocaleString()}`,
      "Total Gains": `₹${result.gains.toLocaleString()}`,
      "Return on Investment": `${((result.gains / result.totalInvested) * 100).toFixed(2)}%`
    },
    chartData: chartData
  });

  const shareData = {
    title: "SIP Calculator Results",
    description: `Monthly investment of ₹${amount.toLocaleString()} for ${years} years at ${rate}% p.a. would grow to ₹${result.maturity.toLocaleString()}`,
    url: typeof window !== 'undefined' ? window.location.href : '',
    calculatorType: "SIP",
    results: getExportData()
  };

  return (
    <CalculatorLayout 
      title="SIP Calculator" 
      description="Calculate your Systematic Investment Plan (SIP) returns with detailed growth projections"
    >
      {/* Input Section */}
      <CalculatorCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Investment Details</h2>
          <ShareButton />
        </div>
        
        <div className="space-y-6">
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
          
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <SocialShare />
          </div>
        </div>
      </CalculatorCard>

      {/* Results Section */}
      <div className="space-y-6">
        <ResultsCard>
          <div ref={resultRef}>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">SIP Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultStat label="Maturity Amount" value={result.maturity} currency />
              <ResultStat label="Total Invested" value={result.totalInvested} currency />
              <ResultStat label="Total Gains" value={result.gains} currency />
              <ResultStat label="ROI" value={(result.gains / result.totalInvested) * 100} suffix="%" />
            </div>
          </div>
          
          {/* Export and Share Buttons */}
          {result.maturity > 0 && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
              <ExportButton
                data={getExportData()}
                title="SIP Calculator Results"
                calculatorType="SIP"
                elementRef={resultRef}
                className="flex-1"
              />
              <ShareButton />
            </div>
          )}
        </ResultsCard>

        {/* Chart Section */}
        <CalculatorCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Growth Over Time</h3>
            <TimeframeToggle value={tf} onChange={setTf} />
          </div>
          
          <ChartContainer>
            <LineChart 
              data={chartData} 
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
                dataKey="invested"
                type="monotone"
                stroke={chartColors.invested}
                name="Invested"
                dot={false}
                strokeWidth={2}
              />
              <Line
                dataKey="value"
                type="monotone"
                stroke={chartColors.value}
                name="Value"
                dot={false}
                strokeWidth={2}
              />
              <Brush dataKey="month" height={30} stroke={chartColors.value} />
            </LineChart>
          </ChartContainer>
        </CalculatorCard>
      </div>
    </CalculatorLayout>
  );
}
