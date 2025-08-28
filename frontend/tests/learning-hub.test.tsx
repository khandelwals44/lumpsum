import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import LearningHubClient from "../app/learning/LearningHubClient";

// Mock fetch globally
global.fetch = vi.fn();

describe("Learning Hub", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders learning hub with chapters", async () => {
    const mockChapters = [
      {
        id: "1",
        title: "Introduction to Mutual Funds",
        slug: "intro-mutual-funds",
        description: "Learn the basics of mutual fund investing",
        level: "BEGINNER",
        category: "BASICS",
        order: 1,
        estimatedTime: 15
      }
    ];
    const mockProgress = [];

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockChapters
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProgress
      });

    render(<LearningHubClient />);

    await waitFor(() => {
      expect(screen.getByText("Mutual Fund University")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Introduction to Mutual Funds")).toBeInTheDocument();
    });
  });

  it("shows fallback UI when no chapters are available", async () => {
    const mockChapters = [];
    const mockProgress = [];

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockChapters
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProgress
      });

    render(<LearningHubClient />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText("Mutual Fund University")).toBeInTheDocument();
    });

    // Check that fallback UI is shown when no chapters are available
    await waitFor(() => {
      expect(screen.getByText("Learning content is being prepared")).toBeInTheDocument();
      expect(screen.getByText("Our comprehensive learning modules are being set up. Please check back soon!")).toBeInTheDocument();
      expect(screen.getByText("Refresh Page")).toBeInTheDocument();
    });
  });

  it("handles loading state", async () => {
    // Mock fetch to never resolve
    (fetch as any).mockImplementation(() => new Promise(() => {}));

    render(<LearningHubClient />);

    // In loading state, we should see the skeleton elements
    await waitFor(() => {
      // Check for skeleton loading elements by looking for the animate-pulse class
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  it("handles error state", async () => {
    (fetch as any).mockRejectedValue(new Error("Failed to fetch"));

    render(<LearningHubClient />);

    // Even with errors, the title should still be visible
    await waitFor(() => {
      expect(screen.getByText("Mutual Fund University")).toBeInTheDocument();
    });
  });
});
