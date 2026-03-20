"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed w-10 h-10 bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-black p-3 rounded-full shadow-lg transition"
      aria-label="Back to top"
    >
      <span className="text-lg">&uarr;</span>
    </button>
  );
}
