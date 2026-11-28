import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The footer used to link to /privacy; keep old links working.
  async redirects() {
    return [
      { source: '/privacy', destination: '/datenschutz', permanent: true },
    ];
  },
};

export default nextConfig;
