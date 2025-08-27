import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNextAuthUrl } from "@/src/env.server";

export const GET = async (req: Request) => {
  return NextAuth({ ...authOptions, site: getNextAuthUrl() })(req as any);
};
export const POST = GET;
