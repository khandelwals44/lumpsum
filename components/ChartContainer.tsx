/**
 * ChartContainer
 * - Lazy mounts recharts ResponsiveContainer to avoid SSR issues and keep bundle light
 * - Wrap heavy chart code inside this container
 */
"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false
});

export function ChartContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-80 w-full">
      <Suspense
        fallback={
          <div className="h-full w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </Suspense>
    </div>
  );
}
