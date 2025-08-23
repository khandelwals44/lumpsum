"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calculator,
  TrendingUp,
  Target,
  DollarSign,
  Shield,
  Calendar,
  PieChart,
  BarChart3
} from "lucide-react";

const calculators = [
  {
    href: "/calculators/emi",
    title: "EMI Calculator",
    description: "Calculate Equated Monthly Instalments with detailed amortization schedule",
    icon: Calculator,
    color: "from-blue-500 to-blue-600"
  },
  {
    href: "/calculators/sip",
    title: "SIP Calculator",
    description: "Plan your Systematic Investment Plan with growth projections",
    icon: TrendingUp,
    color: "from-green-500 to-green-600"
  },
  {
    href: "/calculators/lumpsum",
    title: "Lumpsum Calculator",
    description: "Calculate future value of one-time investments",
    icon: DollarSign,
    color: "from-purple-500 to-purple-600"
  },
  {
    href: "/calculators/invest",
    title: "Invest (SIP vs Lumpsum)",
    description: "Compare SIP vs one-time investment strategies",
    icon: BarChart3,
    color: "from-orange-500 to-orange-600"
  },
  {
    href: "/calculators/goal-planner",
    title: "Goal Planner",
    description: "Plan for your financial goals with inflation adjustment",
    icon: Target,
    color: "from-pink-500 to-pink-600"
  },
  {
    href: "/calculators/fd",
    title: "FD Calculator",
    description: "Calculate Fixed Deposit maturity with compounding",
    icon: Shield,
    color: "from-indigo-500 to-indigo-600"
  },
  {
    href: "/calculators/nps",
    title: "NPS Calculator",
    description: "Plan your National Pension System corpus",
    icon: Calendar,
    color: "from-red-500 to-red-600"
  },
  {
    href: "/calculators/ppf",
    title: "PPF Calculator",
    description: "Calculate Public Provident Fund maturity",
    icon: PieChart,
    color: "from-teal-500 to-teal-600"
  },
  {
    href: "/calculators/rd",
    title: "RD Calculator",
    description: "Calculate Recurring Deposit maturity",
    icon: TrendingUp,
    color: "from-cyan-500 to-cyan-600"
  },
  {
    href: "/calculators/swp",
    title: "SWP Calculator",
    description: "Plan your Systematic Withdrawal Plan",
    icon: DollarSign,
    color: "from-emerald-500 to-emerald-600"
  },
  {
    href: "/calculators/income-tax",
    title: "Income Tax Calculator",
    description: "Calculate tax liability under new regime",
    icon: Calculator,
    color: "from-rose-500 to-rose-600"
  },
  {
    href: "/calculators/step-up-sip",
    title: "Step-up SIP Calculator",
    description: "Calculate SIP with annual increase",
    icon: TrendingUp,
    color: "from-violet-500 to-violet-600"
  }
];

export default function CalculatorsPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Professional Financial Calculators
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-zinc-600 dark:text-zinc-300">
            Comprehensive suite of financial calculators to help you make informed investment
            decisions. From basic EMI calculations to advanced goal planning, we&apos;ve got you
            covered.
          </p>
        </motion.div>
      </section>

      {/* Calculators Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((calculator, index) => (
            <motion.div
              key={calculator.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={calculator.href}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${calculator.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <calculator.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                      {calculator.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400">{calculator.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Our Calculators?</h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-300">
            Professional-grade tools designed for accuracy and ease of use
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Accurate Calculations</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Built with precise financial formulas and real-world scenarios
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Beautiful Visualizations</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Interactive charts and graphs to help you understand your data
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              All calculations happen in your browser - your data stays private
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready for Advanced Planning?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Take your financial planning to the next level with our goal-based investment
            recommendation platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding">
              <span className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                <Target className="w-5 h-5 mr-2" />
                Start Goal Planning
              </span>
            </Link>
            <Link href="/dashboard">
              <span className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                <BarChart3 className="w-5 h-5 mr-2" />
                View Dashboard
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
