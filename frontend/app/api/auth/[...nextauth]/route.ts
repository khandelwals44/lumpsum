import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNextAuthUrl } from "@/src/env.server";

export const GET = async (req: Request) => {
  const url = getNextAuthUrl();
  return NextAuth({ ...authOptions, url })(req as any);
};
export const POST = GET;
