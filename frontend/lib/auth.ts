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
import { getRequiredEnvVars } from "@/src/env.server";

// Function to get providers at runtime (not import time)
function getProviders() {
  const providers: NextAuthOptions["providers"] = [];
  
  try {
    const envVars = getRequiredEnvVars();
    if (envVars.GOOGLE_CLIENT_ID && envVars.GOOGLE_CLIENT_SECRET) {
      providers.push(
        GoogleProvider({
          clientId: envVars.GOOGLE_CLIENT_ID,
          clientSecret: envVars.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              prompt: "consent",
              access_type: "offline",
              response_type: "code"
            }
          }
        })
      );
      console.log('Google OAuth provider configured successfully');
    } else {
      console.warn('Google OAuth not configured: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    }
  } catch (error) {
    console.warn('Google OAuth not configured:', error);
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

  return providers;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: getProviders(),
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? "USER";
      }
      if (account) {
        token.provider = account.provider;
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
    signIn: "/auth/signin",
    error: "/auth/error"
  }
};
