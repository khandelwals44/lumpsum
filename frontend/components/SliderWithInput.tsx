/**
 * SliderWithInput
 * - Renders a numeric input and a synchronized range slider
 * - Keeps validation minimal; clamping/guards should happen in calc layer where needed
 * - Modern styling with better visual feedback
 */
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
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="space-y-4">
      <NumberInput label={label} value={value} onChange={onChange} suffix={suffix} />
      
      <div className="space-y-2">
        <div className="relative">
          <input
            aria-label={`${label} slider`}
            type="range"
            min={min}
            max={max}
            step={step}
            value={Number.isFinite(value) ? value : 0}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer slider-thumb dark:bg-zinc-700"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
            }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          <span>{min}{suffix}</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">
            {value}{suffix}
          </span>
          <span>{max}{suffix}</span>
        </div>
      </div>
      
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        
        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}
