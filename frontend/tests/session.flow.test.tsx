import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthButtons } from "@/components/AuthButtons";

// Mock next-auth/react for session transitions
vi.mock("next-auth/react", () => {
  let status = "unauthenticated" as "authenticated" | "unauthenticated" | "loading";
  return {
    // Allow tests to mutate status between steps
    __setStatus: (next: typeof status) => (status = next),
    useSession: () => ({ status }),
    signIn: vi.fn(),
    signOut: vi.fn()
  };
});

// Bring helpers into scope
import * as nextAuth from "next-auth/react";

/**
 * This test simulates a small functional flow:
 * 1. User is logged out → sees Login
 * 2. After "login" (simulated), user is logged in → sees Dashboard + Logout
 * 3. Clicking Logout returns to Login state
 */
describe("Session UI flow with AuthButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to unauthenticated before each test
    (nextAuth as any).__setStatus("unauthenticated");
  });

  it("transitions from Login to Dashboard+Logout and back to Login", async () => {
    const { rerender } = render(<AuthButtons />);

    // Login is a link now
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();

    (nextAuth as any).__setStatus("authenticated");
    rerender(<AuthButtons />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();

    (nextAuth as any).__setStatus("unauthenticated");
    rerender(<AuthButtons />);

    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });
});
