import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNextAuthUrl } from "@/src/env.server";

export const dynamic = 'force-dynamic'; // ensure no static assumptions during build

export const GET = (req: Request) =>
  NextAuth({
    ...authOptions,
    trustHost: true, // allow Vercel-hosted inference
  })(req as any);

export const POST = GET;
