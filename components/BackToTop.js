"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

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
      className="fixed bottom-5 right-5 z-50 bg-green-500 hover:scale-110 text-black p-3 rounded-full shadow-lg flex items-center justify-center transition"
      aria-label="Back to top"
    >
<<<<<<< HEAD
      <ArrowUp size={20} />
=======
      <span className="text-lg">↑</span>
>>>>>>> c2013835cc5091347bc771a59be80fdbac663b6d
    </button>
  );
}
