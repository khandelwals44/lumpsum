/**
 * Minimal JWT auth utilities (access + refresh) and role guard middleware.
 */
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { Env } from "./env";
import { prisma } from "./prisma";

export type JwtPayload = { sub: string; role: string };

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, Env.JWT_SECRET, { expiresIn: "15m" });
}

export async function signRefreshToken(userId: string): Promise<string> {
  const token = jwt.sign({ sub: userId }, Env.JWT_SECRET, { expiresIn: "30d" });
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { userId, token, expiresAt } });
  return token;
}

export async function rotateRefreshToken(oldToken: string) {
  const record = await prisma.refreshToken.findUnique({ where: { token: oldToken } });
  if (!record || record.revokedAt || record.expiresAt < new Date()) {
    throw Object.assign(new Error("Invalid refresh token"), { statusCode: 401 });
  }
  await prisma.refreshToken.update({ where: { token: oldToken }, data: { revokedAt: new Date() } });
  return signRefreshToken(record.userId);
}

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
