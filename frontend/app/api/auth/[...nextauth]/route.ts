import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export const GET = async (req: Request) => {
  try {
    return await NextAuth(authOptions)(req as any);
  } catch (error) {
    console.error('NextAuth GET error:', error);
    return new Response('Authentication error', { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    return await NextAuth(authOptions)(req as any);
  } catch (error) {
    console.error('NextAuth POST error:', error);
    return new Response('Authentication error', { status: 500 });
  }
};
