const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// Extract the Supabase project ID from the URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseProjectId =
  supabaseUrl.match(/(?:https?:\/\/)?([^.]+)/)?.[1] || ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
    {
      source: '/sw.js',
      headers: [
        {
          key: 'Content-Type',
          value: 'application/javascript; charset=utf-8',
        },
        {
          key: 'Cache-Control',
          value: 'no-cache, no-store, must-revalidate',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self'",
        },
      ],
    },
  ],
  images: {
    remotePatterns: [
      /*{
        protocol: 'https',
        hostname: `${supabaseProjectId}.supabase.co`,
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'buildersleague.payloadcms.app',
      },
      {
       protocol: 'http',
       hostname: 'localhost',
      },
      
      {
        protocol: 'http',
        hostname: process.env.CMS_DOMAIN,
      },
      */
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
}

module.exports = withBundleAnalyzer(nextConfig)
