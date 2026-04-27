const R2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_R2_URL ||
  "https://pub-a8eb42772a2245d9aea8505c8edbadd7.r2.dev";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const r2Hostname = getHostname(R2_PUBLIC_URL);
const supabaseHostname = getHostname(SUPABASE_URL);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...(r2Hostname ? [{ protocol: "https", hostname: r2Hostname }] : []),
      ...(supabaseHostname
        ? [{ protocol: "https", hostname: supabaseHostname }]
        : [{ protocol: "https", hostname: "**.supabase.co" }]),
    ],
  },
};

export default nextConfig;
