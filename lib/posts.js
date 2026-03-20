import { supabase } from "@/lib/supabase";

// GET SINGLE POST
export async function getPost(slug) {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, content, excerpt, category, published_at, views, updated_at",
    )
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("getPost error:", error);
    return null;
  }

  return data;
}

// GET RELATED POSTS
export async function getRelatedPosts(category, slug) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, category")
    .eq("category", category)
    .neq("slug", slug)
    .limit(3);

  if (error) {
    console.error("related posts error:", error);
    return [];
  }

  return data || [];
}

// GET ALL POSTS (MAIN ENGINE)
export async function getAllPosts(
  category,
  page = 1,
  limit = 9,
  sort = "latest",
  search = "",
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, published_at, category, views, updated_at",
      {
        count: "exact",
      },
    );

  // Sorting logic
  if (sort === "popular") {
    query = query.order("views", { ascending: false });
  } else if (sort === "oldest") {
    query = query.order("published_at", { ascending: true });
  } else {
    query = query.order("published_at", { ascending: false });
  }

  // Category filter
  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  // Appy pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("getAllPosts error:", error);
    return { posts: [], total: 0 };
  }

  return {
    posts: data || [],
    total: count || 0,
  };
}

// GET CATEGORIES
export async function getCategories() {
  const { data, error } = await supabase.from("posts").select("category");

  if (error) {
    console.error("getCategories error:", error);
    return ["all"];
  }

  // Remove duplicates
  const unique = [...new Set((data || []).map((item) => item.category))];

  return ["all", ...unique];
}

// GET POSTS BY CATEGORIES
export async function getPostsCategory(category) {
  let query = supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, published_at, category, views, updated_at",
    )
    .order("published_at", { ascending: false });

  if (category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getPostsByCategory error:", error);
    return [];
  }

  return data;
}

// GET TRENDING POSTS
export async function getTrendingPosts(limit = 6) {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, category, views, updated_at, published_at",
    )
    .gte(
      "updated_at",
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    )
    .order("views", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Trending error:", error);
    return [];
  }
  return data;
}

// GET POPULAR POSTS
export async function getPopularPosts(limit = 6) {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, category, views, updated_at, published_at",
    )
    .order("views", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Popular error:", error);
    return [];
  }
  return data;
}

// GET SCORING SYSTEM
export function calculatePostScore(post) {
  if (!post) return 0;

  const views = post.views || 0;

  // Safe date handling
  const publishedTime =
    post?.published_at && !isNaN(new Date(post.published_at))
      ? new Date(post.published_at).getTime()
      : Date.now();

  // Age in hours
  const ageInHours = (Date.now() - publishedTime) / (1000 * 60 * 60);

  // Prevent division by zero
  const freshness = 1 / (ageInHours + 1);

  // Final score formula
  const score = views * 0.8 + freshness * 20;

  return score;
}

// GET SMART FEED
export async function getSmartFeed(limit = 6) {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, category, views, published_at, updated_at",
    )
    .limit(50); // take more data to rank properly

  if (error) {
    console.error("Smart feed error:", error);
    return [];
  }

  const scored = (data || []).map((post) => ({
    ...post,
    score: calculatePostScore(post),
  }));

  // sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
