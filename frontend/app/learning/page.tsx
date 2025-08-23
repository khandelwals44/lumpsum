import { Suspense } from "react";
import LearningHubClient from "./LearningHubClient";

export const metadata = {
  title: "Mutual Fund University - Learn Investing | lumpsum.in",
  description:
    "Master mutual fund investing with our comprehensive curriculum. From basics to advanced strategies, learn everything about SIP, lumpsum, portfolio management, and more.",
  openGraph: {
    title: "Mutual Fund University - Learn Investing",
    description:
      "Master mutual fund investing with our comprehensive curriculum. From basics to advanced strategies.",
    type: "website"
  }
};

export default function LearningHubPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}
    >
      <LearningHubClient />
    </Suspense>
  );
}
