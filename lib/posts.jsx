import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createStandardClient } from "@supabase/supabase-js";

// Helper for standardized error logging
const logError = (context, error) => console.error(`${context} error:`, error);

const publicPostFields =
  "id, title, slug, excerpt, content, featured_image, category, views, updated_at, published_at, seo_title, seo_desc, keywords";

function applyPublicPostFilters(query) {
  return query
    .or("status.eq.published,status.eq.Published,status.eq.publish,status.is.null")
    .not("title", "is", null)
    .not("slug", "is", null)
    .not("category", "is", null)
    .not("published_at", "is", null);
}

// GET SINGLE POST
export const getPost = cache(async (slug, category = null) => {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(
      "id, title, slug, content, featured_image, processed_content, excerpt, category, published_at, views, updated_at, seo_title, seo_desc, keywords",
    );

  if (category) {
    query = query.ilike("category", category.trim());
  }

  const { data, error } = await applyPublicPostFilters(query)
    .ilike("slug", slug.trim())
    .maybeSingle();

  if (error) {
    logError("getPost", error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    content: data.processed_content || data.content || "",
  };
});

// GET REDIRECT URL (For SEO 301 Redirects)
export const getRedirectUrl = cache(async (oldUrl) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("redirects")
    .select("new_url")
    .eq("old_url", oldUrl)
    .single();

  if (error || !data) {
    return null;
  }

  return data.new_url;
});

// GET RELATED POSTS
export const getRelatedPosts = cache(async (category, slug) => {
  const supabase = await createClient();
  const query = supabase
    .from("posts")
    .select("id, title, slug, category, featured_image, excerpt, content")
    .eq("category", category);

  const { data, error } = await applyPublicPostFilters(query)
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(3);

  return data || [];
});

// GET CATEGORIES
export const getCategories = cache(async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("category")
    .eq("status", "published")
    .not("category", "is", null);

  if (error) return ["all"];

  const unique = [
    ...new Set((data || []).map((item) => item.category).filter(Boolean)),
  ];
  return ["all", ...unique];
});

// GET TRENDING POSTS
export const getTrendingPosts = cache(async (limit = 6) => {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const trendingQuery = supabase.from("posts").select(publicPostFields);

  let { data, error } = await applyPublicPostFilters(trendingQuery)
    .gte("updated_at", sevenDaysAgo)
    .order("views", { ascending: false })
    .limit(limit);

  if (!data || data.length === 0) {
    const fallbackQuery = supabase.from("posts").select(publicPostFields);

    const { data: fallbackData } = await applyPublicPostFilters(fallbackQuery)
      .order("views", { ascending: false })
      .limit(limit);
    return fallbackData || [];
  }

  return data;
});

// GET POPULAR POSTS
export const getPopularPosts = cache(async (limit = 6) => {
  const supabase = await createClient();

  const query = supabase.from("posts").select(publicPostFields);

  const { data, error } = await applyPublicPostFilters(query)
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

  const query = supabase.from("posts").select(publicPostFields);

  const { data, error } = await applyPublicPostFilters(query)
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

    let query = applyPublicPostFilters(
      supabase
        .from("posts")
        .select(
          "id, title, slug, featured_image, excerpt, content, published_at, category, views, updated_at, seo_title, seo_desc, keywords",
          { count: "exact" },
        ),
    );

    // Search Logic
    if (search && search.trim() !== "") {
      query = query.ilike("title", `%${search}%`);
    }

    // Category Filter
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Sorting Logic
    if (sort === "popular") {
      query = query.order("views", { ascending: false });
    } else if (sort === "oldest") {
      query = query.order("published_at", { ascending: true });
    } else {
      query = query.order("published_at", { ascending: false });
    }

    // Pagination
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

  const { data, error } = await supabase
    .from("posts")
    .select("category")
    .eq("status", "published")
    .not("category", "is", null);

  if (error) {
    console.error("Build time categories error:", error);
    return ["all"];
  }

  const unique = [
    ...new Set((data || []).map((item) => item.category).filter(Boolean)),
  ];
  return ["all", ...unique];
};

// ==========================================
// ADMIN DASHBOARD QUERIES (NO PUBLIC FILTERS)
// ==========================================

// GET ADMIN STATS (Total Posts & Views)
export const getAdminStats = cache(async () => {
  const supabase = await createClient();

  const { data: rpcStats, error: rpcError } = await supabase
    .rpc("admin_post_stats")
    .maybeSingle();

  if (!rpcError && rpcStats) {
    return {
      totalPosts: Number(rpcStats.total_posts || 0),
      totalViews: Number(rpcStats.total_views || 0),
      avgViews: Math.round(Number(rpcStats.avg_views || 0)),
    };
  }

  // Total Posts Count
  const { count: totalPosts, error: countError } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  // Total Views Sum
  const { data: allPostsViews, error: viewsError } = await supabase
    .from("posts")
    .select("views");

  if (countError) logError("getAdminStats (Count)", countError);
  if (viewsError) logError("getAdminStats (Views)", viewsError);

  const totalViews =
    allPostsViews?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;
  const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

  return {
    totalPosts: totalPosts || 0,
    totalViews,
    avgViews,
  };
});

// GET ADMIN RECENT POSTS (Includes Drafts)
export const getAdminRecentPosts = cache(async (limit = 5) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, views, category, status, published_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    logError("getAdminRecentPosts", error);
    return [];
  }
  return data || [];
});

// GET ADMIN TOP POSTS (Trending/Popular Live Posts)
export const getAdminTopPosts = cache(async (limit = 5) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, views, category, published_at")
    .eq("status", "published")
    .order("views", { ascending: false })
    .limit(limit);

  if (error) {
    logError("getAdminTopPosts", error);
    return [];
  }
  return data || [];
});
