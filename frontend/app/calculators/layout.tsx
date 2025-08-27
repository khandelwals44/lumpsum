import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Calculators",
  description: "Professional financial calculators for EMI, SIP, lumpsum investments, goal planning, and more. Plan your investments with precision.",
  openGraph: {
    title: "Financial Calculators | Lumpsum.in",
    description: "Professional financial calculators for EMI, SIP, lumpsum investments, goal planning, and more. Plan your investments with precision.",
    url: "/calculators",
    type: "website"
  },
  alternates: {
    canonical: "/calculators"
  }
};

export default function CalculatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
