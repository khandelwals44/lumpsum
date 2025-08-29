/**
 * ChartContainer
 * - Lazy mounts recharts ResponsiveContainer to avoid SSR issues and keep bundle light
 * - Wrap heavy chart code inside this container
 * - Fixed Y-axis display issues with proper margins and responsive design
 */
"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false
});

export function ChartContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
      <div className="h-80 w-full p-4">
        <Suspense
          fallback={
            <div className="h-full w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <div className="text-zinc-500 dark:text-zinc-400">Loading chart...</div>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            {children as any}
          </ResponsiveContainer>
        </Suspense>
      </div>
    </div>
  );
}
