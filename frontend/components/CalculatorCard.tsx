"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CalculatorCard({
  href,
  title,
  description
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-lg border border-zinc-200 p-5 transition hover:shadow-md dark:border-zinc-800"
      aria-label={title}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-zinc-400 transition group-hover:translate-x-1 group-hover:text-zinc-900 dark:group-hover:text-white" />
      </div>
    </Link>
  );
}
