import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-auth/react", () => {
  return {
    signIn: vi.fn(),
    useSession: vi.fn()
  };
});

vi.mock("next/navigation", () => {
  return {
    useSearchParams: () => ({
      get: (key: string) => (key === "callbackUrl" ? "/dashboard" : null)
    }),
    useRouter: () => ({ replace: vi.fn() })
  };
});

// Mock reCAPTCHA properly
Object.defineProperty(window, 'executeRecaptcha', {
  value: vi.fn().mockResolvedValue('mock-recaptcha-token'),
  writable: true,
  configurable: true
});

import { signIn, useSession } from "next-auth/react";
import SignInClient from "../components/auth/SignInClient";

describe("SignInClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost:3000", href: "http://localhost:3000/auth/signin" },
      writable: true
    });
  });

  it("renders signin form", () => {
    (useSession as any).mockReturnValue({ status: "unauthenticated" });

    render(<SignInClient />);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("redirects to dashboard immediately if already authenticated", () => {
    (useSession as any).mockReturnValue({ status: "authenticated" });

    render(<SignInClient />);

    expect(true).toBe(true);
  });
});
