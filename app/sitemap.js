import { createClient } from "@/lib/supabase/server";
import { experts } from "@/lib/experts";

export default async function sitemap() {
  const supabase = await createClient();
  const baseUrl = "https://shedbody.com";

  const staticLastModified = "2024-05-01T00:00:00.000Z";

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/articles", priority: 0.9, changeFrequency: "daily" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/calculators/bmi", priority: 0.7, changeFrequency: "monthly" },
    {
      path: "/calculators/calorie",
      priority: 0.85,
      changeFrequency: "monthly",
      lastModified: "2026-04-29T00:00:00.000Z",
    },
    {
      path: "/calculators/pregnancy",
      priority: 0.8,
      changeFrequency: "monthly",
      lastModified: "2026-04-29T00:00:00.000Z",
    },
    {
      path: "/calculators/baby-percentile",
      priority: 0.8,
      changeFrequency: "monthly",
      lastModified: "2026-04-29T00:00:00.000Z",
    },
    { path: "/contact-us", priority: 0.7, changeFrequency: "yearly" },
    {
      path: "/scientific-review-board",
      priority: 0.6,
      changeFrequency: "monthly",
    },
    { path: "/editorial-process", priority: 0.5, changeFrequency: "yearly" },
    { path: "/advertising-policy", priority: 0.4, changeFrequency: "yearly" },
    { path: "/privacy-policy", priority: 0.4, changeFrequency: "yearly" },
    { path: "/terms-of-use", priority: 0.4, changeFrequency: "yearly" },
    { path: "/cookies-policy", priority: 0.4, changeFrequency: "yearly" },
    { path: "/gdpr-privacy-policy", priority: 0.4, changeFrequency: "yearly" },
    {
      path: "/cancellation-and-refund-policy",
      priority: 0.4,
      changeFrequency: "yearly",
    },
    { path: "/privacy-settings", priority: 0.4, changeFrequency: "yearly" },
  ].map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: page.lastModified || staticLastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const expertPages = experts.map((expert) => ({
    url: `${baseUrl}/experts/${expert.id}`,
    lastModified: staticLastModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("slug, category, published_at, updated_at, status")
      .eq("status", "published")
      .not("slug", "is", null)
      .not("category", "is", null)
      .not("published_at", "is", null);

    if (error) {
      console.error(
        "Database Error fetching posts for sitemap:",
        error.message,
      );
      throw error;
    }

    const dynamicUrls = (posts || []).map((post) => {
      const safeCategory = post.category.toLowerCase().replace(/\s+/g, "-");
      return {
        url: `${baseUrl}/${safeCategory}/${post.slug}`,
        lastModified: new Date(
          post.updated_at || post.published_at,
        ).toISOString(),
        changeFrequency: "weekly",
        priority: 0.8,
      };
    });

    return [...staticPages, ...expertPages, ...dynamicUrls];
  } catch (error) {
    console.error(
      "Sitemap Generation Failed! Falling back to static and expert pages.",
      error,
    );
    return [...staticPages, ...expertPages];
  }
}
