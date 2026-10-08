import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // Duplicate-host fix: the default Vercel URL is what search engines indexed.
        // Send it (and only it — preview URLs are untouched) to the real domain.
        source: "/:path*",
        has: [{ type: "host", value: "albanyaiguy.vercel.app" }],
        destination: "https://albanyaiguy.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
