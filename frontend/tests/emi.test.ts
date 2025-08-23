import { describe, it, expect } from "vitest";
import { calculateEmi } from "@/lib/calc/emi";

describe("calculateEmi", () => {
  it("computes zero when inputs invalid", () => {
    expect(calculateEmi(0, 10, 12).emi).toBe(0);
    expect(calculateEmi(100000, 10, 0).emi).toBe(0);
  });

  it("matches known EMI approximately", () => {
    // 10 lakh, 9% p.a., 120 months -> EMI ≈ 12667-12668 depending on rounding
    const { emi, totalPayment } = calculateEmi(1000000, 9, 120);
    expect(Math.round(emi)).toBeGreaterThanOrEqual(12667);
    expect(Math.round(emi)).toBeLessThanOrEqual(12668);
    expect(totalPayment).toBeGreaterThan(1000000);
  });
});
