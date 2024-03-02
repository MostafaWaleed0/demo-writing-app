/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    unoptimized: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        port: "",
      },
    ],
  },
};

export default nextConfig;
