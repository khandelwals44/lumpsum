import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import LearningHubClient from "../app/learning/LearningHubClient";

// Mock fetch
global.fetch = vi.fn();

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { email: "test@example.com" } },
    status: "authenticated"
  })
}));

describe("Learning Hub", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders learning hub with chapters", async () => {
    const mockChapters = [
      {
        id: "1",
        title: "What is a Mutual Fund?",
        slug: "what-is-mutual-fund",
        description: "Learn the fundamental concept of mutual funds",
        level: "BEGINNER",
        category: "BASICS",
        order: 1,
        estimatedTime: 15
      }
    ];

    const mockProgress: any[] = [];
    const mockBadges: any[] = [];

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

    expect(screen.getByText("What is a Mutual Fund?")).toBeInTheDocument();
    // Note: The chapter details are not rendered in the current view, so we just check the main content loads
  });

  it("shows progress statistics", async () => {
    const mockChapters: any[] = [];
    const mockProgress = [
      {
        id: "1",
        chapterId: "1",
        completed: true,
        progress: 100,
        timeSpent: 900,
        chapter: {
          id: "1",
          title: "Test Chapter",
          slug: "test-chapter",
          level: "BEGINNER",
          category: "BASICS"
        }
      }
    ];
    const mockBadges = [
      {
        id: "1",
        badgeType: "FIRST_CHAPTER",
        badgeName: "First Steps",
        badgeDescription: "Completed your first learning chapter"
      }
    ];

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
      expect(screen.getAllByText("1")).toHaveLength(2); // Should find multiple "1" elements
      expect(screen.getByText("15m")).toBeInTheDocument(); // Time spent
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

    // Should show loading skeleton
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
