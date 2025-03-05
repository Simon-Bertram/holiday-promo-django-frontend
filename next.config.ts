import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: false,
  // Configuration for webpack (used in production builds and when not using --turbopack)
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = false;
    }
    return config;
  },
  // Configuration for Turbopack (used when running with --turbopack flag)
  experimental: {
    turbo: {
      // Turbopack specific options
      resolveAlias: {
        // Add any aliases if needed
      },
      // Disable source maps in development if needed
      sourceMaps: false,
    },
  },
};

export default nextConfig;
