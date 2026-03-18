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
