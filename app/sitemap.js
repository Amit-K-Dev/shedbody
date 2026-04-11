import { createClient } from "@/lib/supabase/server";

export default async function sitemap() {
  const supabase = await createClient();

  const baseUrl = "https://shedbody.com";

  const staticPages = [
    {
      url: baseUrl,

      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("slug, category, published_at");

    if (error) {
      console.error(
        "Supabase Error fetching posts for sitemap:",
        error.message,
      );
      throw error;
    }

    const dynamicUrls = (posts || []).map((post) => ({
      url: `${baseUrl}/${post.category.toLowerCase()}/${post.slug}`,

      lastModified: new Date(post.published_at).toISOString(),
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
