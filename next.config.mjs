// @ts-check
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  cacheOnNavigation: true,
  swSrc: "src/app/sw.js",
  swDest: "public/sw.js",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  cacheComponents: true,
  cacheLife: {
    halfHour: {
      stale: 60 * 5,
      revalidate: 60 * 30,
      expire: 60 * 60,
    },
    monthly: {
      stale: 60 * 60 * 24 * 7,
      revalidate: 60 * 60 * 24 * 30,
      expire: 60 * 60 * 24 * 60,
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
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("@napi-rs/canvas");
    }
    return config;
  },
};

export default withSerwist(nextConfig);