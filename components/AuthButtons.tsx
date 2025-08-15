"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data, status } = useSession();
  const isAuthed = status === "authenticated";
  const role = (data?.user as any)?.role as string | undefined;

  return (
    <div className="flex items-center gap-2">
      {isAuthed ? (
        <>
          {role === "ADMIN" && (
            <a
              href="/admin"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            >
              Admin
            </a>
          )}
          <a
            href="/dashboard"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          >
            Dashboard
          </a>
          <button
            onClick={() => signOut()}
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <a
            href="/auth/signin"
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Login
          </a>
          <a
            href="/auth/signup"
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Sign Up
          </a>
        </>
      )}
    </div>
  );
}
