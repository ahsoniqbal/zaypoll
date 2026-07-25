import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Local Node installations may not trust the same certificate chain as the
    // browser. Let the browser load remote avatars directly during development.
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "github.com" }
    ],
  },
};

export default nextConfig;
