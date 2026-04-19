import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;

const baseUrl = "https://shedbody.com";
const publicationName = "ShedBody";
const publicationLanguage = "en";

const escapeXml = (unsafe) => {
  if (typeof unsafe !== "string") {
    return "";
  }
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
};

export async function GET() {
  try {
    const supabase = await createClient();

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const { data: posts, error } = await supabase
      .from("posts")
      .select("slug, category, title, published_at")
      .not("slug", "is", null)
      .not("category", "is", null)
      .not("title", "is", null)
      .not("published_at", "is", null)
      .gte("published_at", twoDaysAgo.toISOString())
      .order("published_at", { ascending: false });

    if (error) {
      console.error(
        "Database Error fetching posts for news sitemap:",
        error.message,
      );
      return new Response("Error generating news sitemap.", { status: 500 });
    }

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${(posts || [])
  .map((post) => {
    // URL Encoding for safety
    const safeCategory = encodeURIComponent(post.category.toLowerCase());
    const safeSlug = encodeURIComponent(post.slug);

    return `  <url>
    <loc>${baseUrl}/${safeCategory}/${safeSlug}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(publicationName)}</news:name>
        <news:language>${publicationLanguage}</news:language>
      </news:publication>
      <news:publication_date>${new Date(post.published_at).toISOString()}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    return new Response(sitemapContent.trim(), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
      },
    });
  } catch (err) {
    console.error("Server Error in News Sitemap:", err);
    return new Response("Internal Server Error generating news sitemap.", {
      status: 500,
    });
  }
}
