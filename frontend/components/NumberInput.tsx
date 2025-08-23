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
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm text-zinc-600 dark:text-zinc-300">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm leading-tight dark:border-zinc-700 dark:bg-zinc-900"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix ? <span className="text-sm text-zinc-500">{suffix}</span> : null}
      </div>
    </div>
  );
}
