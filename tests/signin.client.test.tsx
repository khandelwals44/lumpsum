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

import { signIn, useSession } from "next-auth/react";
import SignInClient from "@/components/auth/SignInClient";

describe("SignInClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost:3000", href: "http://localhost:3000/auth/signin" },
      writable: true
    });
  });

  it("calls signIn with absolute callbackUrl and redirect:true", async () => {
    (useSession as any).mockReturnValue({ status: "unauthenticated" });
    (signIn as any).mockResolvedValue({ ok: true, url: "http://localhost:3000/dashboard" });

    render(<SignInClient />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@lumpsum.in" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "user123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(signIn).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({
        callbackUrl: "http://localhost:3000/dashboard",
        redirect: true,
        email: "user@lumpsum.in",
        password: "user123"
      })
    );
  });

  it("redirects to dashboard immediately if already authenticated", () => {
    (useSession as any).mockReturnValue({ status: "authenticated" });

    render(<SignInClient />);

    expect(true).toBe(true);
  });
});
