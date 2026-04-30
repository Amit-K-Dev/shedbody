const R2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_R2_URL || "https://media.shedbody.com";

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const r2Hostname = getHostname(R2_PUBLIC_URL);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.shedbody.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      ...(r2Hostname
        ? [
            {
              protocol: "https",
              hostname: r2Hostname,
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
