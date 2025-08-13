import Link from "next/link";
import { CalculatorCard } from "@/components/CalculatorCard";

const calculators = [
  {
    href: "/calculators/emi",
    title: "EMI Calculator",
    description: "Equated Monthly Instalment with amortization schedule"
  },
  {
    href: "/calculators/sip",
    title: "SIP Calculator",
    description: "Monthly SIP maturity and gains"
  },
  {
    href: "/calculators/lumpsum",
    title: "Lumpsum Calculator",
    description: "Future value of lumpsum investment"
  },
  {
    href: "/calculators/goal-planner",
    title: "Goal Planner",
    description: "Inflation-adjusted goal with required SIP/Lumpsum"
  },
  {
    href: "/calculators/fd",
    title: "FD Calculator",
    description: "Fixed Deposit maturity with compounding"
  },
  {
    href: "/calculators/nps",
    title: "NPS Calculator",
    description: "NPS corpus and pension estimate"
  }
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Plan smarter wealth with beautiful, accurate calculators
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
          EMI, SIP, Lumpsum, Goal Planner, FD and NPS calculators. SEO-friendly, privacy-respecting,
          and blazing fast.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="#calculators"
            className="rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
          >
            Browse Calculators
          </Link>
          <Link
            href="/about"
            className="rounded-md border border-zinc-300 px-4 py-2 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            About
          </Link>
        </div>
      </section>

      <section id="calculators" className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {calculators.map((c) => (
          <CalculatorCard key={c.href} href={c.href} title={c.title} description={c.description} />
        ))}
      </section>
    </div>
  );
}
