"use client";
/** XIRR calculator – UI for irregular cash flows */
import { useMemo, useState, useRef } from "react";
import { xirr, CashFlow } from "@/lib/calc/xirr";
import { ResultStat } from "@/components/ResultStat";
import { ShareButton } from "@/components/ShareButton";
import ExportButton from "@/components/export/ExportButton";
import { formatNumber } from "@/lib/format";

export default function XirrPage() {
  const [rows, setRows] = useState<CashFlow[]>([
    { date: new Date(new Date().getFullYear() - 1, 0, 1), amount: -100000 },
    { date: new Date(), amount: 112000 }
  ]);
  const resultRef = useRef<HTMLDivElement>(null);

  const rate = useMemo(() => xirr(rows), [rows]);

  const getExportData = () => ({
    inputs: {
      "Number of Cash Flows": rows.length.toString(),
      "Date Range": `${rows[0]?.date.toLocaleDateString()} to ${rows[rows.length - 1]?.date.toLocaleDateString()}`,
      "Total Investment": `₹${Math.abs(rows.filter(r => r.amount < 0).reduce((sum, r) => sum + r.amount, 0)).toLocaleString()}`,
      "Total Returns": `₹${rows.filter(r => r.amount > 0).reduce((sum, r) => sum + r.amount, 0).toLocaleString()}`
    },
    results: {
      "Annualized Return (XIRR)": `${rate.toFixed(2)}%`,
      "Total Investment": `₹${Math.abs(rows.filter(r => r.amount < 0).reduce((sum, r) => sum + r.amount, 0)).toLocaleString()}`,
      "Total Returns": `₹${rows.filter(r => r.amount > 0).reduce((sum, r) => sum + r.amount, 0).toLocaleString()}`,
      "Net Gain/Loss": `₹${rows.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}`
    },
    chartData: rows.map((row, index) => ({
      date: row.date.toLocaleDateString(),
      amount: row.amount,
      type: row.amount < 0 ? "Investment" : "Return"
    }))
  });

  const shareData = {
    title: "XIRR Calculator Results",
    description: `XIRR calculation shows ${rate.toFixed(2)}% annualized return for the given cash flows`,
    url: window.location.href,
    calculatorType: "XIRR",
    results: getExportData()
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">XIRR Calculator</h1>
        <ShareButton />
      </div>
      <FlowTable rows={rows} onChange={setRows} />
      <div ref={resultRef}>
        <ResultStat label="Annualized return (XIRR %)" value={rate} />
      </div>
      
      {/* Export and Share Buttons */}
      {rate !== 0 && (
        <div className="flex gap-2">
          <ExportButton
            data={getExportData()}
            title="XIRR Calculator Results"
            calculatorType="XIRR"
            elementRef={resultRef}
            className="flex-1"
          />
          <ShareButton />
        </div>
      )}
      
      <p className="text-xs text-zinc-500">
        Enter negative amounts for investments and positive for redemptions.
      </p>
    </div>
  );
}

function FlowTable({ rows, onChange }: { rows: CashFlow[]; onChange: (r: CashFlow[]) => void }) {
  function update(i: number, patch: Partial<CashFlow>) {
    const next = rows.slice();
    next[i] = { ...next[i], ...patch } as CashFlow;
    onChange(next);
  }
  return (
    <div className="overflow-auto rounded-md border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
          <tr>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-right">Amount</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-950 dark:even:bg-zinc-900"
            >
              <td className="p-2">
                <input
                  type="date"
                  value={toDateInput(r.date)}
                  onChange={(e) => update(i, { date: new Date(e.target.value) })}
                  className="rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
                />
              </td>
              <td className="p-2 text-right">
                <input
                  type="number"
                  value={r.amount}
                  onChange={(e) => update(i, { amount: Number(e.target.value) })}
                  className="w-36 rounded border border-zinc-300 bg-white px-2 py-1 text-right dark:border-zinc-700 dark:bg-zinc-900"
                />
              </td>
              <td className="p-2">
                <button
                  className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2 p-2">
        <button
          className="rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          onClick={() => onChange([...rows, { date: new Date(), amount: 0 }])}
        >
          Add flow
        </button>
        <div className="text-xs text-zinc-500">Example XIRR: {formatNumber(xirr(rows))}%</div>
      </div>
    </div>
  );
}

function toDateInput(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
