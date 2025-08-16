/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@testing-library/react",
      "recharts"
    ]
  },
  images: {
    formats: ["image/avif", "image/webp"]
  },
  poweredByHeader: false
};

export default nextConfig;


