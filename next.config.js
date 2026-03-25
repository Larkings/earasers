/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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
