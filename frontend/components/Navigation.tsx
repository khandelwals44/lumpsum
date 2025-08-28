"use client";

import Link from "next/link";
import { Home, Target, BarChart3, User, Calculator, BookOpen, MessageSquare } from "lucide-react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Learning Hub", href: "/learning", icon: BookOpen },
  { name: "Calculators", href: "/calculators", icon: Calculator },
  { name: "About", href: "/about", icon: Target },
  { name: "Feedback", href: "/feedback", icon: MessageSquare }
];

export function DesktopNavigation() {
  return (
    <nav className="hidden md:flex items-center space-x-6">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="flex items-center space-x-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors"
        >
          <item.icon className="w-4 h-4" />
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  );
}

export function MobileNavigation() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-zinc-200/50 dark:bg-zinc-950/80 dark:border-zinc-800/50">
      <div className="flex justify-around py-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center space-y-1 p-2 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
