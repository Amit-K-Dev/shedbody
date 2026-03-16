import { supabase } from "@/lib/supabase";
import { cache } from "react";

// Get Single Post
export const getPost = cache(async (slug) => {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, content, excerpt, category, published_at")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("getPost error:", error);
    return null;
  }

  return data;
});

// Get Related Posts
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

  return data;
});

// Get Posts by Category
export const getPostByCategory = cache(async (category) => {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, published_at, category")
    .eq("category", category)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("category posts error:", error);
    return [];
  }

  return data;
});
