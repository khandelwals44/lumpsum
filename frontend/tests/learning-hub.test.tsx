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
    const mockBadges = [];

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockChapters
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProgress
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBadges
      });

    render(<LearningHubClient />);

    await waitFor(() => {
      expect(screen.getByText("Mutual Fund University")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Introduction to Mutual Funds")).toBeInTheDocument();
    });
  });

  it("shows progress section", async () => {
    const mockChapters = [
      {
        id: "1",
        title: "Test Chapter",
        slug: "test-chapter",
        description: "A test chapter",
        level: "BEGINNER",
        category: "BASICS",
        order: 1,
        estimatedTime: 15
      }
    ];
    const mockProgress = [];
    const mockBadges = [];

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockChapters
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProgress
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBadges
      });

    render(<LearningHubClient />);

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText("Mutual Fund University")).toBeInTheDocument();
    });

    // Check that progress section is rendered
    await waitFor(() => {
      expect(screen.getByText("Your Progress")).toBeInTheDocument();
      expect(screen.getByText("Completed")).toBeInTheDocument();
      expect(screen.getByText("Remaining")).toBeInTheDocument();
    });
  });

  it("handles loading state", async () => {
    // Mock fetch to never resolve
    (fetch as any).mockImplementation(() => new Promise(() => {}));

    render(<LearningHubClient />);

    // In loading state, we should see the skeleton elements
    await waitFor(() => {
      expect(screen.getByText("Mutual Fund University")).toBeInTheDocument();
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
