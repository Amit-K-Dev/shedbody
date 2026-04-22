"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Save, Send, Plus, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category States
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("posts")
        .select("category")
        .not("category", "is", null);

      if (data && !error) {
        const uniqueCategories = [...new Set(data.map((p) => p.category))];
        setCategories(uniqueCategories);
        if (uniqueCategories.length > 0) {
          setCategory(uniqueCategories[0]);
        } else {
          setCategory("General");
        }
      }
    };
    fetchCategories();
  }, []);

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

  // MAIN SAVE FUNCTION
  const savePost = async (status) => {
    if (!title.trim() || !content.trim()) {
      toast.error("Both Title and Content are required!");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    // 1. Get current logged-in Admin User
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 2. Prepare Data
    const finalCategory = isNewCategory ? newCategoryName : category;
    const slug = generateSlug(title);
    const excerpt = generateExcerpt(content);
    const featuredImage = extractFirstImage(content);

    const postData = {
      title,
      slug,
      content,
      excerpt,
      category: finalCategory || "General",
      status: status,
      featured_image: featuredImage,
      author_id: user?.id,
      published_at: status === "published" ? new Date().toISOString() : null,
      views: 0,
    };

    // 3. Insert into Supabase
    const { data, error } = await supabase
      .from("posts")
      .insert([postData])
      .select();

    setIsSubmitting(false);

    if (error) {
      toast.error("Post saving error: " + error.message);
    } else {
      const newPostId = data[0].id;

      if (status === "draft") {
        // Stay on page but move to edit mode
        toast.success("Draft saved! You can continue editing.");
        router.push(`/admin/posts/${newPostId}`);
      } else {
        toast.success("Post Published! 🎉");
        router.push("/admin/posts");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-zinc-50">New Article</h1>
        <div className="flex gap-3">
          <button
            onClick={() => savePost("draft")}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save
          </button>
          <button
            onClick={() => savePost("published")}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-zinc-50 hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            Publish
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Post Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., 5 Yoga Poses for Absolute Beginners"
            className="w-full text-2xl bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-50 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
                title="Cancel"
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
