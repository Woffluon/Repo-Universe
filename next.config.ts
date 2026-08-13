import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    githubCore: {
      stale: 300,
      revalidate: 1800,
      expire: 86400,
    },
    githubContributors: {
      stale: 300,
      revalidate: 3600,
      expire: 86400,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
    ],
  },
}

export default nextConfig
