import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const now = new Date();

  // Core pages
  const coreRoutes = [
    "",
    "/about",
    "/calculators",
    "/learning",
    "/auth/signin",
    "/auth/signup"
  ];

  // Calculator routes
  const calculatorRoutes = [
    "/calculators/emi",
    "/calculators/sip", 
    "/calculators/lumpsum",
    "/calculators/goal-planner",
    "/calculators/fd",
    "/calculators/nps",
    "/calculators/rd",
    "/calculators/swp",
    "/calculators/ppf",
    "/calculators/invest",
    "/calculators/xirr",
    "/calculators/step-up-sip",
    "/calculators/gst",
    "/calculators/income-tax"
  ];

  const allRoutes = [...coreRoutes, ...calculatorRoutes];

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route.startsWith("/calculators") ? 0.9 : 0.8
  }));
}
