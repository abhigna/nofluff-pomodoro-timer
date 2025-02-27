import type { NextConfig } from "next";
import withPWA from '@ducanh2912/next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

// Get repository name from package.json or environment variable
const REPO_NAME = process.env.REPOSITORY_NAME || 'nofluff-pomodoro-timer';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Add this to prevent hydration errors with time-based components
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true
  },
  
  // Enable static exports
  output: 'export',
  
  // Configure the base path for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}` : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? `/${REPO_NAME}/` : '',
  
  // Disable server-side features
  images: {
    unoptimized: true,
  },
  
  // Disable server-side API routes
  trailingSlash: true,
};

export default pwaConfig(nextConfig);