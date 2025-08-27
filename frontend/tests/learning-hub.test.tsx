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

  it("shows progress statistics", async () => {
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
    const mockProgress = [
      {
        chapterId: "1",
        completed: true,
        timeSpent: 900,
        lastAccessed: "2024-01-01T00:00:00Z"
      }
    ];
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

    // Wait for both fetches to complete and component to update
    await waitFor(() => {
      expect(screen.getByText("Test Chapter")).toBeInTheDocument();
    });

    // Now check for the progress
    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument(); // Completed count
    }, { timeout: 10000 });
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
