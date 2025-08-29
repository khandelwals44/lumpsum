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
import ExportButtons from "@/components/export/ExportButton";
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

  const getExportData = () => {
    // Calculate CAGR and other metrics
    const totalAmount = result.futureValue;
    const initialAmount = principal;
    const finalAmount = totalAmount;

    // CAGR calculation: (Final Value / Initial Value)^(1/Time) - 1
    const cagr = years > 0 ? (Math.pow(finalAmount / initialAmount, 1 / years) - 1) * 100 : 0;
    const absoluteReturn = result.gains;
    const roi = (result.gains / principal) * 100;

    // Monthly breakdown
    const monthlyBreakdown = result.series.slice(0, 60).map((item, index) => ({
      Month: index + 1,
      Investment: principal,
      Value: item.value,
      Interest: item.value - principal,
      "Principal Amount": principal,
      "Portfolio Value": item.value
    }));

    // Yearly breakdown
    const yearlyBreakdown = [];
    for (let year = 1; year <= years; year++) {
      const yearStart = (year - 1) * 12;
      const yearEnd = Math.min(year * 12, result.series.length);
      const yearData = result.series.slice(yearStart, yearEnd);

      const yearStartValue = yearData[0]?.value || 0;
      const yearEndValue = yearData[yearData.length - 1]?.value || 0;
      const yearGain = yearEndValue - yearStartValue;

      yearlyBreakdown.push({
        Year: year,
        "Initial Value": year === 1 ? principal : yearStartValue,
        "Final Value": yearEndValue,
        "Annual Gain": yearGain,
        "Annual Return": yearStartValue > 0 ? ((yearEndValue - yearStartValue) / yearStartValue) * 100 : 0
      });
    }

    return {
      inputs: {
        "Investment Amount": `₹${principal.toLocaleString()}`,
        "Expected Return (p.a.)": `${rate}%`,
        "Duration": `${years} years`,
        "Total Months": years * 12
      },
      results: {
        "Future Value": `₹${result.futureValue.toLocaleString()}`,
        "Total Gains": `₹${result.gains.toLocaleString()}`,
        "Return on Investment": `${roi.toFixed(2)}%`
      },
      summary: {
        "Absolute Return": `₹${absoluteReturn.toLocaleString()}`,
        "CAGR": `${cagr.toFixed(2)}%`,
        "Final Portfolio Value": `₹${result.futureValue.toLocaleString()}`,
        "Investment Strategy": "One-time Lumpsum",
        "Risk Level": "Market Risk"
      },
      chartData: result.series,
      monthlyBreakdown: monthlyBreakdown,
      yearlyBreakdown: yearlyBreakdown,
      absoluteReturn: absoluteReturn,
      cagr: cagr
    };
  };

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
              <ExportButtons
                data={getExportData()}
                title="Lumpsum Calculator Results"
                calculatorType="Lumpsum"
                elementRef={resultRef}
                layout="horizontal"
                size="md"
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
