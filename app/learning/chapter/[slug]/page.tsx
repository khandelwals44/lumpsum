import { Suspense } from "react";
import ChapterClient from "./ChapterClient";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    title: `Learning Chapter - ${params.slug.replace(/-/g, " ")} | lumpsum.in`,
    description: "Learn mutual fund investing with our comprehensive curriculum."
  };
}

export default function ChapterPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}
    >
      <ChapterClient slug={params.slug} />
    </Suspense>
  );
}
