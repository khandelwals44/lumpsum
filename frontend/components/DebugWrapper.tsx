"use client";

import { ClickBlockersDebug } from "@/lib/debug/clickBlockers";

export function DebugWrapper() {
  // eslint-disable-next-line no-restricted-globals, no-restricted-syntax
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <ClickBlockersDebug />;
}
