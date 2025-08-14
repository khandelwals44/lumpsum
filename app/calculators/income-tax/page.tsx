"use client";
/** Income Tax (simplified) – UI only. Not legal/tax advice. */
import { Suspense, useMemo, useState } from "react";
import { calculateIncomeTaxNewRegime } from "@/lib/calc/incomeTax";
import { SliderWithInput } from "@/components/SliderWithInput";
import { ResultStat } from "@/components/ResultStat";
import { ShareButton } from "@/components/ShareButton";
import { useSearchParams } from "next/navigation";
import { parseParamNumber, useUrlState } from "@/lib/url";
import { formatINR } from "@/lib/format";

export default function IncomeTaxPage() {
  return (
    <Suspense
      fallback={
        <div className="h-80 w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
      }
    >
      <IncomeTaxClient />
    </Suspense>
  );
}

function IncomeTaxClient() {
  const sp = useSearchParams();
  const [gross, setGross] = useState(parseParamNumber(sp, "g", 1200000));
  const [ded, setDed] = useState(parseParamNumber(sp, "d", 50000));
  useUrlState({ g: gross, d: ded });
  const result = useMemo(() => calculateIncomeTaxNewRegime(gross, ded), [gross, ded]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section className="space-y-4">
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Income Tax (New Regime)</h1>
            <ShareButton />
          </div>
          <div className="mt-4 space-y-4">
            <SliderWithInput
              label="Gross income (annual)"
              value={gross}
              onChange={setGross}
              min={0}
              max={10000000}
              step={1000}
              suffix="₹"
            />
            <SliderWithInput
              label="Deductions (if any)"
              value={ded}
              onChange={setDed}
              min={0}
              max={500000}
              step={1000}
              suffix="₹"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ResultStat label="Taxable income" value={result.taxableIncome} currency />
          <ResultStat label="Tax payable" value={result.taxPayable} currency />
          <ResultStat label="Cess (4%)" value={result.cess} currency />
          <ResultStat label="Total tax" value={result.totalTax} currency />
        </div>
      </section>
      <section>
        <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-lg font-medium">Breakup</h2>
          <div className="mt-2 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="p-2 text-left">Slab</th>
                  <th className="p-2 text-right">Tax</th>
                </tr>
              </thead>
              <tbody>
                {result.breakup.map((row) => (
                  <tr
                    key={row.slab}
                    className="odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-950 dark:even:bg-zinc-900"
                  >
                    <td className="p-2">{row.slab}</td>
                    <td className="p-2 text-right">{formatINR(row.tax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            This is a simplified illustration only. Consult a tax professional.
          </p>
        </div>
      </section>
    </div>
  );
}
