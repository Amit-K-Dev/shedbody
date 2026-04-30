export const R2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_R2_URL || "https://media.shedbody.com";

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

export function normalizeImageUrl(url) {
  if (typeof url !== "string" || url.trim() === "") return url;

  return (
    url
      .trim()
      // old Cloudinary-style URLs → R2 domain
      .replace(/^https?:res\.cloudinary\.co(?:m)?/i, R2_PUBLIC_URL)
      .replace(/^https?:\/\/res\.cloudinary\.co(?:m)?/i, R2_PUBLIC_URL)
  );
}

export function getOptimizedImageUrl(url) {
  const normalizedUrl = normalizeImageUrl(url);

  if (typeof normalizedUrl !== "string" || normalizedUrl.trim() === "") {
    return normalizedUrl;
  }

  if (normalizedUrl.toLowerCase().endsWith(".svg")) {
    return normalizedUrl;
  }

  // configured remote URLs allow
  if (/^https?:\/\//i.test(normalizedUrl)) {
    const imageHostname = getHostname(normalizedUrl);

    const isConfiguredRemoteImage =
      imageHostname === r2Hostname ||
      imageHostname === supabaseHostname ||
      imageHostname?.endsWith(".supabase.co");

    if (!isConfiguredRemoteImage) {
      return normalizedUrl;
    }
  }

  // Direct CDN URL return
  // No Vercel optimization path
  return normalizedUrl;
}
