"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Globe,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";

// Helper: Regex escape for accurate keyword matching
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function SeoMetaBox({
  seoData,
  setSeoData,
  defaultTitle,
  defaultExcerpt,
  content,
  postId,
  onCannibalizeChange,
  featuredImage,
  onImageChange,
}) {
  const [previewMode, setPreviewMode] = useState("desktop");
  const [focusKw, setFocusKw] = useState("");
  const [synKw, setSynKw] = useState("");
  const [relKw, setRelKw] = useState("");
  const [existingPosts, setExistingPosts] = useState([]);

  // Image input reference
  const imageInputRef = useRef(null);

  // Fetch all existing posts to check for cannibalization
  useEffect(() => {
    async function fetchAllPosts() {
      try {
        const res = await fetch("/search-index");
        const contentType = res.headers.get("content-type") || "";

        if (!res.ok || !contentType.includes("application/json")) {
          console.warn("Failed to fetch posts for SEO check", {
            status: res.status,
            contentType,
          });
          return;
        }

        const data = await res.json();
        if (data.success && data.data) {
          setExistingPosts(data.data);
        }
      } catch (err) {
        console.warn("Failed to fetch posts for SEO check", err);
      }
    }
    fetchAllPosts();
  }, []);

  // Initialize keywords from database
  useEffect(() => {
    if (seoData.keywords && !focusKw && !synKw && !relKw) {
      let arr = [];
      if (typeof seoData.keywords === "string") {
        arr = seoData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);
      } else if (Array.isArray(seoData.keywords)) {
        arr = seoData.keywords
          .map((k) => (typeof k === "string" ? k.trim() : ""))
          .filter(Boolean);
      }
      // Values set karna
      if (arr.length > 0) setFocusKw(arr[0]);
      if (arr.length > 1) setSynKw(arr.slice(1, 3).join(", "));
      if (arr.length > 3) setRelKw(arr.slice(3, 7).join(", "));
    }
  }, [seoData.keywords]);

  useEffect(() => {
    const arr = [
      focusKw.trim(),
      ...synKw
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      ...relKw
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    ].filter(Boolean);

    const newKeywordsString = arr.join(", ");
    if (seoData.keywords !== newKeywordsString) {
      setSeoData((prev) => ({ ...prev, keywords: newKeywordsString }));
    }
  }, [focusKw, synKw, relKw, setSeoData, seoData.keywords]);

  const displayTitle =
    seoData.seo_title ||
    defaultTitle ||
    "Your Awesome Article Title Will Appear Here";
  const displayDesc =
    seoData.seo_desc ||
    defaultExcerpt ||
    "This is how your article's meta description will look in Google search results.";

  // 🟢 SAFE CANNIBALIZATION CHECKER
  const cannibalizedPost = useMemo(() => {
    const focus = focusKw.trim().toLowerCase();
    if (!focus || existingPosts.length === 0) return null;

    return existingPosts.find((p) => {
      if (postId && p.id === postId) return false;
      if (!postId && p.title === defaultTitle) return false;
      if (!p.keywords) return false;

      let otherPostFocus = "";
      if (typeof p.keywords === "string") {
        otherPostFocus = p.keywords.split(",")[0].trim().toLowerCase();
      } else if (Array.isArray(p.keywords) && p.keywords.length > 0) {
        otherPostFocus =
          typeof p.keywords[0] === "string"
            ? p.keywords[0].trim().toLowerCase()
            : "";
      }
      return otherPostFocus === focus;
    });
  }, [focusKw, existingPosts, postId, defaultTitle]);

  // SEND SIGNAL TO PARENT IF CANNIBALIZED
  useEffect(() => {
    if (onCannibalizeChange) {
      onCannibalizeChange(!!cannibalizedPost);
    }
  }, [cannibalizedPost, onCannibalizeChange]);

  // THE SEO ANALYSIS ENGINE
  const analysis = useMemo(() => {
    const results = [];
    const focus = focusKw.trim().toLowerCase();

    if (!focus) {
      return [
        {
          status: "red",
          text: "Set a Focus Keyword to unlock full content analysis.",
        },
      ];
    }

    const plainText = (content || "")
      .replace(/<[^>]*>?/gm, " ")
      .replace(/\s+/g, " ")
      .trim();
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const plainTextLower = plainText.toLowerCase();

    // 1 & 2. Length Check
    if (wordCount < 300) {
      results.push({
        status: "red",
        text: `Content length is ${wordCount} words. Minimum 600 words recommended for SEO.`,
      });
    } else if (wordCount < 600) {
      results.push({
        status: "yellow",
        text: `Content length is ${wordCount} words. Aim for 600-900+ words for better ranking.`,
      });
    } else {
      results.push({
        status: "green",
        text: `Content length is ${wordCount} words. Excellent!`,
      });
    }

    // 3. Title Check
    const titleLower = displayTitle.toLowerCase();
    const kwIndexInTitle = titleLower.indexOf(focus);
    if (kwIndexInTitle === -1) {
      results.push({
        status: "red",
        text: "Focus keyword is missing from the SEO Title.",
      });
    } else if (kwIndexInTitle > 15) {
      results.push({
        status: "yellow",
        text: "Focus keyword found in Title, but try moving it to the beginning.",
      });
    } else {
      results.push({
        status: "green",
        text: "Focus keyword appears at the beginning of the SEO Title. Perfect!",
      });
    }

    // 4. Description Check
    if (!displayDesc.toLowerCase().includes(focus)) {
      results.push({
        status: "red",
        text: "Focus keyword is missing from the Meta Description / Excerpt.",
      });
    } else {
      results.push({
        status: "green",
        text: "Focus keyword found in the Meta Description.",
      });
    }

    // 5. First 140 Chars Check
    const first140Chars = plainTextLower.substring(0, 140);
    if (!first140Chars.includes(focus)) {
      results.push({
        status: "red",
        text: "Focus keyword does not appear in the first 140 characters of the content.",
      });
    } else {
      results.push({
        status: "green",
        text: "Focus keyword appears early in the content (first 140 characters).",
      });
    }

    // 6. Density Check
    const focusWordCount = focus.split(" ").length;
    const focusRegex = new RegExp(`\\b${escapeRegExp(focus)}\\b`, "gi");
    const kwMatches = plainText.match(focusRegex);
    const kwOccurrences = kwMatches ? kwMatches.length : 0;
    const density =
      wordCount > 0 ? ((kwOccurrences * focusWordCount) / wordCount) * 100 : 0;

    if (kwOccurrences === 0) {
      results.push({
        status: "red",
        text: "Focus keyword is completely missing from the main content.",
      });
    } else if (density < 0.5) {
      results.push({
        status: "yellow",
        text: `Keyword density is ${density.toFixed(2)}% (${kwOccurrences} times). Try using it a bit more.`,
      });
    } else if (density > 2.5) {
      results.push({
        status: "red",
        text: `Keyword density is too high (${density.toFixed(2)}%). This looks like keyword stuffing!`,
      });
    } else {
      results.push({
        status: "green",
        text: `Keyword density is optimal at ${density.toFixed(2)}% (${kwOccurrences} times).`,
      });
    }

    // 7. LSI (Synonyms & Related) Check
    const extraKws = [...synKw.split(","), ...relKw.split(",")]
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    if (extraKws.length > 0) {
      let foundExtraCount = 0;
      extraKws.forEach((kw) => {
        if (plainTextLower.includes(kw)) foundExtraCount++;
      });
      if (foundExtraCount === 0) {
        results.push({
          status: "yellow",
          text: "None of your synonyms or related keywords are used in the content.",
        });
      } else {
        results.push({
          status: "green",
          text: `Good! Found ${foundExtraCount} out of ${extraKws.length} related keywords in the content.`,
        });
      }
    }

    // 8. THE SMART H2/H3 SUBHEADING CHECK
    const primaryKws = [
      focus,
      ...synKw
        .split(",")
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean),
    ];
    const headingRegex = /<h([2-3])[^>]*>(.*?)<\/h\1>/gi;
    const headings = [];
    let match;

    while ((match = headingRegex.exec(content || "")) !== null) {
      const headingText = match[2]
        .replace(/<[^>]*>?/gm, "")
        .toLowerCase()
        .trim();
      if (headingText) headings.push(headingText);
    }

    if (headings.length === 0) {
      if (wordCount > 300) {
        results.push({
          status: "yellow",
          text: "No H2/H3 subheadings found. Break your content into sections.",
        });
      }
    } else {
      let headingsWithKw = 0;
      headings.forEach((h) => {
        if (primaryKws.some((kw) => h.includes(kw))) headingsWithKw++;
      });

      if (headingsWithKw === 0) {
        results.push({
          status: "yellow",
          text: `You have ${headings.length} H2/H3 headings, but none contain your focus keyword or synonyms.`,
        });
      } else if (headings.length > 2 && headingsWithKw === headings.length) {
        results.push({
          status: "yellow",
          text: `Over-optimized! Your target keyword is in EVERY H2/H3 heading. Keep it natural.`,
        });
      } else {
        results.push({
          status: "green",
          text: `Great structure! Focus/synonym keyword appears naturally in ${headingsWithKw} out of ${headings.length} H2/H3 subheadings.`,
        });
      }
    }

    // 9. Image SEO Check (Using featured image as well)
    const imgRegex = /<img[^>]+alt=["']([^"']*)["'][^>]*>/gi;
    const imgAlts = [];
    let imgMatch;
    while ((imgMatch = imgRegex.exec(content || "")) !== null) {
      imgAlts.push(imgMatch[1] ? imgMatch[1].toLowerCase().trim() : "");
    }
    const imgCount = imgAlts.length + (featuredImage ? 1 : 0);

    if (imgCount === 0) {
      results.push({
        status: "red",
        text: "No images found. Add a featured image or content image.",
      });
    } else {
      const hasPrimaryKw = imgAlts.some((alt) =>
        primaryKws.some((kw) => alt.includes(kw)),
      );
      if (!hasPrimaryKw && imgAlts.length > 0) {
        results.push({
          status: "red",
          text: `None of your content images have your Focus Keyword or Synonyms in the 'alt' tag.`,
        });
      } else {
        results.push({
          status: "green",
          text: `Image SEO optimized!`,
        });
      }
    }

    // 10. LINK & ANCHOR TEXT CHECK
    const linkRegex = /<a[^>]+href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi;
    const links = [];
    let linkMatch;

    let anchorTextViolation = false;
    let violatedKeyword = "";

    while ((linkMatch = linkRegex.exec(content || "")) !== null) {
      const url = linkMatch[1];
      const anchorHTML = linkMatch[2];
      const anchorText = anchorHTML
        .replace(/<[^>]*>?/gm, "")
        .toLowerCase()
        .trim();

      links.push(url);

      if (!anchorTextViolation) {
        const matchedKw = primaryKws.find((kw) => anchorText.includes(kw));
        if (matchedKw) {
          anchorTextViolation = true;
          violatedKeyword = matchedKw;
        }
      }
    }

    const internalLinks = links.filter(
      (url) =>
        url.includes("shedbody.com") ||
        url.startsWith("/") ||
        url.startsWith("#"),
    );
    const externalLinks = links.filter(
      (url) => url.startsWith("http") && !url.includes("shedbody.com"),
    );

    if (anchorTextViolation) {
      results.push({
        status: "red",
        text: `CRITICAL: You used your target keyword ("${violatedKeyword}") as a link. Never link your focus/synonym keywords to other pages.`,
      });
    } else if (links.length > 0) {
      results.push({
        status: "green",
        text: "Anchor texts are safe. No target keywords linked away.",
      });
    }

    if (internalLinks.length === 0) {
      results.push({
        status: "red",
        text: "No internal links found. Link to other ShedBody posts.",
      });
    } else {
      results.push({
        status: "green",
        text: `Good job! You have ${internalLinks.length} internal links.`,
      });
    }

    if (externalLinks.length === 0) {
      results.push({
        status: "yellow",
        text: "Adding 1-2 external authority links improves credibility.",
      });
    } else {
      results.push({
        status: "green",
        text: `Found ${externalLinks.length} external link(s). Good for research authority.`,
      });
    }

    const totalLinks = links.length;
    const linkDensity = wordCount > 0 ? (totalLinks / wordCount) * 100 : 0;

    if (linkDensity > 3) {
      results.push({
        status: "red",
        text: `Too many links (${totalLinks}). Your link density is high (${linkDensity.toFixed(1)}%). This might look like spam to Google.`,
      });
    }

    // 11. CANNIBALIZATION CHECK OUTPUT
    if (cannibalizedPost) {
      results.push({
        status: "red",
        text: `CRITICAL: Keyword Cannibalization! The focus keyword "${focusKw}" is already used in: "${cannibalizedPost.title}". Please change it.`,
      });
    } else if (focus) {
      results.push({
        status: "green",
        text: "Focus keyword is unique. You haven't used it as a primary keyword on any other page.",
      });
    }

    return results;
  }, [
    focusKw,
    synKw,
    relKw,
    content,
    displayTitle,
    displayDesc,
    cannibalizedPost,
    featuredImage,
  ]);

  // STRICT VALIDATION LOGIC FOR UI COUNTERS & ERRORS
  const synCount =
    typeof synKw === "string"
      ? synKw
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean).length
      : 0;
  const relCount =
    typeof relKw === "string"
      ? relKw
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean).length
      : 0;

  const isSynError = synCount > 2;
  const isRelError = relCount > 4;

  const StatusIcon = ({ status }) => {
    if (status === "green")
      return (
        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
      );
    if (status === "yellow")
      return (
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
      );
    return <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />;
  };

  // Image Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageChange) {
      // Create a temporary local URL for preview
      const previewUrl = URL.createObjectURL(file);
      onImageChange({ file, previewUrl });
    }
  };

  return (
    <div
      className={`bg-zinc-900 border rounded-xl overflow-hidden mt-8 shadow-xl transition-colors ${cannibalizedPost ? "border-red-500/50 shadow-red-500/10" : "border-zinc-800"}`}
    >
      <div className="bg-zinc-950/50 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search
            size={20}
            className={cannibalizedPost ? "text-red-500" : "text-emerald-500"}
          />
          <h2
            className={`text-lg font-bold ${cannibalizedPost ? "text-red-400" : "text-zinc-100"}`}
          >
            {cannibalizedPost ? "⚠️ SEO Keyword Error" : "Advanced SEO Engine"}
          </h2>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* LEFT: Inputs */}
        <div className="space-y-6">
          {/* Keyword Strategy Box */}
          <div
            className={`space-y-4 p-5 rounded-xl border ${cannibalizedPost ? "bg-red-500/5 border-red-500/30" : "bg-zinc-950/50 border-zinc-800"}`}
          >
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Keyword Strategy
            </h3>

            {/* Primary Focus Keyword */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Primary Focus Keyword
              </label>
              <input
                type="text"
                value={focusKw}
                onChange={(e) => setFocusKw(e.target.value)}
                placeholder="e.g., knee to chest stretch"
                className={`w-full bg-zinc-900 border rounded-lg p-2.5 text-sm text-zinc-50 focus:outline-none transition ${cannibalizedPost ? "border-red-500 focus:ring-1 focus:ring-red-500" : "border-zinc-800 focus:border-emerald-500/50"}`}
              />
              {cannibalizedPost && (
                <p className="text-xs text-red-400 mt-1.5 font-medium animate-in slide-in-from-top-1 flex items-center gap-1">
                  <AlertCircle size={12} /> This keyword is used in: "
                  {cannibalizedPost.title}"
                </p>
              )}
            </div>

            {/* Synonyms (WITH COUNTER & VALIDATION) */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-medium text-zinc-400">
                  Synonyms (Max 2)
                </label>
                <span
                  className={`text-xs font-bold ${isSynError ? "text-red-500" : "text-emerald-500"}`}
                >
                  {synCount}/2
                </span>
              </div>
              <input
                type="text"
                value={synKw}
                onChange={(e) => setSynKw(e.target.value)}
                placeholder="e.g., apanasana, wind relieving pose"
                className={`w-full bg-zinc-900 border rounded-lg p-2.5 text-sm text-zinc-50 focus:outline-none transition-colors ${isSynError ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-zinc-800 focus:border-emerald-500/50"}`}
              />
              {isSynError && (
                <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1">
                  Remove {synCount - 2} synonym(s) to fix this error.
                </p>
              )}
            </div>

            {/* Related Keywords (WITH COUNTER & VALIDATION) */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-medium text-zinc-400">
                  Related Keywords (Max 4)
                </label>
                <span
                  className={`text-xs font-bold ${isRelError ? "text-red-500" : "text-emerald-500"}`}
                >
                  {relCount}/4
                </span>
              </div>
              <input
                type="text"
                value={relKw}
                onChange={(e) => setRelKw(e.target.value)}
                placeholder="e.g., back pain stretch, morning routine"
                className={`w-full bg-zinc-900 border rounded-lg p-2.5 text-sm text-zinc-50 focus:outline-none transition-colors ${isRelError ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-zinc-800 focus:border-emerald-500/50"}`}
              />
              {isRelError && (
                <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1">
                  Remove {relCount - 4} related keyword(s) to fix this error.
                </p>
              )}
            </div>
          </div>

          {/* Title & Desc Boxes */}
          <div>
            <label className="text-sm font-medium text-zinc-400">
              SEO Title
            </label>
            <input
              type="text"
              value={seoData.seo_title || ""}
              onChange={(e) =>
                setSeoData({ ...seoData, seo_title: e.target.value })
              }
              placeholder="Leave empty to use article title"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-50 mt-1 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-400">
              Meta Description
            </label>
            <textarea
              value={seoData.seo_desc || ""}
              onChange={(e) =>
                setSeoData({ ...seoData, seo_desc: e.target.value })
              }
              rows={3}
              placeholder="Write a compelling description..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-50 mt-1 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
        </div>

        {/* RIGHT: Live Preview, Image & Content Analysis */}
        <div className="space-y-6">
          {/* FEATURED IMAGE BLOCK */}
          <div className="bg-zinc-950/50 p-5 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={16} className="text-emerald-500" /> Featured
                Image
              </h3>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={imageInputRef}
                onChange={handleImageUpload}
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                className="text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md transition flex items-center gap-1.5 border border-zinc-700"
              >
                <UploadCloud size={14} /> {featuredImage ? "Replace" : "Upload"}
              </button>
            </div>

            {featuredImage ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-zinc-800 group">
                <Image
                  src={featuredImage.previewUrl || featuredImage}
                  alt="Featured Preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => imageInputRef.current?.click()}
                className="w-full aspect-video rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition cursor-pointer"
              >
                <ImageIcon size={32} className="mb-2 opacity-50" />
                <span className="text-sm font-medium">
                  Click to upload image
                </span>
                <span className="text-xs mt-1 opacity-70">
                  Recommended: 1200x630px
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-400">
              Google Snippet Preview
            </span>
            <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800">
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`p-1.5 rounded-md transition ${previewMode === "mobile" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                <Smartphone size={16} />
              </button>
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`p-1.5 rounded-md transition ${previewMode === "desktop" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                <Globe size={16} />
              </button>
            </div>
          </div>

          {/* Preview Box */}
          <div
            className={`bg-white p-5 shadow-inner ${previewMode === "mobile" ? "rounded-3xl max-w-[320px] mx-auto border-4 border-zinc-300" : "rounded-lg"}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-bold text-zinc-500">
                SB
              </div>
              <div>
                <p className="text-[#202124] text-[14px] leading-tight font-sans">
                  ShedBody
                </p>
                <p className="text-[#4d5156] text-[12px] leading-tight font-sans">
                  https://shedbody.com › article
                </p>
              </div>
            </div>
            <h3 className="text-[#1a0dab] text-[20px] font-sans hover:underline cursor-pointer leading-snug truncate mb-1">
              {displayTitle}
            </h3>
            <p className="text-[#4d5156] text-[14px] font-sans leading-snug line-clamp-2">
              {displayDesc}
            </p>
          </div>

          {/* REAL-TIME CONTENT ANALYSIS LIST */}
          <div className="bg-zinc-950/80 rounded-xl p-5 border border-zinc-800/80">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Info size={14} className="text-emerald-500" /> Page SEO
                Analysis
              </h4>
              <span className="text-xs font-bold px-2 py-1 bg-zinc-900 rounded-md border border-zinc-800 text-zinc-300">
                Score: {analysis.filter((a) => a.status === "green").length}/
                {analysis.length}
              </span>
            </div>
            <ul className="space-y-3">
              {analysis.map((item, idx) => (
                <li
                  key={idx}
                  className={`flex items-start gap-2.5 bg-zinc-900/50 p-2.5 rounded-lg border ${item.status === "red" && item.text.includes("Cannibalization") ? "border-red-500/50 bg-red-500/10" : "border-zinc-800/30"}`}
                >
                  <StatusIcon status={item.status} />
                  <p
                    className={`text-sm leading-snug ${item.status === "red" && item.text.includes("Cannibalization") ? "text-red-200 font-medium" : "text-zinc-300"}`}
                  >
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
