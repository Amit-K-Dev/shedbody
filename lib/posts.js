import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createStandardClient } from "@supabase/supabase-js";

// Helper for standardized error logging
const logError = (context, error) => console.error(`${context} error:`, error);

// GET SINGLE POST
export const getPost = cache(async (slug) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, content, excerpt, category, published_at, views, updated_at",
    )
    .eq("slug", slug)
    .single();

  if (error) {
    logError("getPost", error);
    return null;
  }
  return data;
});

// GET RELATED POSTS (Increased limit slightly for better UI options)
export const getRelatedPosts = cache(async (category, slug) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, category, excerpt")
    .eq("category", category)
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(3);

  return data || [];
});

// GET CATEGORIES (Performance Optimized)
export const getCategories = cache(async () => {
  const supabase = await createClient();

  const { data, error } = await supabase.from("posts").select("category");

  if (error) return ["all"];

  // Clean empty or null categories
  const unique = [
    ...new Set((data || []).map((item) => item.category).filter(Boolean)),
  ];
  return ["all", ...unique];
});

// GET TRENDING POSTS (With Safety Fallback)
export const getTrendingPosts = cache(async (limit = 6) => {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  let { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, category, views, updated_at, published_at",
    )
    .gte("updated_at", sevenDaysAgo)
    .order("views", { ascending: false })
    .limit(limit);

  // Fallback
  if (!data || data.length === 0) {
    const { data: fallbackData } = await supabase
      .from("posts")
      .select(
        "id, title, slug, excerpt, category, views, updated_at, published_at",
      )
      .order("views", { ascending: false })
      .limit(limit);
    return fallbackData || [];
  }

  return data;
});

// GET POPULAR POSTS
export const getPopularPosts = cache(async (limit = 6) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, category, views, updated_at, published_at",
    )
    .order("views", { ascending: false })
    .limit(limit);

  if (error) {
    logError("getPopularPosts", error);
    return [];
  }
  return data || [];
});

// SMART FEED SCORING
export function calculatePostScore(post) {
  if (!post) return 0;
  const views = post.views || 0;
  const publishedTime = new Date(post.published_at || Date.now()).getTime();
  const ageInHours = (Date.now() - publishedTime) / (1000 * 60 * 60);

  const freshnessScore = Math.max(0, 100 - ageInHours);
  return views * 0.5 + freshnessScore * 2;
}

// GET SMART FEED
export const getSmartFeed = cache(async (limit = 6) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, title, slug, excerpt, category, views, published_at, updated_at",
    )
    .order("published_at", { ascending: false })
    .limit(30);

  if (error || !data) return [];

  return data
    .map((post) => ({ ...post, score: calculatePostScore(post) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
});

// GET ALL POSTS (Category, Search, and Pagination Engine)
export const getAllPosts = cache(
  async (category, page = 1, limit = 9, sort = "latest", search = "") => {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("posts")
      .select(
        "id, title, slug, excerpt, published_at, category, views, updated_at",
        { count: "exact" },
      );

    // 1. Search Logic
    if (search && search.trim() !== "") {
      query = query.ilike("title", `%${search}%`);
    }

    // 2. Category Filter
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // 3. Sorting Logic
    if (sort === "popular") {
      query = query.order("views", { ascending: false });
    } else if (sort === "oldest") {
      query = query.order("published_at", { ascending: true });
    } else {
      query = query.order("published_at", { ascending: false });
    }

    // 4. Pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      logError("getAllPosts", error);
      return { posts: [], total: 0 };
    }

    return { posts: data || [], total: count || 0 };
  },
);

// GET CATEGORIES FOR BUILD TIME (No Cookies Required)
export const getCategoriesForBuild = async () => {
  const supabase = createStandardClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const { data, error } = await supabase.from("posts").select("category");

  if (error) {
    console.error("Build time categories error:", error);
    return ["all"];
  }

  const unique = [
    ...new Set((data || []).map((item) => item.category).filter(Boolean)),
  ];
  return ["all", ...unique];
};
