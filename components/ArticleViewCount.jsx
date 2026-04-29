"use client";

import { useCallback, useState } from "react";
import ViewTracker from "@/components/ViewTracker";

export default function ArticleViewCount({ postId, initialViews }) {
  const [views, setViews] = useState(Number(initialViews || 0));

  const handleCounted = useCallback((nextViews) => {
    setViews((current) => {
      if (Number.isFinite(Number(nextViews))) {
        return Math.max(current, Number(nextViews));
      }

      return current + 1;
    });
  }, []);

  return (
    <>
      <ViewTracker postId={postId} onCounted={handleCounted} />
      <span suppressHydrationWarning>
        {views} view{views !== 1 ? "s" : ""}
      </span>
    </>
  );
}
