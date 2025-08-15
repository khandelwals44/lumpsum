import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const providers: NextAuthOptions["providers"] = [];

// Google Provider
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  );
}

// GitHub Provider
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    })
  );
}

// Credentials Provider (Email/Password)
providers.push(
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      });

      if (!user || !user.password) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return { id: user.id, email: user.email, name: user.name, role: user.role } as any;
    }
  })
);

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? "USER";
      }
      // If logging in via OAuth, ensure role exists on DB
      if (!token.role && token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email as string } });
        token.role = dbUser?.role ?? "USER";
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
      // After sign in, send everyone to dashboard for now
      const isRelative = url.startsWith("/");
      const isSameHost = url.startsWith(baseUrl);
      const target = "/dashboard";
      if (isRelative) return target;
      if (isSameHost) return target;
      return baseUrl + target;
    }
  },
  pages: {
    signIn: "/auth/signin"
  }
};
