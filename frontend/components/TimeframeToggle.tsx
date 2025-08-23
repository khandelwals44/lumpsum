"use client";
import { cn } from "@/lib/utils";

export type Timeframe = "monthly" | "yearly";

export function TimeframeToggle({
  value,
  onChange
}: {
  value: Timeframe;
  onChange: (v: Timeframe) => void;
}) {
  return (
    <div
      className="inline-flex overflow-hidden rounded-md border border-zinc-300 text-sm dark:border-zinc-700"
      role="tablist"
      aria-label="Timeframe"
    >
      {(["monthly", "yearly"] as const).map((tf) => (
        <button
          key={tf}
          role="tab"
          type="button"
          onClick={() => onChange(tf)}
          className={cn(
            "px-3 py-1.5",
            value === tf
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-transparent"
          )}
          aria-selected={value === tf}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
