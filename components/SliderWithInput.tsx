"use client";
import { NumberInput } from "./NumberInput";

export function SliderWithInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
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
  return (
    <div className="space-y-2">
      <NumberInput label={label} value={value} onChange={onChange} suffix={suffix} />
      <input
        aria-label={`${label} slider`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-600"
      />
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
