"use client";
/**
 * PresetChips – simple clickable preset values
 */
export function PresetChips({
  label,
  presets,
  onApply
}: {
  label?: string;
  presets: { label?: string; name?: string; value: number }[];
  onApply: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {label ? <span className="text-xs text-zinc-500 mr-1">{label}</span> : null}
      {presets.map((p, i) => {
        const text = p.label ?? p.name ?? `Preset ${i + 1}`;
        return (
          <button
            key={text}
            onClick={() => onApply(p.value)}
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}
