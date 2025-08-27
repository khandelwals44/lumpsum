import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SipPage from "@/app/calculators/sip/page";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/calculators/sip"
}));

describe("SIP page", () => {
  it("renders heading and controls", () => {
    render(<SipPage />);
    expect(screen.getByText(/SIP Calculator/i)).toBeInTheDocument();
    // Pick numeric input via role instead of label text that matches two inputs
    const amountInput = screen.getAllByRole("spinbutton")[0];
    expect(amountInput).toBeInTheDocument();
  });
});
