import { describe, it, expect } from "vitest";
import { calculateSip } from "@/lib/calc/sip";

describe("calculateSip", () => {
  it("zero for invalid", () => {
    expect(calculateSip(0, 12, 10).maturity).toBe(0);
    expect(calculateSip(1000, 12, 0).maturity).toBe(0);
  });

  it("grows over time", () => {
    const res = calculateSip(10000, 12, 2); // 24 months
    expect(res.maturity).toBeGreaterThan(res.totalInvested);
    expect(res.series.length).toBe(24);
  });
});
