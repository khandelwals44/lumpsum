import { formatINR, formatNumber } from "@/lib/format";

export function ResultStat({
  label,
  value,
  currency = false,
  suffix
}: {
  label: string;
  value: number;
  currency?: boolean;
  suffix?: string;
}) {
  const displayValue = currency ? formatINR(value) : suffix ? `${formatNumber(value)}${suffix}` : formatNumber(value);
  
  return (
    <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
        {label}
      </div>
      <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
        {displayValue}
      </div>
    </div>
  );
}
