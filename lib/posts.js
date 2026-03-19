import { supabase } from "@/lib/supabase";
import { cache } from "react";

// GET SINGLE POST
export const getPost = cache(async (slug) => {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, content, excerpt, category, published_at, views")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("getPost error:", error);
    return null;
  }

  return data;
});

// GET RELATED POSTS
export const getRelatedPosts = cache(async (category, slug) => {
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
});

// GET ALL POSTS (MAIN ENGINE)
export const getAllPosts = cache(
  async (category, page = 1, limit = 9, sort = "latest", search = "") => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("posts")
      .select("id, title, slug, excerpt, published_at, category, views", {
        count: "exact",
      });

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
      posts: data,
      total: count,
    };
  },
);

// GET CATEGORIES
export const getCategories = cache(async () => {
  const { data, error } = await supabase.from("posts").select("category");

  if (error) {
    console.error("getCategories error:", error);
    return ["all"];
  }

  // Remove duplicates
  const unique = [...new Set(data.map((item) => item.category))];

  return ["all", ...unique];
});

// GET POSTS BY CATEGORIES
export const getPostsCategory = cache(async (category) => {
  let query = supabase
    .from("posts")
    .select("id, title, slug, excerpt, published_at, category, views")
    .order("published_at");

  if (category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getPostsByCategory error:", error);
    return [];
  }

  return data;
});

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
  const views = post.views || 0;

  // Age in hours
  const ageInHours =
    (Date.now() - new Date(post.published_at).getTime()) / (1000 * 60 * 60);

  // Prevent division by zero
  const freshness = 1 / (ageInHours + 1);

  // Final score formula
  const score = views * 0.7 + freshness * 100;

  return score;
}

// GET SMART FEED
export async function getSmartFeed(limit = 6) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, excerpt, category, views, published_at")
    .limit(50); // take more data to rank properly

  if (error) {
    console.error("Smart feed error:", error);
    return [];
  }

  const scored = data.map((post) => ({
    ...post,
    score: calculatePostScore(post),
  }));

  // sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
