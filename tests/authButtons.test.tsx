import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Import the component under test
import { AuthButtons } from "@/components/AuthButtons";

// Mock next-auth/react to control session state and capture signIn/signOut calls
vi.mock("next-auth/react", () => {
  return {
    // useSession hook will be mocked per test to return desired status
    useSession: vi.fn(),
    // signIn/signOut are mocked functions to assert user interactions
    signIn: vi.fn(),
    signOut: vi.fn()
  };
});

// Bring mocked functions into scope with proper typing
import { useSession, signOut } from "next-auth/react";

describe("AuthButtons", () => {
  beforeEach(() => {
    // Reset all mocks before each test to avoid cross-test pollution
    vi.clearAllMocks();
  });

  it("renders Login link when unauthenticated and points to /auth/signin", () => {
    // Arrange: mock useSession to simulate an unauthenticated user
    (useSession as unknown as vi.Mock).mockReturnValue({ status: "unauthenticated" });

    // Act: render the component
    render(<AuthButtons />);

    // Assert: Login button is visible
    const loginLink = screen.getByRole("link", { name: /login/i });
    expect(loginLink).toHaveAttribute("href", "/auth/signin");
  });

  it("renders Dashboard link and Logout button when authenticated; Logout triggers signOut", () => {
    // Arrange: mock useSession to simulate an authenticated user
    (useSession as unknown as vi.Mock).mockReturnValue({
      status: "authenticated",
      data: { user: { role: "USER" } }
    });

    // Act: render the component
    render(<AuthButtons />);

    // Assert: Dashboard link is visible
    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");

    // Assert: Logout button visible and wired to signOut
    const logoutBtn = screen.getByRole("button", { name: /logout/i });
    logoutBtn.click();
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
