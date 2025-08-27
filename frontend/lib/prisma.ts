import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Only use global instance in development
if (process.env.NODE_ENV === 'development') globalForPrisma.prisma = prisma;
