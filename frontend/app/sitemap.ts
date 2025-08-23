import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.lumpsum.in";
  const now = new Date();

  const routes = [
    "",
    "/about",
    "/calculators/emi",
    "/calculators/sip",
    "/calculators/lumpsum",
    "/calculators/goal-planner",
    "/calculators/fd",
    "/calculators/nps"
  ];

  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.8
  }));
}
