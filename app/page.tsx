"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target,
  TrendingUp,
  Shield,
  BarChart3,
  User,
  Calculator,
  ArrowRight,
  CheckCircle,
  Star,
  Zap
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Goal-Based Planning",
    description: "Set multiple investment goals with personalized strategies and tracking"
  },
  {
    icon: TrendingUp,
    title: "AI-Powered Recommendations",
    description: "Get intelligent fund suggestions based on your risk profile and goals"
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Comprehensive risk evaluation with smart questionnaire flow"
  },
  {
    icon: BarChart3,
    title: "Portfolio Tracking",
    description: "Real-time monitoring of your investments with beautiful visualizations"
  },
  {
    icon: User,
    title: "Personalized Experience",
    description: "Tailored investment plans based on your unique financial situation"
  },
  {
    icon: Calculator,
    title: "Advanced Calculators",
    description: "Professional-grade financial calculators for all your planning needs"
  }
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    content:
      "The goal-based approach helped me plan for my child's education systematically. The recommendations are spot-on!",
    rating: 5
  },
  {
    name: "Rajesh Kumar",
    role: "Business Owner",
    content:
      "Finally, a platform that understands my investment goals and provides personalized recommendations. Highly recommended!",
    rating: 5
  },
  {
    name: "Anita Patel",
    role: "Marketing Manager",
    content:
      "The risk assessment was so intuitive, and the fund recommendations are exactly what I needed for my retirement planning.",
    rating: 5
  }
];

const stats = [
  { label: "Active Users", value: "10,000+" },
  { label: "Investment Goals", value: "25,000+" },
  { label: "Fund Recommendations", value: "50,000+" },
  { label: "Success Rate", value: "94%" }
];

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Transform Your Financial Future
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-zinc-600 dark:text-zinc-300 mb-8">
            Get AI-powered mutual fund recommendations tailored to your goals. Track your progress,
            optimize your portfolio, and achieve your financial dreams with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4">
              <User className="w-5 h-5 mr-2" />
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              <Calculator className="w-5 h-5 mr-2" />
              Try Calculators
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose lumpsum.in?</h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
            We combine cutting-edge technology with financial expertise to deliver the most
            personalized investment experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl">
        <div className="text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of investors who are already achieving their financial goals with our
            intelligent recommendation platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              <Zap className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              View Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-300">
            Join thousands of satisfied investors who trust lumpsum.in
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-zinc-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started Today</h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-300">
            Choose your path to financial success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">New to Investing?</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  Start with our comprehensive onboarding process. We&apos;ll assess your risk
                  profile and create a personalized investment plan.
                </p>
                <Button size="lg" className="w-full">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Start Onboarding
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Already Have Goals?</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  Jump straight to your personalized dashboard to track your progress and get fund
                  recommendations.
                </p>
                <Button size="lg" variant="outline" className="w-full">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
