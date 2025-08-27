/**
 * NextAuth configuration
 * - Credentials + OAuth providers
 * - JWT sessions with role propagation
 * - Redirect to /dashboard on sign-in
 */
import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerEnv, getNextAuthUrl } from "@/lib/env.server";

export function buildAuthOptions(): NextAuthOptions {
  const env = getServerEnv();
  const providers: NextAuthOptions["providers"] = [];

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET
      })
    );
  }

  if (env.GITHUB_ID && env.GITHUB_SECRET) {
    providers.push(
      GitHubProvider({
        clientId: env.GITHUB_ID,
        clientSecret: env.GITHUB_SECRET
      })
    );
  }

  providers.push(
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role } as any;
      }
    })
  );

  return {
    adapter: PrismaAdapter(prisma),
    providers,
    session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = (user as any).id;
          token.role = (user as any).role ?? "USER";
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          (session.user as any).id = token.id as string;
          (session.user as any).role = (token.role as string) ?? "USER";
        }
        return session;
      },
      async redirect({ url, baseUrl }) {
        const target = "/dashboard";
        const isRelative = url.startsWith("/");
        const isSameHost = url.startsWith(baseUrl);
        if (isRelative) return target;
        if (isSameHost) return target;
        return baseUrl + target;
      }
    },
    pages: {
      signIn: "/auth/signin"
    }
  };
}

// Export authOptions for backward compatibility with existing API routes
export const authOptions = buildAuthOptions();
