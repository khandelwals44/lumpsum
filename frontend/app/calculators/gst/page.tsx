"use client";
import { useMemo, useState } from "react";
import { calculateGst, type GstMode } from "@/lib/calc/gst";
import { SliderWithInput } from "@/components/SliderWithInput";
import { ResultStat } from "@/components/ResultStat";
import { ShareButton } from "@/components/ShareButton";
import { formatINR } from "@/lib/format";

export default function GstPage() {
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(18);
  const [mode, setMode] = useState<GstMode>("exclusive");
  const res = useMemo(() => calculateGst(amount, rate, mode), [amount, rate, mode]);
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section className="space-y-4">
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">GST Calculator</h1>
            <ShareButton />
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <button
                className={`rounded px-3 py-1 ${mode === "exclusive" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 dark:border-zinc-700"}`}
                onClick={() => setMode("exclusive")}
              >
                Price is without GST
              </button>
              <button
                className={`rounded px-3 py-1 ${mode === "inclusive" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-zinc-300 dark:border-zinc-700"}`}
                onClick={() => setMode("inclusive")}
              >
                Price has GST included
              </button>
            </div>
            <SliderWithInput
              label={mode === "exclusive" ? "Base amount" : "Gross amount"}
              value={amount}
              onChange={setAmount}
              min={0}
              max={1000000}
              step={10}
              suffix="₹"
            />
            <SliderWithInput
              label="GST Rate"
              value={rate}
              onChange={setRate}
              min={0}
              max={28}
              step={1}
              suffix="%"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ResultStat label="Base" value={res.base} currency />
          <ResultStat label="Tax" value={res.tax} currency />
          <ResultStat label="CGST" value={res.cgst} currency />
          <ResultStat label="SGST" value={res.sgst} currency />
          <ResultStat label="Gross" value={res.gross} currency />
        </div>
      </section>
      <section>
        <div className="rounded-md border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <h2 className="text-lg font-medium">Explanation</h2>
          <p className="mt-2">
            GST calculated at {rate}%{" "}
            {mode === "exclusive"
              ? `on ₹${formatINR(amount).replace(/^₹/, "")} base`
              : `from gross ₹${formatINR(amount).replace(/^₹/, "")}`}
            .
          </p>
          <details className="mt-3">
            <summary>FAQs</summary>
            <ul className="list-inside list-disc">
              <li>
                For intra-state supply, CGST+SGST split equally; for inter-state, IGST applies.
              </li>
              <li>Rates vary by category; check the latest GST schedule.</li>
            </ul>
          </details>
        </div>
      </section>
    </div>
  );
}
