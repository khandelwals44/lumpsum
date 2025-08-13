"use client";
import { Share2 } from "lucide-react";

export function ShareButton() {
  return (
    <button
      type="button"
      onClick={() => {
        try {
          navigator.clipboard.writeText(window.location.href);
        } catch {}
      }}
      className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
      aria-label="Copy shareable link"
    >
      <Share2 className="h-4 w-4" /> Share
    </button>
  );
}
