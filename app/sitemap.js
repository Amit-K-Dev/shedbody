import { supabase } from "@/lib/supabase";

export default async function sitemap() {
  const { data: posts } = await supabase
    .from("posts")
    .select("slug, category, published_at");

  const baseUrl = "https://shedbody.com";

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/${post.category.toLowerCase()}/${post.slug}`,
    lastModified: post.published_at,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...postUrls,
  ];
}
