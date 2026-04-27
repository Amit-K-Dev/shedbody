"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatPostDate } from "@/lib/utils/date";
import { Dumbbell } from "lucide-react";
import { normalizeImageUrl } from "@/lib/utils/imageUrl";

// SEARCH HIGHLIGHTER
function HighlightedText({ text, query }) {
  if (!query) return <>{text}</>;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={index}
            className="bg-yellow-400 text-black px-1 rounded-sm"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

// FALLBACK EXTRACTORS
function getPostImage(post) {
  if (post.featured_image) return normalizeImageUrl(post.featured_image);

  if (post.content) {
    const htmlImgMatch = post.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (htmlImgMatch && htmlImgMatch[1])
      return normalizeImageUrl(htmlImgMatch[1]);

    const mdImgMatch = post.content.match(/!\[.*?\]\((.*?)\)/i);
    if (mdImgMatch && mdImgMatch[1]) return normalizeImageUrl(mdImgMatch[1]);
  }

  return null;
}

function getPostExcerpt(post) {
  if (post.excerpt && post.excerpt.trim() !== "") return post.excerpt;

  if (post.content) {
    const pMatch = post.content.match(/<p[^>]*>(.*?)<\/p>/i);
    let rawText =
      pMatch && pMatch[1] ? pMatch[1] : post.content.substring(0, 150);

    // Strip HTML
    const cleanText = rawText.replace(/<[^>]+>/g, "").trim();
    return cleanText.length > 120
      ? cleanText.substring(0, 120) + "..."
      : cleanText;
  }
  return "Read this evidence-based article to fuel your fitness journey.";
}

// POST CARD
export default function PostCard({ post, search = "" }) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = getPostImage(post);
  const excerpt = getPostExcerpt(post);
  const showImage = imageUrl && !imageError;

  // Fallback Image based on Category
  const isNutrition = post.category?.toLowerCase() === "nutrition";
  const fallbackBgImage = isNutrition ? "/food-table.jpg" : "/hero-section.jpg";

  return (
    <Link
      href={`/${post.category}/${post.slug}`}
      className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-emerald-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1"
      prefetch={false}
    >
      {/* Image Container */}
      <div className="relative h-48 w-full bg-zinc-950 overflow-hidden">
        {showImage ? (
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          // "Blur + Dumbbell" Fallback Concept
          <div className="relative w-full h-full flex items-center justify-center bg-zinc-900">
            <Image
              src={fallbackBgImage}
              alt="ShedBody Fallback"
              fill
              className="object-cover opacity-50 blur-sm scale-110"
            />
            {/* Overlay Gradient for readability */}
            <div className="absolute inset-0 bg-linear-to-t from-zinc-900 to-transparent"></div>
            {/* Icon overlay */}
            <Dumbbell
              size={40}
              className="relative z-10 text-emerald-500/70 -rotate-45"
            />
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className="bg-zinc-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-zinc-700/50">
            {post.category}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6 flex flex-col grow">
        <h2 className="text-xl font-semibold text-white mb-3 line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
          <HighlightedText text={post.title} query={search} />
        </h2>

        <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-3 grow">
          {excerpt}
        </p>

        {/* Footer (Date & Views) */}
        <p className="flex items-center text-xs font-medium text-zinc-500 mt-auto pt-4 border-t border-zinc-800/50">
          <span>
            {formatPostDate(post.updated_at || post.published_at, {
              showUpdatedLabel: true,
              isUpdated: !!post.updated_at,
            })}
          </span>
          <span className="mx-2 text-zinc-700">&bull;</span>
          <span>
            {post.views || 0} view{post.views !== 1 ? "s" : ""}
          </span>
        </p>
      </div>
    </Link>
  );
}
