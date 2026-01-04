import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Ignore large data files to prevent memory issues
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules',
        '**/.git',
        '**/.next',
        '**/raw_data/**',
        '**/db/**',
        '**/local.db',
      ],
    };

    // Optimize cache settings
    config.cache = {
      type: 'filesystem',
      compression: 'gzip',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    };

    // Reduce parallel processing to save memory
    config.parallelism = 1;

    // Exclude CSV and large JSON files from being processed
    config.module.rules.push({
      test: /\.(csv)$/,
      use: 'ignore-loader',
    });

    return config;
  },
};

export default nextConfig;
