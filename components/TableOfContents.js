"use client";

import { useEffect, useState } from "react";

export default function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -55% 0px",
      },
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 border border-zinc-800 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400 mb-4">
          On this page
        </h3>

        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={heading.level !== "2" ? "ml-4 text-zinc-400" : ""}
            >
              <a
                href={`#${heading.id}`}
                className={`block border-1-2 pl-3 transition ${activeId === heading.id ? "border-green-500 text-green-400 font-medium" : "border-transparent text-zinc-400 hover:text-green-400"}`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
