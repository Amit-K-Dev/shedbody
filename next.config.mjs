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

const csp = `
default-src 'self';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
object-src 'none';
img-src 'self' data: blob: https:;
font-src 'self' data: https:;
style-src 'self' 'unsafe-inline' https:;
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https:;
connect-src 'self' https: wss:;
frame-src https://challenges.cloudflare.com;
upgrade-insecure-requests;
`
  .replace(/\n/g, " ")
  .replace(/\s{2,}/g, " ")
  .trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cloudflare direct image serve
    unoptimized: true,

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

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
