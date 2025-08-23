"use client";
/**
 * SocialShare
 * - Renders quick share actions for WhatsApp, Twitter (X), and Email
 * - Also exposes a fallback copy button for environments without Web Share API
 */
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Twitter, Mail, Copy, MessageCircle } from "lucide-react";

export function SocialShare({ className }: { className?: string }) {
  const { url, text } = useMemo(() => {
    const u = typeof window !== "undefined" ? window.location.href : "";
    const t = "Check this calculation on lumpsum.in";
    return { url: u, text: t };
  }, []);

  const wapp = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
  const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const mail = `mailto:?subject=${encodeURIComponent("lumpsum.in calculation")}&body=${encodeURIComponent(text + "\n" + url)}`;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <a
        href={wapp}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        <MessageCircle className="h-3 w-3" /> WhatsApp
      </a>
      <a
        href={tw}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        <Twitter className="h-3 w-3" /> Twitter
      </a>
      <a
        href={mail}
        className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        <Mail className="h-3 w-3" /> Email
      </a>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
          } catch {}
        }}
        className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        <Copy className="h-3 w-3" /> Copy
      </button>
    </div>
  );
}
