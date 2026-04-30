import { createClient } from "@supabase/supabase-js";

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

export async function GET() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "slug,title,excerpt,seo_desc,category,featured_image,published_at,updated_at,status",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(100);

  if (error) {
    return new Response("Failed to generate RSS feed", {
      status: 500,
    });
  }

  const items = (posts || [])
    .filter((post) => post.slug)
    .map((post) => {
      const title = escapeXml(post.title || "ShedBody");
      const link = escapeXml(getPostUrl(post));
      const description = escapeXml(
        post.seo_desc || post.excerpt || post.title || "ShedBody article",
      );
      const pubDate = new Date(
        post.published_at || post.updated_at || Date.now(),
      ).toUTCString();

      return `
  <item>
    <title>${title}</title>
    <link>${link}</link>
    <guid>${link}</guid>
    <pubDate>${pubDate}</pubDate>
    <description><![CDATA[${description}]]></description>
  </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>ShedBody</title>
    <link>${baseUrl}</link>
    <description>Evidence-based fitness, yoga, nutrition and wellness content from ShedBody.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
