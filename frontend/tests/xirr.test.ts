import { describe, it, expect } from "vitest";
import { xirr } from "@/lib/calc/xirr";

describe("xirr", () => {
  it("handles simple investment and redemption", () => {
    const start = new Date(2023, 0, 1);
    const end = new Date(2024, 0, 1);
    const rate = xirr([
      { date: start, amount: -100000 },
      { date: end, amount: 112000 }
    ]);
    // Around ~12% p.a.
    expect(rate).toBeGreaterThan(10);
    expect(rate).toBeLessThan(14);
  });
});
