/**
 * URL state helpers
 * - useUrlState: reflect local UI state in the URL query to create shareable links
 * - parseParamNumber: safe parse helper with fallback
 */
"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function useUrlState<T extends Record<string, string | number | undefined>>(state: T) {
  const sp = useSearchParams();
  const router = useRouter();
  const path = usePathname();

  const current = useMemo(() => {
    if (!sp) return {} as Record<string, string>;
    return Object.fromEntries(sp.entries());
  }, [sp]);

  useEffect(() => {
    const next = new URLSearchParams(current);
    Object.entries(state).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") next.delete(k);
      else next.set(k, String(v));
    });
    const nextStr = next.toString();
    const curStr = sp ? sp.toString() : "";
    if (nextStr !== curStr) {
      router.replace(`${path}?${nextStr}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(state), path]);
}

export function parseParamNumber(
  sp: URLSearchParams | { get: (key: string) => string | null } | null,
  key: string,
  fallback: number
) {
  if (!sp) return fallback;
  const raw = sp.get(key);
  if (raw == null) return fallback;
  const n = Number(raw);
  return isFinite(n) ? n : fallback;
}
