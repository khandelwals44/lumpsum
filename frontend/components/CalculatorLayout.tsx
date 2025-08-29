/**
 * CalculatorLayout
 * - Provides consistent, modern styling for all calculator pages
 * - Better spacing, typography, and responsive design
 * - Professional result display and input field styling
 */
"use client";
import { ReactNode } from "react";

interface CalculatorLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function CalculatorLayout({ 
  title, 
  description, 
  children, 
  className = "" 
}: CalculatorLayoutProps) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {children}
      </div>
    </div>
  );
}

interface CalculatorSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function CalculatorSection({ 
  title, 
  children, 
  className = "" 
}: CalculatorSectionProps) {
  return (
    <section className={`space-y-6 ${className}`}>
      {title && (
        <div className="border-b border-zinc-200 dark:border-zinc-700 pb-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
        </div>
      )}
      {children}
    </section>
  );
}

interface CalculatorCardProps {
  children: ReactNode;
  className?: string;
}

export function CalculatorCard({ 
  children, 
  className = "" 
}: CalculatorCardProps) {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 ${className}`}>
      {children}
    </div>
  );
}

interface ResultsCardProps {
  children: ReactNode;
  className?: string;
}

export function ResultsCard({ 
  children, 
  className = "" 
}: ResultsCardProps) {
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}
