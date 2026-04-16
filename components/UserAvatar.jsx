"use client";

import { useState } from "react";
import { UserCircle2 } from "lucide-react";

export default function UserAvatar({
  src,
  alt,
  className = "",
  iconClassName = "w-6 h-6",
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <UserCircle2 className={iconClassName} aria-hidden="true" />;
  }

  return (
    // Google profile avatars are tiny external images; native img gives reliable referrer handling and error fallback.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || "User avatar"}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
