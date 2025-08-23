import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user as any as { id: string; email?: string | null; role?: string };
}

export async function requireRole(allowed: string[]) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as string | undefined;
  if (!session?.user || !role || !allowed.includes(role)) {
    throw new Error("FORBIDDEN");
  }
  return { user: session.user as any, role } as {
    user: { id: string; role?: string };
    role: string;
  };
}
