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
    
    // Only add Google provider if credentials are available
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
      console.log('✅ Google OAuth provider configured successfully');
    } else {
      console.warn('⚠️ Google OAuth not configured: Missing credentials');
    }
  } catch (error) {
    console.error('❌ Error configuring Google OAuth:', error);
  }

  // Always add credentials provider as fallback
  providers.push(
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user || !user.password) return null;

          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) return null;

          return { id: user.id, email: user.email, name: user.name, role: user.role } as any;
        } catch (error) {
          console.error('❌ Credentials authorization error:', error);
          return null;
        }
      }
    })
  );

  return providers;
}

// Get the base URL for NextAuth
function getNextAuthBaseUrl() {
  // In Vercel, use the deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Fallback to NEXTAUTH_URL or localhost
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
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
      // Always redirect to dashboard after successful sign-in
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
  },
  // Add error handling
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('✅ User signed in:', { email: user.email, provider: account?.provider });
    },
    async signOut({ session, token }) {
      console.log('👋 User signed out');
    }
  }
};
