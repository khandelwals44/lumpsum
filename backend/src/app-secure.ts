/**
 * Secure Express application factory with enhanced security features.
 *
 * Includes:
 * - Secure Swagger UI access
 * - Enhanced CORS configuration
 * - Advanced rate limiting
 * - Security headers
 * - Input validation and sanitization
 * - Request logging and monitoring
 * - API key validation
 */
import express from "express";
import { createRequire } from "module";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - no types
import swaggerUi from "swagger-ui-express";

import { prisma } from "./prisma.js";
import { signAccessToken, signRefreshToken, rotateRefreshToken, requireAuth } from "./auth.js";
import { secureSwaggerAccess } from "./middleware/swaggerAuth.js";
import {
  configureCORS,
  configureRateLimiting,
  configureSecurityHeaders,
  requestLogger,
  securityMonitor,
  validateApiKey,
  sanitizeInput,
  errorHandler,
  healthCheck
} from "./middleware/security.js";
import bcrypt from "bcryptjs";

/**
 * Creates and returns a secure Express application instance.
 */
export function createSecureApp(): express.Express {
  const app = express();

  // Enhanced security middleware
  app.use(configureSecurityHeaders());
  app.use(configureCORS());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging and monitoring
  app.use(requestLogger);
  app.use(securityMonitor);

  // Input sanitization
  app.use(sanitizeInput);

  // API key validation (optional)
  if (process.env.REQUIRE_API_KEY === 'true') {
    app.use(validateApiKey);
  }

  // Rate limiting configuration
  const { authLimiter, apiLimiter, strictLimiter, publicLimiter } = configureRateLimiting();

  // Health check (public)
  app.get("/health", healthCheck);

  // Authentication endpoints with strict rate limiting
  app.post("/auth/login", authLimiter, async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Missing credentials',
          message: 'Email and password are required'
        });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) {
        return res.status(401).json({ 
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return res.status(401).json({ 
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      const access = signAccessToken(user.id, user.role);
      const refresh = await signRefreshToken(user.id);
      
      res.json({ 
        access, 
        refresh, 
        role: user.role,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/auth/refresh", authLimiter, async (req, res, next) => {
    try {
      const { refresh } = req.body || {};
      if (!refresh) {
        return res.status(400).json({ 
          error: 'Missing refresh token',
          message: 'Refresh token is required'
        });
      }

      const newRefresh = await rotateRefreshToken(refresh);
      const payload: any = (await import("jsonwebtoken")).default.decode(newRefresh);
      const userId = payload?.sub as string;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const access = signAccessToken(userId, user?.role || "USER");
      
      res.json({ 
        access, 
        refresh: newRefresh, 
        role: user?.role || "USER" 
      });
    } catch (err) {
      next(err);
    }
  });

  // Protected user endpoint
  app.get("/me", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user?.sub as string;
      const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  });

  // API routes with rate limiting
  app.use('/api/', apiLimiter);

  // Calculation history endpoints with strict rate limiting
  app.get("/calc-history", strictLimiter, requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user?.sub as string;
      const items = await prisma.calculationHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50 // Limit results
      });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch calculation history' });
    }
  });

  app.post("/calc-history", strictLimiter, requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user?.sub as string;
      const { calcType, inputJson, outputJson } = req.body || {};
      
      if (!calcType || !inputJson || !outputJson) {
        return res.status(400).json({ 
          error: 'Missing fields',
          message: 'calcType, inputJson, and outputJson are required'
        });
      }

      const created = await prisma.calculationHistory.create({
        data: { userId, calcType, inputJson, outputJson }
      });
      res.json(created);
    } catch (err) {
      res.status(500).json({ error: 'Failed to save calculation' });
    }
  });

  // Learning Hub endpoints (public with rate limiting)
  app.get("/learning/chapters", publicLimiter, async (req, res) => {
    try {
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
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch learning chapters' });
    }
  });

  app.get("/learning/chapters/:id", publicLimiter, async (req, res) => {
    try {
      const { id } = req.params;
      const chapter = await prisma.learningChapter.findUnique({
        where: { id, isActive: true }
      });
      
      if (!chapter) {
        return res.status(404).json({ error: 'Chapter not found' });
      }
      
      res.json(chapter);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch chapter' });
    }
  });

  // Protected learning endpoints
  app.post("/learning/progress", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user?.sub as string;
      const { chapterId, progress, completed } = req.body || {};

      if (!chapterId) {
        return res.status(400).json({ error: 'Chapter ID is required' });
      }

      const userProgress = await prisma.userLearningProgress.upsert({
        where: { userId_chapterId: { userId, chapterId } },
        update: { progress, completed, updatedAt: new Date() },
        create: { userId, chapterId, progress, completed }
      });
      res.json(userProgress);
    } catch (err) {
      res.status(500).json({ error: 'Failed to save progress' });
    }
  });

  app.get("/learning/bookmarks", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user?.sub as string;
      const bookmarks = await prisma.userBookmark.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          chapter: {
            select: { title: true, slug: true }
          }
        }
      });
      res.json(bookmarks);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
  });

  app.post("/learning/bookmarks", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user?.sub as string;
      const { chapterId, sectionId, note } = req.body || {};

      if (!chapterId) {
        return res.status(400).json({ error: 'Chapter ID is required' });
      }

      const bookmark = await prisma.userBookmark.create({
        data: { userId, chapterId, sectionId, note }
      });
      res.json(bookmark);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create bookmark' });
    }
  });

  app.delete("/learning/bookmarks/:id", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user?.sub as string;
      const { id } = req.params;

      await prisma.userBookmark.deleteMany({
        where: { id, userId }
      });
      res.json({ message: "Bookmark deleted" });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete bookmark' });
    }
  });

  app.post("/learning/quiz/:quizId/answer", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user?.sub as string;
      const { quizId } = req.params;
      const { answer } = req.body || {};

      if (!answer) {
        return res.status(400).json({ error: 'Answer is required' });
      }

      const quiz = await prisma.chapterQuiz.findUnique({ where: { id: quizId } });
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

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
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit answer' });
    }
  });

  app.get("/learning/badges", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user?.sub as string;
      const badges = await prisma.userBadge.findMany({
        where: { userId },
        orderBy: { earnedAt: "desc" }
      });
      res.json(badges);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch badges' });
    }
  });

  // Investor guides endpoints
  app.post("/investor/guide", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user?.sub as string;
      const { title, content, goals, riskProfile, timeHorizon } = req.body || {};

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const guide = await prisma.investorGuide.create({
        data: { userId, title, content, goals, riskProfile, timeHorizon }
      });
      res.json(guide);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create guide' });
    }
  });

  app.get("/investor/guides", requireAuth(["ADMIN", "SUBADMIN", "USER"]), async (req, res) => {
    try {
      // @ts-ignore
      const userId = req.user?.sub as string;
      const guides = await prisma.investorGuide.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" }
      });
      res.json(guides);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch guides' });
    }
  });

  // Secure Swagger UI
  try {
    const require = createRequire(import.meta.url);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const swagger = require("../../docs/swagger.json");
    
    app.use("/docs", 
      secureSwaggerAccess,
      swaggerUi.serve, 
      swaggerUi.setup(swagger, {
        swaggerOptions: {
          persistAuthorization: true,
          docExpansion: 'none',
          filter: true,
          showRequestHeaders: true
        },
        customCss: `
          .swagger-ui .topbar { display: none }
          .swagger-ui .info .title { color: #2563eb }
        `,
        customSiteTitle: "lumpsum.in API Documentation",
        customfavIcon: "/favicon.ico"
      })
    );
  } catch (error) {
    console.warn('Swagger documentation not available:', error);
  }

  // Centralized error handler (must be last)
  app.use(errorHandler);

  return app;
}