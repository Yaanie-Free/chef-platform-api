import { withContentlayer } from 'next-contentlayer'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

const nextConfig = withBundleAnalyzer({
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com', 'avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  reactStrictMode: true,
  poweredByHeader: false,
})

export default nextConfig
