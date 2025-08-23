import { describe, it, expect } from "vitest";
import { calculateGst } from "@/lib/calc/gst";

describe("GST", () => {
  it("exclusive computes tax and gross", () => {
    const r = calculateGst(1000, 18, "exclusive");
    expect(Math.round(r.tax)).toBe(180);
    expect(Math.round(r.gross)).toBe(1180);
  });
  it("inclusive extracts base and tax", () => {
    const r = calculateGst(1180, 18, "inclusive");
    expect(Math.round(r.base)).toBe(1000);
    expect(Math.round(r.tax)).toBe(180);
  });
});
