"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SeoMetaBox from "@/components/admin/SeoMetaBox";
import {
  Save,
  Send,
  Plus,
  X,
  Loader2,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { uploadToR2 } from "@/lib/r2/upload";

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Category States
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // SEO & Image States
  const [seoData, setSeoData] = useState({
    seo_title: "",
    seo_desc: "",
    keywords: "",
  });
  const [isCannibalized, setIsCannibalized] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImageFile, setFeaturedImageFile] = useState(null);

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
        setTitle(postData.title || "");
        setSlug(postData.slug || "");
        setContent(postData.content || "");
        setExcerpt(postData.excerpt || "");
        setCategory(postData.category || "General");
        setFeaturedImage(postData.featured_image || null);

        setOriginalUrl(
          `/${(postData.category || "General").toLowerCase()}/${postData.slug}`,
        );

        // Set new SEO data in box
        setSeoData({
          seo_title: postData.seo_title || "",
          seo_desc: postData.seo_desc || "",
          keywords: postData.keywords || "",
        });
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

  // MAIN UPDATE FUNCTION
  const updatePost = async (status) => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and Content are required!");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Your session expired. Please log in again.");
      setIsSubmitting(false);
      router.push("/login");
      return;
    }

    const finalSlug = slug.trim() ? generateSlug(slug) : generateSlug(title);

    // 1. SLUG COLLISION CHECK (Unique URL Validation)
    const { data: existingSlugData } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", finalSlug)
      .neq("id", id)
      .maybeSingle();

    if (existingSlugData) {
      toast.error(
        `Error: The URL slug "${finalSlug}" is already used by another post. Please change it!`,
      );
      setIsSubmitting(false);
      return;
    }

    // 2. HANDLE FEATURED IMAGE UPLOAD
    let finalFeaturedImage = featuredImage;
    if (featuredImageFile) {
      const uploadedUrl = await uploadImageToStorage(featuredImageFile);
      if (uploadedUrl) {
        finalFeaturedImage = uploadedUrl;
      }
    }
    // Agar manually image nahi lagai, toh content ki pehli image utha lo
    if (!finalFeaturedImage || typeof finalFeaturedImage !== "string") {
      finalFeaturedImage = extractFirstImage(content);
    }

    // 3. PREPARE DATA
    const finalExcerpt = excerpt.trim() || generateExcerpt(content);
    const finalCategory = isNewCategory ? newCategoryName : category;

    const postData = {
      title: title.trim(),
      slug: finalSlug,
      content: content,
      excerpt: finalExcerpt,
      category: finalCategory || "General",
      status: status,
      featured_image: finalFeaturedImage,
      updated_at: new Date().toISOString(),
      seo_title: seoData.seo_title.trim(),
      seo_desc: seoData.seo_desc.trim(),
      keywords: seoData.keywords.trim(),
    };

    if (status === "published") {
      postData.published_at = new Date().toISOString();
    }

    // 4. SAVE TO DATABASE
    const { error } = await supabase
      .from("posts")
      .update(postData)
      .eq("id", id);

    // THE REDIRECT LOGIC
    const newUrl = `/${(finalCategory || "General").toLowerCase()}/${finalSlug}`;

    if (originalUrl && originalUrl !== newUrl) {
      await supabase
        .from("redirects")
        .insert([{ old_url: originalUrl, new_url: newUrl }]);
    }

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
        <h1 className="text-3xl font-bold text-zinc-50">Edit Article</h1>
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              if (isCannibalized) {
                e.preventDefault();
                toast.error("Please fix SEO Cannibalization Error first!");
                return;
              }
              updatePost("draft");
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
                toast.error("Please fix SEO Cannibalization Error first!");
                return;
              }
              updatePost("published");
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
            {isCannibalized ? "Fix SEO Error" : "Publish Changes"}
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

        {/* SEO PLUGIN WITH IMAGE UPLOAD */}
        <SeoMetaBox
          seoData={seoData}
          setSeoData={setSeoData}
          defaultTitle={title}
          defaultExcerpt={excerpt.trim() || generateExcerpt(content)}
          content={content}
          postId={id}
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
