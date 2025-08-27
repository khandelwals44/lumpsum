"use client";

import { Suspense } from "react";
import OnboardingClient from "@/components/onboarding/OnboardingClient";

export default function Page() {
  return (
    <Suspense>
      <OnboardingClient />
    </Suspense>
  );
}
