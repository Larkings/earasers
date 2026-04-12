/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

// Content Security Policy — beperkt waar scripts/images/connecties vandaan kunnen komen.
// 'unsafe-inline' voor styles is nodig voor Next.js CSS modules en styled-jsx.
// 'unsafe-eval' is nodig voor Next.js dev mode en dynamic imports.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.shopify.com https://earasers-eu.myshopify.com https://www.earasers.shop https://img.youtube.com",
  "font-src 'self' data:",
  "connect-src 'self' https://earasers-eu.myshopify.com https://cdn.shopify.com",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' https://shop.app https://*.myshopify.com",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ')

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',   value: 'on' },
  { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy',  value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig = {
  reactStrictMode: true,
  i18n,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 768, 1024, 1280, 1536],
    imageSizes: [64, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'earasers-eu.myshopify.com',
        pathname: '/cdn/shop/**',
      },
      {
        protocol: 'https',
        hostname: 'www.earasers.shop',
        pathname: '/cdn/shop/files/**',
      },
      {
        // Shopify Storefront API product images + instruction diagram images
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        // YouTube video thumbnails
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

module.exports = nextConfig;
