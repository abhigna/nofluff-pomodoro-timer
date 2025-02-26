import type { NextConfig } from "next";
import withPWA from '@ducanh2912/next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /* config options here */
  
  // Add this to prevent hydration errors with time-based components
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true
  },
  
  // Enable static exports
  output: 'export',
  
  // Disable server-side features
  images: {
    unoptimized: true,
  },
  
  // Disable server-side API routes
  trailingSlash: true,
};

export default pwaConfig(nextConfig);
