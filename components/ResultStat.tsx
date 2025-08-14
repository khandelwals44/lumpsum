import { formatINR, formatNumber } from "@/lib/format";

export function ResultStat({
  label,
  value,
  currency = false
}: {
  label: string;
  value: number;
  currency?: boolean;
}) {
  return (
    <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="text-sm text-zinc-600 dark:text-zinc-300">{label}</div>
      <div className="mt-1 text-lg font-medium">
        {currency ? formatINR(value) : formatNumber(value)}
      </div>
    </div>
  );
}
