import { cache } from "react";
import { PostRepository } from "@/lib/repositories/PostRepository.js";
import { D1Adapter } from "@/lib/repositories/D1Adapter.js";

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

function getRepo() {
  return new PostRepository(new D1Adapter());
}

async function getLegacyServerClient() {
  const { createClient } = await import("@/lib/supabase/server");
  return await createClient();
}

async function getLegacyStandardClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

// GET SINGLE POST
export const getPost = cache(async (slug, category = null) => {
  try {
    const repo = getRepo();
    const data = await repo.getPost(slug, category);
    if (data) {
      return {
        ...data,
        content: data.processed_content || data.content || "",
      };
    }
  } catch (d1Error) {
    logError("getPost (D1)", d1Error);
  }

  try {
    const supabase = await getLegacyServerClient();
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
  } catch (err) {
    logError("getPost (fallback)", err);
    return null;
  }
});

// GET REDIRECT URL (For SEO 301 Redirects)
export const getRedirectUrl = cache(async (oldUrl) => {
  try {
    const repo = getRepo();
    const newUrl = await repo.getRedirectUrl(oldUrl);
    if (newUrl) return newUrl;
  } catch (d1Error) {
    logError("getRedirectUrl (D1)", d1Error);
  }

  try {
    const supabase = await getLegacyServerClient();
    const { data, error } = await supabase
      .from("redirects")
      .select("new_url")
      .eq("old_url", oldUrl)
      .single();

    if (error || !data) {
      return null;
    }

    return data.new_url;
  } catch {
    return null;
  }
});

// GET RELATED POSTS
export const getRelatedPosts = cache(async (category, slug) => {
  try {
    const repo = getRepo();
    const data = await repo.getRelatedPosts(category, slug);
    if (data && data.length > 0) return data;
  } catch (d1Error) {
    logError("getRelatedPosts (D1)", d1Error);
  }

  try {
    const supabase = await getLegacyServerClient();
    const query = supabase
      .from("posts")
      .select("id, title, slug, category, featured_image, excerpt, content")
      .eq("category", category);

    const { data, error } = await applyPublicPostFilters(query)
      .neq("slug", slug)
      .order("published_at", { ascending: false })
      .limit(3);

    return data || [];
  } catch {
    return [];
  }
});

// GET CATEGORIES
export const getCategories = cache(async () => {
  try {
    const repo = getRepo();
    const data = await repo.getCategories();
    if (data && data.length > 0) return data;
  } catch (d1Error) {
    logError("getCategories (D1)", d1Error);
  }

  try {
    const supabase = await getLegacyServerClient();
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
  } catch {
    return ["all"];
  }
});

// GET TRENDING POSTS
export const getTrendingPosts = cache(async (limit = 6) => {
  try {
    const repo = getRepo();
    const data = await repo.getTrendingPosts(limit);
    if (data && data.length > 0) return data;
  } catch (d1Error) {
    logError("getTrendingPosts (D1)", d1Error);
  }

  try {
    const supabase = await getLegacyServerClient();
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
  } catch {
    return [];
  }
});

// GET POPULAR POSTS
export const getPopularPosts = cache(async (limit = 6) => {
  try {
    const repo = getRepo();
    const data = await repo.getPopularPosts(limit);
    if (data && data.length > 0) return data;
  } catch (d1Error) {
    logError("getPopularPosts (D1)", d1Error);
  }

  try {
    const supabase = await getLegacyServerClient();
    const query = supabase.from("posts").select(publicPostFields);

    const { data, error } = await applyPublicPostFilters(query)
      .order("views", { ascending: false })
      .limit(limit);

    if (error) {
      logError("getPopularPosts", error);
      return [];
    }
    return data || [];
  } catch {
    return [];
  }
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
  let data = null;

  try {
    const repo = getRepo();
    data = await repo.getPublishedPosts(30);
  } catch (d1Error) {
    logError("getSmartFeed (D1)", d1Error);
  }

  if (!data || data.length === 0) {
    try {
      const supabase = await getLegacyServerClient();
      const query = supabase.from("posts").select(publicPostFields);
      const result = await applyPublicPostFilters(query)
        .order("published_at", { ascending: false })
        .limit(30);

      if (result.data) data = result.data;
    } catch {
      data = [];
    }
  }

  return (data || [])
    .map((post) => ({ ...post, score: calculatePostScore(post) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
});

// GET ALL POSTS (Category, Search, and Pagination Engine)
export const getAllPosts = cache(
  async (category, page = 1, limit = 9, sort = "latest", search = "") => {
    try {
      const repo = getRepo();
      const res = await repo.getAllPosts(category, page, limit, sort, search);
      if (res && res.posts && res.posts.length > 0) return res;
    } catch (d1Error) {
      logError("getAllPosts (D1)", d1Error);
    }

    try {
      const supabase = await getLegacyServerClient();
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

      if (search && search.trim() !== "") {
        query = query.ilike("title", `%${search}%`);
      }

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      if (sort === "popular") {
        query = query.order("views", { ascending: false });
      } else if (sort === "oldest") {
        query = query.order("published_at", { ascending: true });
      } else {
        query = query.order("published_at", { ascending: false });
      }

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        logError("getAllPosts", error);
        return { posts: [], total: 0 };
      }

      return { posts: data || [], total: count || 0 };
    } catch {
      return { posts: [], total: 0 };
    }
  },
);

// GET CATEGORIES FOR BUILD TIME (No Cookies Required)
export const getCategoriesForBuild = async () => {
  try {
    const repo = getRepo();
    const data = await repo.getCategories();
    if (data && data.length > 0) return data;
  } catch (d1Error) {
    logError("getCategoriesForBuild (D1)", d1Error);
  }

  try {
    const supabase = await getLegacyStandardClient();
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
  } catch {
    return ["all"];
  }
};

// ==========================================
// ADMIN DASHBOARD QUERIES (NO PUBLIC FILTERS)
// ==========================================

// GET ADMIN STATS (Total Posts & Views)
export const getAdminStats = cache(async () => {
  try {
    const repo = getRepo();
    const data = await repo.getAdminStats();
    if (data) return data;
  } catch (d1Error) {
    logError("getAdminStats (D1)", d1Error);
  }

  try {
    const supabase = await getLegacyServerClient();
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

    const { count: totalPosts, error: countError } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

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
  } catch {
    return { totalPosts: 0, totalViews: 0, avgViews: 0 };
  }
});

// GET ADMIN RECENT POSTS (Includes Drafts)
export const getAdminRecentPosts = cache(async (limit = 5) => {
  try {
    const repo = getRepo();
    const data = await repo.getAdminRecentPosts(limit);
    if (data && data.length > 0) return data;
  } catch (d1Error) {
    logError("getAdminRecentPosts (D1)", d1Error);
  }

  try {
    const supabase = await getLegacyServerClient();
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
  } catch {
    return [];
  }
});

// GET ADMIN TOP POSTS (Trending/Popular Live Posts)
export const getAdminTopPosts = cache(async (limit = 5) => {
  try {
    const repo = getRepo();
    const data = await repo.getAdminTopPosts(limit);
    if (data && data.length > 0) return data;
  } catch (d1Error) {
    logError("getAdminTopPosts (D1)", d1Error);
  }

  try {
    const supabase = await getLegacyServerClient();
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
  } catch {
    return [];
  }
});

// GET EXPERT POSTS
export const getExpertPosts = cache(async (categories, limit = 6) => {
  try {
    const repo = getRepo();
    const data = await repo.getExpertPosts(categories, limit);
    if (data && data.length > 0) return data;
  } catch (d1Error) {
    logError("getExpertPosts (D1)", d1Error);
  }

  try {
    const supabase = await getLegacyServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, slug, category, excerpt, published_at, views, featured_image")
      .in("category", categories)
      .not("title", "is", null)
      .not("slug", "is", null)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      logError("getExpertPosts", error);
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
});
