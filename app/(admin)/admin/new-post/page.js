"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
  Save,
  Send,
  X,
  Loader2,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import SeoMetaBox from "@/components/admin/SeoMetaBox";
import { createClient } from "@/lib/supabase/client";
import { uploadToR2 } from "@/lib/r2/upload";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [seoData, setSeoData] = useState({
    seo_title: "",
    seo_desc: "",
    keywords: "",
  });
  const [isCannibalized, setIsCannibalized] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImageFile, setFeaturedImageFile] = useState(null);
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
    const pMatch = htmlContent.match(/<p[^>]*>(.*?)<\/p>/i);
    let text = pMatch ? pMatch[1] : htmlContent.replace(/<[^>]*>?/gm, "");
    text = text.replace(/<[^>]+>/g, "").trim();
    return text.substring(0, 160) + (text.length > 160 ? "..." : "");
  };

  // IMAGE UPLOAD HANDLER
  const uploadImageToStorage = async (file) => {
    if (!file) return null;

    if (!file.type?.startsWith("image/")) {
      toast.error("Only image uploads are allowed.");
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Featured image must be under 5 MB.");
      return null;
    }

    try {
      return await uploadToR2(file, "blog");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload featured image.");
      return null;
    }
  };

  // MAIN SAVE FUNCTION
  const savePost = async (status) => {
    if (!title.trim() || !content.trim()) {
      toast.error("Both Title and Content are required!");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const finalSlug = slug.trim() ? generateSlug(slug) : generateSlug(title);

    // 🟢 1. SLUG COLLISION CHECK (Unique URL Validation for NEW post)
    const { data: existingSlugData } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle(); // Yahan '.neq()' ki zaroorat nahi kyunki ye naya post hai

    if (existingSlugData) {
      toast.error(
        `Error: The URL slug "${finalSlug}" is already used by another post. Please change the title or custom slug!`,
      );
      setIsSubmitting(false);
      return;
    }

    // 2. Get current logged-in Admin User
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Your session expired. Please log in again.");
      setIsSubmitting(false);
      router.push("/login");
      return;
    }

    // 3. Handle Featured Image
    let finalFeaturedImage = extractFirstImage(content); // Fallback to content image
    if (featuredImageFile) {
      const uploadedUrl = await uploadImageToStorage(featuredImageFile);
      if (uploadedUrl) {
        finalFeaturedImage = uploadedUrl;
      }
    } else if (
      featuredImage &&
      typeof featuredImage === "string" &&
      featuredImage.startsWith("http")
    ) {
      finalFeaturedImage = featuredImage; // Keep existing if string URL
    }

    // 4. Prepare Data
    const finalExcerpt = excerpt.trim() || generateExcerpt(content);
    const finalCategory = isNewCategory ? newCategoryName : category;

    const postData = {
      title: title.trim(),
      slug: finalSlug, // Safe slug
      content: content,
      excerpt: finalExcerpt,
      category: finalCategory || "General",
      status: status,
      featured_image: finalFeaturedImage,
      author_id: user?.id,
      published_at: status === "published" ? new Date().toISOString() : null,
      views: 0,
      seo_title: seoData.seo_title.trim(),
      seo_desc: seoData.seo_desc.trim(),
      keywords: seoData.keywords.trim(),
      updated_at: new Date().toISOString(),
    };

    // 5. Insert into Supabase
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
        toast.success("Draft saved! You can continue editing.");
        router.push(`/admin/posts/${newPostId}`);
      } else {
        toast.success("Post Published! 🎉");
        router.push("/admin/posts");
      }
    }
  };

  // UI
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
        <h1 className="text-3xl font-bold text-zinc-50">New Article</h1>
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              if (isCannibalized) {
                e.preventDefault();
                toast.error("Please fix SEO Cannibalization Error first!");
                return;
              }
              savePost("draft");
            }}
            disabled={isSubmitting || isCannibalized}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isCannibalized
                ? "bg-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save Draft
          </button>

          <button
            onClick={(e) => {
              if (isCannibalized) {
                e.preventDefault();
                toast.error(
                  "SEO Error: Keyword Cannibalization! Please choose a unique Focus Keyword.",
                  { duration: 4000 },
                );
                return;
              }
              savePost("published");
            }}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition shadow-lg ${
              isCannibalized
                ? "bg-zinc-700 text-zinc-400 opacity-80 cursor-not-allowed"
                : "bg-emerald-600 text-zinc-50 hover:bg-emerald-500 shadow-emerald-500/20"
            }`}
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {isCannibalized ? "Fix SEO Error" : "Publish"}
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

          {/* ADVANCED SEO SLUG EDITOR */}
          <div className="mt-4 px-2 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-500">
                shedbody.com/{category ? category.toLowerCase() : "[category]"}/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={generateSlug(title) || "custom-url-slug"}
                className={`flex-1 bg-transparent border-b border-dashed text-sm focus:outline-none transition pb-1 ${
                  typeof seoData?.keywords === "string" &&
                  seoData.keywords.split(",")[0].trim()
                    ? (slug.trim()
                        ? generateSlug(slug)
                        : generateSlug(title)
                      ).includes(
                        generateSlug(seoData.keywords.split(",")[0].trim()),
                      )
                      ? "border-emerald-500/50 text-emerald-400 focus:border-emerald-500"
                      : "border-amber-500/50 text-amber-400 focus:border-amber-500"
                    : "border-zinc-700 text-zinc-400 focus:border-emerald-500"
                }`}
              />
            </div>

            {/* SAFE TRAFFIC LIGHT FEEDBACK MESSAGE */}
            {(() => {
              const focusKeyword =
                typeof seoData?.keywords === "string"
                  ? seoData.keywords.split(",")[0].trim().toLowerCase()
                  : "";
              if (!focusKeyword) return null;

              const activeSlug = slug.trim()
                ? generateSlug(slug)
                : generateSlug(title);
              const isKeywordInSlug = activeSlug.includes(
                generateSlug(focusKeyword),
              );

              return (
                <p
                  className={`text-xs mt-2 flex items-center gap-1.5 ${isKeywordInSlug ? "text-emerald-500" : "text-amber-500"}`}
                >
                  {isKeywordInSlug ? (
                    <>
                      <CheckCircle2 size={14} /> Great! Focus keyword is in the
                      URL.
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} /> Try including your focus keyword{" "}
                      <strong>&quot;{focusKeyword}&quot;</strong> in the URL
                      slug.
                    </>
                  )}
                </p>
              );
            })()}
          </div>

          {/* Excerpt Section */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-zinc-400">
                Excerpt / Short Description
              </label>
              <span className="text-xs text-zinc-500">
                {excerpt?.length || 0} / 160
              </span>
            </div>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Briefly explain what this article is about..."
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-50 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none text-sm"
            />
          </div>
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

        {/* SEO PLUGIN */}
        <SeoMetaBox
          seoData={seoData}
          setSeoData={setSeoData}
          defaultTitle={title}
          defaultExcerpt={excerpt.trim() || generateExcerpt(content)}
          content={content}
          postId={null}
          onCannibalizeChange={setIsCannibalized}
          featuredImage={featuredImage}
          onImageChange={(data) => {
            setFeaturedImage(data.previewUrl);
            setFeaturedImageFile(data.file);
          }}
        />
      </div>
    </div>
  );
}
