import type { NextConfig } from "next";

const isStaticBuild = process.env.BUILD_STATIC === 'true';

const nextConfig: NextConfig = {
  ...(isStaticBuild ? { output: "export" } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;