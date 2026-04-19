"use client";

import { useState, useEffect } from "react";
import { Link2, Check } from "lucide-react"; // Send nikal diya yahan se

// Saare Custom Icons
import FacebookIcon from "@/components/icons/FacebookIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";
import XIcon from "@/components/icons/XIcon";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

export default function ShareArticle({ title, category, slug }) {
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState("");

  useEffect(() => {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://shedbody.com";
    setFullUrl(`${baseUrl}/${category.toLowerCase()}/${slug}`);
  }, [category, slug]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%0A%0A${encodedUrl}`,
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-7 border-t border-zinc-800/50 my-10">
      <div className="text-center sm:text-left">
        <h3 className="text-base font-bold text-zinc-50 mb-1">
          Share this article
        </h3>
        <p className="text-sm text-zinc-400">
          Help others transform their fitness journey.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* X (Twitter) */}
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on X"
          className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
        >
          <XIcon className="w-5 h-5 fill-current" />
        </a>

        {/* Facebook */}
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on Facebook"
          className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full hover:text-white hover:bg-[#1877F2]/20 hover:border-[#1877F2]/50 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
        >
          <FacebookIcon className="w-5 h-5 fill-current" />
        </a>

        {/* LinkedIn */}
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on LinkedIn"
          className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full hover:text-white hover:bg-[#0A66C2]/20 hover:border-[#0A66C2]/50 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
        >
          <LinkedInIcon className="w-5 h-5 fill-current" />
        </a>

        {/* WhatsApp - Custom Icon Update */}
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on WhatsApp"
          className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full hover:text-white hover:bg-[#25D366]/20 hover:border-[#25D366]/50 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
        >
          <WhatsAppIcon className="w-5 h-5 fill-current" />
        </a>

        {/* Divider */}
        <div className="w-px h-8 bg-zinc-800 mx-1"></div>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          title="Copy Link"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-300 font-medium text-sm ${
            copied
              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
              : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          }`}
        >
          {copied ? (
            <>
              <Check size={18} className="text-emerald-400" />
              Copied!
            </>
          ) : (
            <>
              <Link2 size={18} />
              Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
