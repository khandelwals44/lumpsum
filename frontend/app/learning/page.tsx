import { Suspense } from "react";
import LearningHubClient from "./LearningHubClient";

export default function LearningPage() {
  return (
    <Suspense fallback={<div>Loading learning content...</div>}>
      <LearningHubClient />
    </Suspense>
  );
}
