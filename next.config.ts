import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Disable type checking during build to save memory
  },
  eslint: {
    ignoreDuringBuilds: true, // Disable linting during build to save memory
  },
  webpack: (config, { isServer }) => {
    // Ignore large data files to prevent memory issues during watch
    if (config.watchOptions) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules',
          '**/.git',
          '**/.next',
          '**/raw_data/**',
          '**/local.db',
        ],
      };
    }

    return config;
  },
};

export default nextConfig;

