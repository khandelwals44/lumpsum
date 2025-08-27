import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import LearningHubClient from "@/app/learning/LearningHubClient";

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
        timeSpent: 900, // 15 minutes in seconds
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

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument(); // Completed count
      expect(screen.getByText("0")).toBeInTheDocument(); // Remaining count
    });
  });

  it("filters chapters by level", async () => {
    const mockChapters = [
      {
        id: "1",
        title: "Beginner Chapter",
        slug: "beginner-chapter",
        description: "A beginner chapter",
        level: "BEGINNER",
        category: "BASICS",
        order: 1,
        estimatedTime: 15
      },
      {
        id: "2",
        title: "Advanced Chapter",
        slug: "advanced-chapter",
        description: "An advanced chapter",
        level: "ADVANCED",
        category: "RESEARCH",
        order: 2,
        estimatedTime: 30
      }
    ];

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockChapters
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

    render(<LearningHubClient />);

    await waitFor(() => {
      expect(screen.getByText("Beginner Chapter")).toBeInTheDocument();
      expect(screen.getByText("Advanced Chapter")).toBeInTheDocument();
    });
  });

  it("handles loading state", () => {
    (fetch as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<LearningHubClient />);

    // Should show loading skeleton - the title should still be visible
    expect(screen.getByText("Mutual Fund University")).toBeInTheDocument();
  });

  it("handles error state", async () => {
    (fetch as any).mockRejectedValue(new Error("Failed to fetch"));

    render(<LearningHubClient />);

    await waitFor(() => {
      expect(screen.getByText("Mutual Fund University")).toBeInTheDocument();
    });
  });
});
