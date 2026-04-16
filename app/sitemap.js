import { createClient } from "@/lib/supabase/server";

export default async function sitemap() {
  const supabase = await createClient();

  const baseUrl = "https://shedbody.com";

  const staticPages = [
    { path: "", priority: 1.0 },
    { path: "/articles", priority: 0.9 },
    { path: "/about", priority: 0.7 },
    { path: "/calculators/bmi", priority: 0.7 },
    { path: "/scientific-review-board", priority: 0.6 },
    { path: "/editorial-process", priority: 0.5 },
    { path: "/advertising-policy", priority: 0.4 },
    { path: "/privacy-policy", priority: 0.4 },
    { path: "/terms-of-use", priority: 0.4 },
    { path: "/cookies-policy", priority: 0.4 },
    { path: "/gdpr-privacy-policy", priority: 0.4 },
  ].map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: page.priority,
  }));

  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("slug, category, published_at, updated_at")
      .not("slug", "is", null)
      .not("category", "is", null)
      .not("published_at", "is", null);

    if (error) {
      console.error(
        "Supabase Error fetching posts for sitemap:",
        error.message,
      );
      throw error;
    }

    const dynamicUrls = (posts || []).map((post) => ({
      url: `${baseUrl}/${post.category.toLowerCase()}/${post.slug}`,

      lastModified: new Date(post.updated_at || post.published_at).toISOString(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticPages, ...dynamicUrls];
  } catch (error) {
    console.error(
      "Sitemap Generation Failed! Falling back to static pages.",
      error,
    );
    return staticPages;
  }
}
