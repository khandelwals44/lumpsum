/**
 * Express application factory for the backend service.
 *
 * Creates and configures an Express app with security headers, CORS,
 * JSON parsing, basic rate limiting, health check, and Swagger UI.
 * Exported as a factory to enable easy testing with Supertest.
 */
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - no types
import swaggerUi from "swagger-ui-express";
import { createRequire } from "module";
import { prisma } from "./prisma.js";
import { signAccessToken, signRefreshToken, rotateRefreshToken, requireAuth } from "./auth.js";
import bcrypt from "bcryptjs";

/**
 * Creates and returns a configured Express application instance.
 */
export function createApp(): express.Express {
  const app = express();

  // Core middleware
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

  // Health
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  // Auth endpoints (basic Email/Password for backend usage)
  app.post("/auth/login", async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ message: "Missing credentials" });
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) return res.status(401).json({ message: "Invalid credentials" });
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });
      const access = signAccessToken({ sub: user.id, role: user.role });
      const refresh = await signRefreshToken(user.id);
      res.json({ access, refresh, role: user.role });
    } catch (err) {
      next(err);
    }
  });

  app.post("/auth/refresh", async (req, res, next) => {
    try {
      const { refresh } = req.body || {};
      if (!refresh) return res.status(400).json({ message: "Missing refresh token" });
      const newRefresh = await rotateRefreshToken(refresh);
      // Determine user again for role
      const payload: any = (await import("jsonwebtoken")).default.decode(newRefresh);
      const userId = payload?.sub as string;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const access = signAccessToken({ sub: userId, role: user?.role || "USER" });
      res.json({ access, refresh: newRefresh, role: user?.role || "USER" });
    } catch (err) {
      next(err);
    }
  });

  // Example protected route
  app.get("/me", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    // @ts-ignore
    const userId = req.user?.sub as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    res.json({ id: user?.id, email: user?.email, role: user?.role });
  });

  // Calculation history endpoints
  app.get("/calc-history", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    // @ts-ignore
    const userId = req.user?.sub as string;
    const items = await prisma.calculationHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    res.json(items);
  });

  app.post("/calc-history", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    // @ts-ignore
    const userId = req.user?.sub as string;
    const { calcType, inputJson, outputJson } = req.body || {};
    if (!calcType || !inputJson || !outputJson)
      return res.status(400).json({ message: "Missing fields" });
    const created = await prisma.calculationHistory.create({
      data: { userId, calcType, inputJson, outputJson }
    });
    res.json(created);
  });

  // Learning Hub endpoints
  app.get("/learning/chapters", async (req, res) => {
    const { level, category } = req.query;
    const where: any = { isActive: true };
    if (level) where.level = level;
    if (category) where.category = category;

    const chapters = await prisma.learningChapter.findMany({
      where,
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        level: true,
        category: true,
        order: true,
        estimatedTime: true
      }
    });
    res.json(chapters);
  });

  app.get("/learning/content/:chapterId", async (req, res) => {
    const { chapterId } = req.params;
    const chapter = await prisma.learningChapter.findUnique({
      where: { id: chapterId },
      include: {
        quizzes: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            question: true,
            options: true,
            order: true
          }
        }
      }
    });
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });
    res.json(chapter);
  });

  app.get("/learning/progress", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    // @ts-ignore
    const userId = req.user?.sub as string;
    const progress = await prisma.userLearningProgress.findMany({
      where: { userId },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            slug: true,
            level: true,
            category: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });
    res.json(progress);
  });

  app.post(
    "/learning/progress/save",
    requireAuth(["ADMIN", "SUBADMIN", "USER"]),
    async (req, res) => {
      // @ts-ignore
      const userId = req.user?.sub as string;
      const { chapterId, progress, completed, timeSpent } = req.body || {};
      if (!chapterId) return res.status(400).json({ message: "Missing chapterId" });

      const updated = await prisma.userLearningProgress.upsert({
        where: { userId_chapterId: { userId, chapterId } },
        update: { progress, completed, timeSpent, lastAccessed: new Date() },
        create: { userId, chapterId, progress, completed, timeSpent }
      });
      res.json(updated);
    }
  );

  app.get("/learning/bookmarks", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    // @ts-ignore
    const userId = req.user?.sub as string;
    const bookmarks = await prisma.userBookmark.findMany({
      where: { userId },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(bookmarks);
  });

  app.post("/learning/bookmarks", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    // @ts-ignore
    const userId = req.user?.sub as string;
    const { chapterId, sectionId, note } = req.body || {};
    if (!chapterId) return res.status(400).json({ message: "Missing chapterId" });

    const bookmark = await prisma.userBookmark.create({
      data: { userId, chapterId, sectionId, note }
    });
    res.json(bookmark);
  });

  app.delete(
    "/learning/bookmarks/:id",
    requireAuth(["ADMIN", "SUBADMIN", "USER"]),
    async (req, res) => {
      // @ts-ignore
      const userId = req.user?.sub as string;
      const { id } = req.params;

      await prisma.userBookmark.deleteMany({
        where: { id, userId }
      });
      res.json({ message: "Bookmark deleted" });
    }
  );

  app.post(
    "/learning/quiz/:quizId/answer",
    requireAuth(["ADMIN", "SUBADMIN", "USER"]),
    async (req, res) => {
      // @ts-ignore
      const userId = req.user?.sub as string;
      const { quizId } = req.params;
      const { answer } = req.body || {};

      const quiz = await prisma.chapterQuiz.findUnique({ where: { id: quizId } });
      if (!quiz) return res.status(404).json({ message: "Quiz not found" });

      const isCorrect = answer === quiz.correctAnswer;
      const userAnswer = await prisma.userQuizAnswer.upsert({
        where: { userId_quizId: { userId, quizId } },
        update: { answer, isCorrect },
        create: { userId, quizId, answer, isCorrect }
      });

      res.json({
        isCorrect,
        explanation: quiz.explanation,
        correctAnswer: quiz.correctAnswer
      });
    }
  );

  app.get("/learning/badges", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    // @ts-ignore
    const userId = req.user?.sub as string;
    const badges = await prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" }
    });
    res.json(badges);
  });

  app.post("/investor/guide", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    // @ts-ignore
    const userId = req.user?.sub as string;
    const { title, content, goals, riskProfile, timeHorizon } = req.body || {};

    const guide = await prisma.investorGuide.create({
      data: { userId, title, content, goals, riskProfile, timeHorizon }
    });
    res.json(guide);
  });

  app.get("/investor/guides", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    // @ts-ignore
    const userId = req.user?.sub as string;
    const guides = await prisma.investorGuide.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" }
    });
    res.json(guides);
  });

  // Swagger UI
  try {
    const require = createRequire(import.meta.url);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const swagger = require("../../docs/swagger.json");
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swagger as any));
  } catch {
    // noop in test environments where docs may be unavailable
  }

  // Centralized error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const statusCode = err?.statusCode ?? 500;
    const message = err?.message ?? "Internal Server Error";
    res.status(statusCode).json({ message });
  });

  return app;
}
