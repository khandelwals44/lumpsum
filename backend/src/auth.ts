/**
 * Minimal JWT auth utilities (access + refresh) and role guard middleware.
 *
 * Exports helpers to sign access tokens, create/rotate refresh tokens backed by
 * the database, and an Express middleware to require authentication with
 * optional role-based access control.
 */
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { Env } from "./env.js";
import { prisma } from "./prisma.js";

/**
 * Shape of our JWT payload
 * - sub: user id
 * - role: user role string (e.g. ADMIN, SUBADMIN, USER)
 */
export type JwtPayload = { sub: string; role: string };

/**
 * Sign a short-lived access token for API requests.
 * @param payload user id and role
 * @returns JWT string
 */
export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, Env.JWT_SECRET, { expiresIn: "15m" });
}

/**
 * Create and persist a refresh token for a user.
 * @param userId database user id
 * @returns refresh token jwt
 */
export async function signRefreshToken(userId: string): Promise<string> {
  const token = jwt.sign({ sub: userId }, Env.JWT_SECRET, { expiresIn: "30d" });
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { userId, token, expiresAt } });
  return token;
}

/**
 * Revoke an existing refresh token and issue a new one.
 * @param oldToken refresh token to rotate
 */
export async function rotateRefreshToken(oldToken: string) {
  const record = await prisma.refreshToken.findUnique({ where: { token: oldToken } });
  if (!record || record.revokedAt || record.expiresAt < new Date()) {
    throw Object.assign(new Error("Invalid refresh token"), { statusCode: 401 });
  }
  await prisma.refreshToken.update({ where: { token: oldToken }, data: { revokedAt: new Date() } });
  return signRefreshToken(record.userId);
}

/**
 * Express middleware to require a valid Bearer token and optional role(s).
 * Attaches `{ sub, role }` as `req.user` on success.
 * @param roles list of allowed roles; omit to allow any authenticated user
 */
export function requireAuth(roles?: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : undefined;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, Env.JWT_SECRET) as JwtPayload;
      if (roles && !roles.includes(decoded.role))
        return res.status(403).json({ message: "Forbidden" });
      // @ts-ignore attach user
      req.user = decoded;
      return next();
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
}
