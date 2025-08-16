import "dotenv/config";
import { z } from "zod";

export const Env = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.string().default("4000"),
    DATABASE_URL: z.string().min(1).default("file:./dev.db"),
    JWT_SECRET: z.string().min(10).default("test-secret-key-for-testing-only-minimum-10-chars")
  })
  .parse(process.env);
