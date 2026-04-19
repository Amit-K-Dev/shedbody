"use client";

import { useState } from "react";
import Image from "next/image";

const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==";

export default function ExpertAvatar({
  expert,
  className = "",
  sizes = "56px",
  priority = false,
  ...props
}) {
  const [imageError, setImageError] = useState(false);

  const showImage = expert.image && !imageError;

  return (
    <div
      className={`relative overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-900 ${className}`}
      {...props}
    >
      {showImage ? (
        <Image
          src={expert.image}
          alt={expert.name}
          fill
          className="object-cover transition-opacity duration-500" 
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          onError={() => setImageError(true)}
          quality={80}
        />
      ) : expert.name.charAt(4) === " " ? (
        expert.name.charAt(0).toUpperCase()
      ) : (
        expert.name.charAt(4).toUpperCase()
      )}
    </div>
  );
}