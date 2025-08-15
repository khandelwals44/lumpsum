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
import { prisma } from "./prisma";
import { signAccessToken, signRefreshToken, rotateRefreshToken, requireAuth } from "./auth";
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
