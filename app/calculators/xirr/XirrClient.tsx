"use client";

import { useMemo, useState, useEffect } from "react";
import { xirr, CashFlow, parseParamCashflows } from "@/lib/calc/xirr";
import { ResultStat } from "@/components/ResultStat";
import { formatNumber } from "@/lib/format";
import { FadeIn } from "@/components/FadeIn";
import { useSearchParams } from "next/navigation";
import { saveLocal, loadLocal } from "@/lib/persist";
import { v4 as uuidv4 } from "uuid";

// Key for local storage
const LOCAL_KEY = "xirr_calculator_cashflows";

function XirrClient() {
  const sp = useSearchParams();

  const [cashflows, setCashflows] = useState<CashFlow[]>(() => {
    const paramCF = parseParamCashflows(sp, "cf");
    if (paramCF.length > 0) return paramCF;

    const saved = loadLocal<CashFlow[]>(LOCAL_KEY, []);
    return saved?.length ? saved : [{ date: new Date(), amount: -100000 }];
  });

  // Save to local storage whenever cashflows change
  useEffect(() => {
    saveLocal(LOCAL_KEY, cashflows);
  }, [cashflows]);

  const result = useMemo(() => xirr(cashflows), [cashflows]);

  return (
    <div className="space-y-4">
      <FadeIn delay={0.1}>
        <h1 className="text-xl font-semibold">XIRR Calculator</h1>
      </FadeIn>

      <FlowTable rows={cashflows} onChange={setCashflows} />

      <FadeIn delay={0.2}>
        <ResultStat label="Annualized return (XIRR %)" value={result} />
        <p className="text-xs text-zinc-500">
          Enter negative amounts for investments and positive for redemptions.
        </p>
      </FadeIn>

      {/* Educational content */}
      <article className="prose mt-4 dark:prose-invert">
        <FadeIn delay={0.3}>
          <details open>
            <summary>What is XIRR?</summary>
            <p>
              XIRR (Extended Internal Rate of Return) calculates the annualized return for
              investments with irregular cash flows (multiple investments/withdrawals at different
              times). It gives a single percentage rate equating present value of all cash inflows
              and outflows.
            </p>
          </details>
        </FadeIn>

        <FadeIn delay={0.4}>
          <details>
            <summary>How it works (formula)</summary>
            <p>
              XIRR finds the rate that makes the Net Present Value (NPV) of cash flows equal to
              zero. There is no simple formula; it is calculated numerically.
            </p>
          </details>
        </FadeIn>

        <FadeIn delay={0.5}>
          <details>
            <summary>How to use this calculator</summary>
            <ol>
              <li>Add each investment or withdrawal as a new row.</li>
              <li>Enter date and amount. Investments = negative, withdrawals = positive.</li>
              <li>Ensure at least one negative and one positive cash flow.</li>
              <li>XIRR will be displayed as annualized return.</li>
            </ol>
          </details>
        </FadeIn>

        <FadeIn delay={0.6}>
          <details>
            <summary>FAQs</summary>
            <ul>
              <li>
                <strong>When to use XIRR?</strong> Multiple investments like mutual funds, stocks,
                or real estate.
              </li>
              <li>
                <strong>Difference with CAGR?</strong> CAGR is for single growth. XIRR handles
                multiple, irregular cash flows.
              </li>
              <li>
                <strong>Why NaN?</strong> Not enough cash flows or all flows positive/negative.
              </li>
              <li>
                <strong>Accuracy?</strong> Standard numerical method; accurate for practical
                purposes.
              </li>
            </ul>
          </details>
        </FadeIn>
      </article>
    </div>
  );
}

// Helper to format Date for input[type=date]
function toDateInput(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// FlowTable Component
type FlowTableProps = {
  rows: CashFlow[];
  onChange: (rows: CashFlow[]) => void;
};

function FlowTable({ rows, onChange }: FlowTableProps) {
  const addRow = () => onChange([...rows, { date: new Date(), amount: 0 }]);
  const removeRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    onChange(newRows);
  };

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Date</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="border p-1">
                <input
                  type="date"
                  value={toDateInput(row.date)}
                  onChange={(e) => {
                    const newRows = [...rows];
                    newRows[i]!.date = new Date(e.target.value);
                    onChange(newRows);
                  }}
                  className="border p-1 w-full"
                />
              </td>
              <td className="border p-1">
                <input
                  type="number"
                  value={row.amount}
                  onChange={(e) => {
                    const newRows = [...rows];
                    newRows[i]!.amount = parseFloat(e.target.value);
                    onChange(newRows);
                  }}
                  className="border p-1 w-full"
                />
              </td>
              <td className="border p-1 text-center">
                <button onClick={() => removeRow(i)} className="text-red-500 hover:underline">
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addRow}
        className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Row
      </button>
    </div>
  );
}

export default XirrClient;
