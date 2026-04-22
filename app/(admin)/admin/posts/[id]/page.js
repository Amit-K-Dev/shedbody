"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Save, Send, Plus, X, Loader2, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Category States
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsFetching(true);
      const supabase = createClient();

      // Fetch Categories
      const { data: catData } = await supabase
        .from("posts")
        .select("category")
        .not("category", "is", null);

      if (catData) {
        const uniqueCategories = [...new Set(catData.map((p) => p.category))];
        setCategories(uniqueCategories);
      }

      // Fetch Post Details
      const { data: postData, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (postData && !error) {
        setTitle(postData.title);
        setContent(postData.content);
        setCategory(postData.category || "General");
      } else {
        toast.error("Error loading post! Redirecting...");
        router.push("/admin/posts");
      }

      setIsFetching(false);
    };

    fetchData();
  }, [id, router]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "NEW_CATEGORY_TRIGGER") {
      setIsNewCategory(true);
      setCategory("");
    } else {
      setCategory(value);
      setIsNewCategory(false);
    }
  };

  // HELPER FUNCTIONS
  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const extractFirstImage = (htmlContent) => {
    const match = htmlContent.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
  };

  const generateExcerpt = (htmlContent) => {
    const text = htmlContent.replace(/<[^>]*>?/gm, "");
    return text.substring(0, 150) + (text.length > 150 ? "..." : "");
  };

  // MAIN UPDATE FUNCTION
  const updatePost = async (status) => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and Content are required!");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    const finalCategory = isNewCategory ? newCategoryName : category;

    const postData = {
      title,
      slug: generateSlug(title),
      content,
      excerpt: generateExcerpt(content),
      category: finalCategory || "General",
      status: status,
      featured_image: extractFirstImage(content),
      updated_at: new Date().toISOString(),
    };

    if (status === "published") {
      postData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("posts")
      .update(postData)
      .eq("id", id);

    setIsSubmitting(false);

    if (error) {
      console.error("🔴 Supabase Update Error:", error);
      toast.error("Post not updated: " + error.message);
    } else {
      toast.success(`Post successfully updated as ${status}! 🎉`);
      if (status === "published") {
        router.push("/admin/posts");
      }
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-400">
        <Loader2 size={40} className="animate-spin mb-4 text-emerald-500" />
        <p className="font-medium">Loading your masterpiece...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Back Button */}
      <Link
        href="/admin/posts"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-emerald-400 font-medium mb-6 transition"
      >
        <ChevronLeft size={18} /> Back to All Posts
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-zinc-50">Edit Article</h1>
        <div className="flex gap-3">
          <button
            onClick={() => updatePost("draft")}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save Draft
          </button>
          <button
            onClick={() => updatePost("published")}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-zinc-50 hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            Publish Changes
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Article Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        {/* Dynamic Category Section */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Category
          </label>

          {!isNewCategory ? (
            <select
              value={category}
              onChange={handleCategoryChange}
              className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
              {categories.length === 0 && (
                <option value="General">General</option>
              )}
              <option disabled>──────────</option>
              <option
                value="NEW_CATEGORY_TRIGGER"
                className="text-emerald-400 font-semibold"
              >
                ➕ Create New Category
              </option>
            </select>
          ) : (
            <div className="flex items-center gap-3 max-w-sm">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Type new category..."
                className="flex-1 bg-zinc-900 border border-emerald-500/50 rounded-lg p-3 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              <button
                onClick={() => setIsNewCategory(false)}
                className="p-3 bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {/* The Magic Editor */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Article Content
          </label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}
