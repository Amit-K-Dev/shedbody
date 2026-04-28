"use client";

import { useEffect, useState } from "react";
import InlineRelatedArticle from "@/components/InlineRelatedArticles";
import ShareArticle from "@/components/ShareArticle";
import SourcesToggle from "@/components/SourcesToggle";

export default function ArticleBodyClient({
  category,
  content,
  headings,
  postUrl,
  relatedPosts,
  slug,
  sourceCount,
  sources,
  title,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="prose prose-invert prose-lg max-w-none">
      {headings && headings.length > 0 && (
        <nav
          aria-label="Article Table of contents"
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8"
        >
          <h2 className="text-lg font-semibold mb-4">In This Article</h2>
          <ul className="space-y-3 text-sm">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  className="block py-1 no-underline font-medium text-emerald-400 hover:text-emerald-300 transition"
                >
                  {heading.text}
                </a>
                {heading.items && heading.items.length > 0 && (
                  <ul className="ml-4 mt-1 space-y-1 border-l border-zinc-800 pl-4">
                    {heading.items.map((subHeading) => (
                      <li key={subHeading.id}>
                        <a
                          href={`#${subHeading.id}`}
                          className="block py-1 no-underline text-zinc-400 hover:text-emerald-300 transition"
                        >
                          {subHeading.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div dangerouslySetInnerHTML={{ __html: content }} />

      <ShareArticle title={title} category={category} slug={slug} url={postUrl} />

      <SourcesToggle count={sourceCount}>
        <ul className="space-y-3 pl-5 text-zinc-300">
          {sources.map((source, i) => (
            <li key={i} className="text-zinc-400 leading-relaxed text-sm">
              <span dangerouslySetInnerHTML={{ __html: source }} />
            </li>
          ))}
        </ul>
      </SourcesToggle>

      <InlineRelatedArticle posts={relatedPosts} />
    </div>
  );
}
