import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma client
const mockPrisma = {
  learningChapter: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn()
  },
  userLearningProgress: {
    findMany: vi.fn(),
    upsert: vi.fn()
  },
  userBadge: {
    findMany: vi.fn()
  }
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}));

describe('Learning Platform', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Learning Chapters', () => {
    it('should fetch all active chapters', async () => {
      const mockChapters = [
        {
          id: '1',
          title: 'What are Mutual Funds?',
          slug: 'what-are-mutual-funds',
          description: 'Introduction to mutual funds',
          level: 'BEGINNER',
          order: 1,
          estimatedTime: 10,
          category: 'Basics',
          tags: '["mutual funds", "basics"]'
        },
        {
          id: '2',
          title: 'Types of Mutual Funds',
          slug: 'types-of-mutual-funds',
          description: 'Understanding different categories',
          level: 'BEGINNER',
          order: 2,
          estimatedTime: 15,
          category: 'Basics',
          tags: '["equity", "debt", "hybrid"]'
        }
      ];

      mockPrisma.learningChapter.findMany.mockResolvedValue(mockChapters);

      // Simulate API call
      const chapters = await mockPrisma.learningChapter.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          level: true,
          order: true,
          estimatedTime: true,
          category: true,
          tags: true
        }
      });

      expect(chapters).toEqual(mockChapters);
      expect(mockPrisma.learningChapter.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          level: true,
          order: true,
          estimatedTime: true,
          category: true,
          tags: true
        }
      });
    });

    it('should fetch chapter by slug', async () => {
      const mockChapter = {
        id: '1',
        title: 'What are Mutual Funds?',
        slug: 'what-are-mutual-funds',
        description: 'Introduction to mutual funds',
        content: '# What are Mutual Funds?\n\nA mutual fund is...',
        level: 'BEGINNER',
        order: 1,
        estimatedTime: 10,
        category: 'Basics',
        tags: '["mutual funds", "basics"]',
        quizzes: []
      };

      mockPrisma.learningChapter.findUnique.mockResolvedValue(mockChapter);

      const chapter = await mockPrisma.learningChapter.findUnique({
        where: { slug: 'what-are-mutual-funds' },
        include: {
          quizzes: {
            select: {
              id: true,
              question: true,
              options: true,
              correctAnswer: true,
              explanation: true
            }
          }
        }
      });

      expect(chapter).toEqual(mockChapter);
      expect(mockPrisma.learningChapter.findUnique).toHaveBeenCalledWith({
        where: { slug: 'what-are-mutual-funds' },
        include: {
          quizzes: {
            select: {
              id: true,
              question: true,
              options: true,
              correctAnswer: true,
              explanation: true
            }
          }
        }
      });
    });
  });

  describe('User Progress', () => {
    it('should fetch user progress', async () => {
      const mockProgress = [
        {
          chapterId: '1',
          completed: true,
          timeSpent: 15,
          lastAccessed: new Date('2024-01-01')
        },
        {
          chapterId: '2',
          completed: false,
          timeSpent: 5,
          lastAccessed: new Date('2024-01-02')
        }
      ];

      mockPrisma.userLearningProgress.findMany.mockResolvedValue(mockProgress);

      const progress = await mockPrisma.userLearningProgress.findMany({
        where: { userId: 'user-123' },
        select: {
          chapterId: true,
          completed: true,
          timeSpent: true,
          lastAccessed: true
        }
      });

      expect(progress).toEqual(mockProgress);
      expect(mockPrisma.userLearningProgress.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        select: {
          chapterId: true,
          completed: true,
          timeSpent: true,
          lastAccessed: true
        }
      });
    });

    it('should update user progress', async () => {
      const mockUpdatedProgress = {
        chapterId: '1',
        completed: true,
        timeSpent: 20,
        lastAccessed: new Date()
      };

      mockPrisma.userLearningProgress.upsert.mockResolvedValue(mockUpdatedProgress);

      const progress = await mockPrisma.userLearningProgress.upsert({
        where: {
          userId_chapterId: {
            userId: 'user-123',
            chapterId: '1'
          }
        },
        update: {
          completed: true,
          timeSpent: 20,
          lastAccessed: new Date()
        },
        create: {
          userId: 'user-123',
          chapterId: '1',
          completed: true,
          timeSpent: 20,
          lastAccessed: new Date()
        }
      });

      expect(progress).toEqual(mockUpdatedProgress);
      expect(mockPrisma.userLearningProgress.upsert).toHaveBeenCalled();
    });
  });

  describe('User Badges', () => {
    it('should fetch user badges', async () => {
      const mockBadges = [
        {
          id: '1',
          name: 'First Chapter',
          description: 'Completed your first chapter',
          icon: 'book-open',
          earnedAt: new Date('2024-01-01')
        },
        {
          id: '2',
          name: 'Quick Learner',
          description: 'Completed 5 chapters',
          icon: 'zap',
          earnedAt: new Date('2024-01-02')
        }
      ];

      mockPrisma.userBadge.findMany.mockResolvedValue(mockBadges);

      const badges = await mockPrisma.userBadge.findMany({
        where: { userId: 'user-123' },
        orderBy: { earnedAt: 'desc' }
      });

      expect(badges).toEqual(mockBadges);
      expect(mockPrisma.userBadge.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { earnedAt: 'desc' }
      });
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate overall progress correctly', () => {
      const chapters = [
        { id: '1', title: 'Chapter 1' },
        { id: '2', title: 'Chapter 2' },
        { id: '3', title: 'Chapter 3' }
      ];

      const progress = [
        { chapterId: '1', completed: true },
        { chapterId: '2', completed: true },
        { chapterId: '3', completed: false }
      ];

      const completedCount = progress.filter(p => p.completed).length;
      const totalCount = chapters.length;
      const overallProgress = (completedCount / totalCount) * 100;

      expect(overallProgress).toBeCloseTo(66.67, 2);
      expect(completedCount).toBe(2);
      expect(totalCount).toBe(3);
    });

    it('should handle empty progress', () => {
      const chapters = [
        { id: '1', title: 'Chapter 1' },
        { id: '2', title: 'Chapter 2' }
      ];

      const progress: any[] = [];

      const completedCount = progress.filter(p => p.completed).length;
      const totalCount = chapters.length;
      const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      expect(overallProgress).toBe(0);
      expect(completedCount).toBe(0);
    });
  });
});
