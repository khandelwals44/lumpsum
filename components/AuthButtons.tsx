"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { status } = useSession();
  const isAuthed = status === "authenticated";
  return (
    <div className="flex items-center gap-2">
      {isAuthed ? (
        <>
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
        <button
          onClick={() => signIn()}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Login
        </button>
      )}
    </div>
  );
}
