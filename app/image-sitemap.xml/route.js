import { createClient } from "@supabase/supabase-js";
import { normalizeImageUrl } from "@/lib/utils/imageUrl";

const baseUrl = "https://shedbody.com";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

function escapeXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getPostUrl(post) {
  const safeCategory = (post.category || "blog")
    .toLowerCase()
    .replace(/\s+/g, "-");

  return `${baseUrl}/${safeCategory}/${post.slug}`;
}

// Same fallback logic as schema.js
function getPostImage(post) {
  if (post.featured_image) {
    return normalizeImageUrl(post.featured_image);
  }

  if (post.content) {
    const htmlImg = post.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (htmlImg?.[1]) return normalizeImageUrl(htmlImg[1]);

    const mdImg = post.content.match(/!\[.*?\]\((.*?)\)/i);
    if (mdImg?.[1]) return normalizeImageUrl(mdImg[1]);
  }

  return null;
}

export async function GET() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("slug,title,seo_title,category,featured_image,content,status")
    .eq("status", "published");

  if (error) {
    return new Response("Failed to generate image sitemap", {
      status: 500,
    });
  }

  const urls = posts
    .filter((post) => post.slug)
    .map((post) => {
      const imageUrl = getPostImage(post);
      if (!imageUrl) return null;

      const pageUrl = getPostUrl(post);
      const title = post.seo_title || post.title || "ShedBody";

      return `
  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${escapeXml(title)}</image:title>
    </image:image>
  </url>`;
    })
    .filter(Boolean)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}
