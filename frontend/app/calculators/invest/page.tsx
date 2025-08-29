/**
 * Combined SIP/Lumpsum page
 * - Keeps UI concerns here (inputs, layout, charts)
 * - All math stays in lib/calc/{sip,lumpsum}.ts so it is testable and reusable
 * - State is synced to the URL for shareable links
 * - Modern UI/UX with export functionality
 */
"use client";
import { Suspense, useMemo, useState, useRef } from "react";
import { calculateSip } from "@/lib/calc/sip";
import { calculateLumpsum } from "@/lib/calc/lumpsum";
import { SliderWithInput } from "@/components/SliderWithInput";
import { ResultStat } from "@/components/ResultStat";
import { ShareButton } from "@/components/ShareButton";
import ExportButtons from "@/components/export/ExportButton";
import { ChartContainer } from "@/components/ChartContainer";
import { CalculatorLayout, CalculatorCard, ResultsCard } from "@/components/CalculatorLayout";
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
  const resultRef = useRef<HTMLDivElement>(null);
  
  useUrlState({ mode, a: amount, p: principal, r: rate, y: years });

  // Pure calculations – no UI logic inside calc files
  const sip = useMemo(() => calculateSip(amount, rate, years), [amount, rate, years]);
  const lump = useMemo(() => calculateLumpsum(principal, rate, years), [principal, rate, years]);

  const data = mode === "sip" ? sip.series : lump.series;
  const result = mode === "sip" ? sip : lump;

  const getExportData = () => {
    const result = mode === "sip" ? sip : lump;

    // Calculate CAGR and other metrics
    const totalAmount = mode === "sip" ? sip.maturity : lump.futureValue;
    const initialAmount = mode === "sip" ? sip.totalInvested : principal;
    const finalAmount = totalAmount;

    // CAGR calculation: (Final Value / Initial Value)^(1/Time) - 1
    const cagr = years > 0 ? (Math.pow(finalAmount / initialAmount, 1 / years) - 1) * 100 : 0;
    const absoluteReturn = mode === "sip" ? sip.gains : lump.gains;
    const roi = (absoluteReturn / initialAmount) * 100;

    // Monthly breakdown
    const monthlyBreakdown = data.slice(0, 60).map((item, index) => ({
      Month: index + 1,
      Investment: mode === "sip" ? amount : (index === 0 ? principal : 0),
      Value: item.value,
      Interest: mode === "sip"
        ? item.value - (amount * (index + 1))
        : item.value - principal,
      "Total Invested": mode === "sip" ? amount * (index + 1) : principal,
      "Portfolio Value": item.value
    }));

    // Yearly breakdown
    const yearlyBreakdown = [];
    for (let year = 1; year <= years; year++) {
      const yearStart = (year - 1) * 12;
      const yearEnd = Math.min(year * 12, data.length);
      const yearData = data.slice(yearStart, yearEnd);

      if (mode === "sip") {
        const yearInvestment = yearData.length * amount;
        const yearStartValue = yearData[0]?.value || 0;
        const yearEndValue = yearData[yearData.length - 1]?.value || 0;
        const yearGain = yearEndValue - (yearData.length * amount);

        yearlyBreakdown.push({
          Year: year,
          "Annual Investment": yearInvestment,
          "Portfolio Value": yearEndValue,
          "Annual Gain": yearGain,
          "Annual Return": yearStartValue > 0 ? ((yearEndValue - yearStartValue) / yearStartValue) * 100 : 0
        });
      } else {
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
    }

    return {
      inputs: mode === "sip" ? {
        "Monthly Investment": `₹${amount.toLocaleString()}`,
        "Expected Return (p.a.)": `${rate}%`,
        "Duration": `${years} years`,
        "Total Months": years * 12,
        "Investment Type": "Systematic Investment Plan (SIP)"
      } : {
        "Investment Amount": `₹${principal.toLocaleString()}`,
        "Expected Return (p.a.)": `${rate}%`,
        "Duration": `${years} years`,
        "Total Months": years * 12,
        "Investment Type": "One-time Lumpsum"
      },
      results: mode === "sip" ? {
        "Maturity Value": `₹${sip.maturity.toLocaleString()}`,
        "Total Invested": `₹${sip.totalInvested.toLocaleString()}`,
        "Total Gains": `₹${sip.gains.toLocaleString()}`,
        "Return on Investment": `${roi.toFixed(2)}%`
      } : {
        "Future Value": `₹${lump.futureValue.toLocaleString()}`,
        "Total Gains": `₹${lump.gains.toLocaleString()}`,
        "Return on Investment": `${roi.toFixed(2)}%`
      },
      summary: {
        "Absolute Return": `₹${absoluteReturn.toLocaleString()}`,
        "CAGR": `${cagr.toFixed(2)}%`,
        "Final Portfolio Value": `₹${totalAmount.toLocaleString()}`,
        "Investment Strategy": mode === "sip" ? "Monthly SIP" : "One-time Lumpsum",
        "Average Annual Investment": mode === "sip" ? `₹${(sip.totalInvested / years).toLocaleString()}` : `₹${principal.toLocaleString()}`,
        "Power of Compounding": mode === "sip" ? "Monthly Contributions" : "Single Investment"
      },
      chartData: data,
      monthlyBreakdown: monthlyBreakdown,
      yearlyBreakdown: yearlyBreakdown,
      absoluteReturn: absoluteReturn,
      cagr: cagr
    };
  };

  const shareData = {
    title: `${mode.toUpperCase()} Calculator Results`,
    description: mode === "sip" 
      ? `Monthly investment of ₹${amount.toLocaleString()} for ${years} years at ${rate}% p.a. would grow to ₹${sip.maturity.toLocaleString()}`
      : `Investment of ₹${principal.toLocaleString()} for ${years} years at ${rate}% p.a. would grow to ₹${lump.futureValue.toLocaleString()}`,
    url: typeof window !== 'undefined' ? window.location.href : '',
    calculatorType: mode === "sip" ? "SIP" : "Lumpsum",
    results: getExportData()
  };

  return (
    <CalculatorLayout 
      title="Investment Calculator" 
      description={`Calculate your ${mode.toUpperCase()} investment returns with detailed growth projections`}
    >
      {/* Input Section */}
      <CalculatorCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Investment Details</h2>
          <ShareButton />
        </div>
        
        {/* Mode Toggle */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm">
            <button
              className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                mode === "sip" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
              onClick={() => setMode("sip")}
            >
              SIP
            </button>
            <button
              className={`rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
                mode === "lumpsum" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
              onClick={() => setMode("lumpsum")}
            >
              Lumpsum
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
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
      </CalculatorCard>

      {/* Results Section */}
      <div className="space-y-6">
        <ResultsCard>
          <div ref={resultRef}>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              {mode === "sip" ? "SIP Results" : "Lumpsum Results"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Summary tiles reuse ResultStat for consistent formatting */}
              {mode === "sip" ? (
                <>
                  <ResultStat label="Maturity Value" value={sip.maturity} currency />
                  <ResultStat label="Total Invested" value={sip.totalInvested} currency />
                  <ResultStat label="Total Gains" value={sip.gains} currency />
                  <ResultStat label="ROI" value={(sip.gains / sip.totalInvested) * 100} suffix="%" />
                </>
              ) : (
                <>
                  <ResultStat label="Future Value" value={lump.futureValue} currency />
                  <ResultStat label="Total Gains" value={lump.gains} currency />
                  <ResultStat label="ROI" value={(lump.gains / principal) * 100} suffix="%" />
                </>
              )}
            </div>
          </div>
          
          {/* Export and Share Buttons */}
          {result && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
              <ExportButtons
                data={getExportData()}
                title={`${mode.toUpperCase()} Calculator Results`}
                calculatorType={mode === "sip" ? "SIP" : "Lumpsum"}
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
          {/* Charts are lazy-mounted via ChartContainer to keep bundle light */}
          <ChartContainer>
            <LineChart 
              data={data} 
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
              {mode === "sip" ? (
                <>
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
                </>
              ) : (
                <Line
                  dataKey="value"
                  type="monotone"
                  stroke={chartColors.value}
                  name="Value"
                  dot={false}
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ChartContainer>
        </CalculatorCard>
      </div>
    </CalculatorLayout>
  );
}
