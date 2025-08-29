#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of calculators to update
const calculators = [
  'fd',
  'ppf', 
  'rd',
  'swp',
  'nps',
  'gst',
  'income-tax',
  'xirr',
  'goal-planner',
  'step-up-sip'
];

// Template for modern calculator layout
const modernCalculatorTemplate = (calculatorName, title, description, inputs, results, chartData) => `
/**
 * ${title} Calculator Page (UI only)
 * - Modern UI/UX with improved styling
 */
"use client";
import { Suspense, useMemo, useState, useRef } from "react";
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

export default function ${calculatorName.charAt(0).toUpperCase() + calculatorName.slice(1)}Page() {
  return (
    <Suspense
      fallback={
        <div className="h-80 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
      }
    >
      <${calculatorName.charAt(0).toUpperCase() + calculatorName.slice(1)}Client />
    </Suspense>
  );
}

function ${calculatorName.charAt(0).toUpperCase() + calculatorName.slice(1)}Client() {
  const sp = useSearchParams();
  const [principal, setPrincipal] = useState(parseParamNumber(sp, "p", 100000));
  const [rate, setRate] = useState(parseParamNumber(sp, "r", 8));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 5));
  const resultRef = useRef<HTMLDivElement>(null);
  
  useUrlState({ p: principal, r: rate, y: years });

  const result = useMemo(() => {
    // Placeholder calculation - replace with actual calculation function
    const maturity = principal * Math.pow(1 + rate / 100, years);
    const interest = maturity - principal;
    return {
      maturity,
      interest,
      series: Array.from({ length: years * 12 }, (_, i) => ({
        month: i + 1,
        value: principal * Math.pow(1 + rate / 100, (i + 1) / 12)
      }))
    };
  }, [principal, rate, years]);

  const getExportData = () => ({
    inputs: {
      "Principal": \`₹\${principal.toLocaleString()}\`,
      "Interest Rate (p.a.)": \`\${rate}%\`,
      "Duration": \`\${years} years\`
    },
    results: {
      "Maturity Amount": \`₹\${result.maturity.toLocaleString()}\`,
      "Interest Earned": \`₹\${result.interest.toLocaleString()}\`,
      "Return on Investment": \`\${((result.interest / principal) * 100).toFixed(2)}%\`
    },
    chartData: result.series
  });

  const shareData = {
    title: "${title} Calculator Results",
    description: \`Investment of ₹\${principal.toLocaleString()} for \${years} years at \${rate}% p.a. would grow to ₹\${result.maturity.toLocaleString()}\`,
    url: typeof window !== 'undefined' ? window.location.href : '',
    calculatorType: "${title}",
    results: getExportData()
  };

  return (
    <CalculatorLayout 
      title="${title}" 
      description="${description}"
    >
      {/* Input Section */}
      <CalculatorCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Investment Details</h2>
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
            max={20}
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
        </div>
      </CalculatorCard>

      {/* Results Section */}
      <div className="space-y-6">
        <ResultsCard>
          <div ref={resultRef}>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Investment Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultStat label="Maturity Amount" value={result.maturity} currency />
              <ResultStat label="Interest Earned" value={result.interest} currency />
              <ResultStat label="ROI" value={(result.interest / principal) * 100} suffix="%" />
            </div>
          </div>
          
          {/* Export and Share Buttons */}
          {result.maturity > 0 && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
              <ExportButton
                data={getExportData()}
                title="${title} Calculator Results"
                calculatorType="${title}"
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
`;

// Function to update a calculator
function updateCalculator(calculatorName) {
  const calculatorPath = path.join(__dirname, 'frontend', 'app', 'calculators', calculatorName, 'page.tsx');
  
  if (!fs.existsSync(calculatorPath)) {
    console.log(`Calculator ${calculatorName} not found at ${calculatorPath}`);
    return;
  }

  const title = calculatorName.toUpperCase();
  const description = `Calculate your ${calculatorName.toUpperCase()} investment returns with detailed growth projections`;
  
  const newContent = modernCalculatorTemplate(calculatorName, title, description);
  
  // Backup original file
  const backupPath = calculatorPath + '.backup';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(calculatorPath, backupPath);
    console.log(`Backed up ${calculatorName} to ${backupPath}`);
  }
  
  // Write new content
  fs.writeFileSync(calculatorPath, newContent);
  console.log(`Updated ${calculatorName} calculator with modern UI/UX`);
}

// Update all calculators
console.log('Starting calculator UI/UX modernization...');
calculators.forEach(updateCalculator);
console.log('Completed calculator UI/UX modernization!');
