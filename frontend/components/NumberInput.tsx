"use client";
import { useId } from "react";

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm leading-tight shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {suffix}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
