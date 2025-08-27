import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export const GET = async (req: Request) => {
  return NextAuth(authOptions)(req as any);
};
export const POST = GET;
