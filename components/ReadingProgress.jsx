"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      if (docHeight > 0) {
        const percent = (scrollTop / docHeight) * 100;
        setProgress(percent);
      } else {
        setProgress(0);
      }
    };

    const onScroll = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateProgress);
    };

    // Performance Boost
    window.addEventListener("scroll", onScroll, { passive: true });

    // Initial check
    updateProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-zinc-900 z-50">
      <div
        className="h-full bg-emerald-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
