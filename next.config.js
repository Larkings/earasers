/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
    reactStrictMode: true,
    i18n,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.earasers.shop',
                pathname: '/cdn/shop/files/**',
            },
        ],
    },
};

module.exports = nextConfig;
