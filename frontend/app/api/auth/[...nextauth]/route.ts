import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic'; // ensure no static assumptions during build

export const GET = (req: Request) =>
  NextAuth(authOptions)(req as any);

export const POST = GET;
