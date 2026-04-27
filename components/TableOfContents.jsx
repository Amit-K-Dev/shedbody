"use client";

import { useEffect, useState } from "react";

export default function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (!headings || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
      },
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (!headings || headings.length === 0) return null;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 rounded-xl border border-zinc-800 p-6 bg-zinc-900/50 backdrop-blur-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-5">
          On this page
        </h3>

        <ul className="space-y-3 text-sm">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;

            return (
              <li
                key={heading.id}
                className={heading.level !== "2" ? "ml-4" : ""}
              >
                <a
                  href={`#${heading.id}`}
                  className={`block border-l-2 pl-4 py-1 transition-colors duration-200 ${
                    isActive
                      ? "border-emerald-500 text-emerald-400 font-medium"
                      : "border-transparent text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
