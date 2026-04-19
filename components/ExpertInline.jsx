"use client";

import { useState } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

// Helper Function
function getInitials(name) {
  if (!name) return "E";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export default function ExpertInline({ expert }) {
  const [imageError, setImageError] = useState(false);

  if (!expert) return null;

  const showImage = expert.image && !imageError;

  return (
    <div className="flex items-center gap-4 py-2 mt-4 mb-2">
      {/* Avatar Container with Link to Expert Profile */}
      <Link 
        href={`/experts/${expert.id}`} 
        className="shrink-0 block hover:scale-105 transition-transform duration-300"
        title={`View ${expert.name}'s Profile`}
      >
        <div className="w-12 h-12 relative overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-900 font-bold shadow-lg shadow-emerald-500/20">
          {showImage ? (
            <Image
              src={expert.image}
              alt={expert.name}
              fill
              className="object-cover"
              sizes="48px"
              onError={() => setImageError(true)}
            />
          ) : (
            getInitials(expert.name)
          )}
        </div>
      </Link>

      {/* Expert Info */}
      <div className="text-sm leading-snug">
        <p className="text-zinc-200 font-medium flex items-center gap-1.5 mb-0.5">
          <Link
            href="/scientific-review-board"
            className="underline decoration-zinc-600 underline-offset-4 hover:text-emerald-400 hover:decoration-emerald-400 transition-colors"
            title="Learn about our Scientific Review Board"
          >
            Reviewed
          </Link>{" "}
          by{" "}
          <Link
            href={`/experts/${expert.id}`}
            className="underline decoration-zinc-600 underline-offset-4 hover:text-emerald-400 transition-colors font-semibold"
            title={`View ${expert.name}'s Profile`}
          >
            {expert.name}
          </Link>
          <ShieldCheck
            size={16}
            className="text-emerald-400"
            aria-label="Verified Expert"
          />
        </p>

        <p className="text-zinc-400">
          {expert.role} {expert.degree ? `• ${expert.degree}` : ""}
        </p>

        <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1.5">
          Written by ShedBody Team • 
          <Link 
            href="/editorial-process"
            className="hover:text-zinc-300 underline decoration-zinc-700 underline-offset-2 transition-colors"
          >
            Editorial Process
          </Link>
        </p>
      </div>
    </div>
  );
}