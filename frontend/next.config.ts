import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/classroom",
        destination: "/",
        permanent: false,
      },
      {
        source: "/summary",
        destination: "/sessions",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
