/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // In future, if mein experts' photo comes fro any external link, then allow domain here
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-a8eb42772a2245d9aea8505c8edbadd7.r2.dev",
      },
    ],
  },
};

export default nextConfig;
