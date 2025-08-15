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
