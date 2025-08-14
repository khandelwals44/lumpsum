"use client";
import { useMemo, useState } from "react";
import { calculateLumpsum } from "@/lib/calc/lumpsum";
import { SliderWithInput } from "@/components/SliderWithInput";
import { ResultStat } from "@/components/ResultStat";
import { ChartContainer } from "@/components/ChartContainer";
import { ShareButton } from "@/components/ShareButton";
import { Line, LineChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { chartColors } from "@/lib/charts";
import { formatINR } from "@/lib/format";
import { parseParamNumber, useUrlState } from "@/lib/url";
import { useSearchParams } from "next/navigation";
import { SocialShare } from "@/components/SocialShare";
import { FadeIn } from "@/components/FadeIn";
import Link from "next/link";
import { saveLocal, loadLocal } from "@/lib/persist";
import { Calculation, SavedCalculation } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { CalendarPlus } from "lucide-react";
export default function LumpsumClient() {
  const sp = useSearchParams();
  const [principal, setPrincipal] = useState(parseParamNumber(sp, "p", 500000));
  const [rate, setRate] = useState(parseParamNumber(sp, "r", 12));
  const [years, setYears] = useState(parseParamNumber(sp, "y", 10));
  useUrlState({ p: principal, r: rate, y: years });

  const STORAGE_KEY = "savedCalculations"; // Define STORAGE_KEY

  const result = useMemo(() => calculateLumpsum(principal, rate, years), [principal, rate, years]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section className="space-y-4">
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Lumpsum Calculator</h1>
            <ShareButton />
          </div>
          <div className="mt-4 space-y-4">
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
            <button
              type="button"
              onClick={() => {
                setPrincipal(500000);
                setRate(12);
                setYears(10);
              }}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Reset
            </button>
            <SocialShare />
            <button
              type="button"
              onClick={() => {
                const newCalculation: Calculation = {
                  type: "lumpsum",
                  inputs: { principal, rate, years },
                  results: { futureValue: result.futureValue, gains: result.gains },
                  timestamp: Date.now()
                };
                const savedCalculations = loadLocal<SavedCalculation[]>(STORAGE_KEY, []);
                saveLocal(STORAGE_KEY, [...savedCalculations, { ...newCalculation, id: uuidv4() }]);
                alert("Calculation saved!");
              }}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Save Calculation
            </button>
            <button
              type="button"
              onClick={() => {
                const title = `Lumpsum Investment Reminder: ₹${principal}`;
                const description = `One-time lumpsum investment of ₹${principal} for ${years} years with expected ${rate}% return.`;
                const date = new Date();
                const isoDate = date.toISOString().replace(/-|:|\.\d{3}/g, "");
                const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description)}&dates=${isoDate}/${isoDate}`; // One-time event
                window.open(url, "_blank");
              }}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900 flex items-center gap-2 mt-2"
            >
              <CalendarPlus className="h-4 w-4" />
              Add to Calendar
            </button>
          </div>
          <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            <p>Looking for something else?</p>
            <ul className="mt-2 list-inside list-disc">
              <li>
                <Link
                  href="/calculators/sip"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Calculate SIP instead
                </Link>
              </li>
              <li>
                <Link
                  href="/calculators/invest"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Compare Lumpsum vs SIP
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ResultStat label="Future Value" value={result.futureValue} currency />
          <ResultStat label="Gains" value={result.gains} currency />
        </div>
      </section>
      <section className="space-y-4">
        <FadeIn>
          <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="text-lg font-medium">Growth over time</h2>
            <ChartContainer>
              <LineChart data={result.series} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} />
                <YAxis tickFormatter={(v) => formatINR(v as number)} tickLine={false} />
                <Tooltip formatter={(v) => formatINR(v as number)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartColors.value}
                  name="Value"
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </FadeIn>
        <article className="prose mt-2 dark:prose-invert">
          <details open>
            <summary>What is a Lumpsum investment?</summary>
            <p>A one-time investment amount that grows with compounding over time.</p>
          </details>
          <details>
            <summary>How it works (formula)</summary>
            <p>Monthly rate i = R/12/100, n = years×12. Future Value = P × (1+i)^n</p>
          </details>
          <details>
            <summary>How to use this calculator</summary>
            <ol>
              <li>Enter the one-time amount, expected annual return, and duration.</li>
              <li>Observe the compounding curve; adjust inputs to compare scenarios.</li>
              <li>Share the URL to keep your input state.</li>
            </ol>
          </details>
          <details>
            <summary>FAQs</summary>
            <ul>
              <li>Is the return guaranteed? No—market-linked.</li>
              <li>How often is compounding? We use monthly compounding here.</li>
            </ul>
          </details>
        </article>
      </section>
    </div>
  );
}
