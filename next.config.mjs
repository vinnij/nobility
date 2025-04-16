/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: 'cdn.discordapp.com',
                protocol: 'https',
            },
            {
                hostname: 'imagedelivery.net',
                protocol: 'https',
            },
            {
                hostname: 'content.rustmaps.com',
                protocol: 'https',
            },
            {
                hostname: 'cdn.mrddd.xyz',
                protocol: 'https',
            },
            {
                hostname: 'avatar.iran.liara.run',
                protocol: 'https',
            },
            {
                hostname: 'avatars.steamstatic.com',
                protocol: 'https',
            },
        ],
    },
};

export default nextConfig;
