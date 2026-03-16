"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      const percent = (scrollTop / docHeight) * 100;

      setProgress(percent);
    };

    window.addEventListener("scroll", updateProgress);

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-0.75 bg-zinc-800 z-50">
      <div
        className="h-full bg-green-500 transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
