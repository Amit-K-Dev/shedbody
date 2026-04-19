import { formatPostDate } from "@/lib/utils/date";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import TableOfContents from "@/components/TableOfContents";
import ReadingProgress from "@/components/ReadingProgress";
import InlineRelatedArticle from "@/components/InlineRelatedArticles";
import SourcesToggle from "@/components/SourcesToggle";
import ViewTracker from "@/components/ViewTracker";

import { getPost, getRelatedPosts } from "@/lib/posts";
import {
  cleanWordPressContent,
  injectInlineRelated,
  optimizeImages,
} from "@/lib/contentParser";
import Link from "next/link";
import ExpertInline from "@/components/ExpertInline";
import { getExpertForPost } from "@/lib/getExpertForPost";
import { getArticleSchema } from "@/lib/schema";
import ShareArticle from "@/components/ShareArticle";

const BASE_URL = "https://shedbody.com";

export const revalidate = 3600;

// Generate Metadata
export async function generateMetadata({ params }) {
  const { slug, category } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const expert = getExpertForPost(post);
  const postUrl = `/${category.toLowerCase()}/${slug}`;

  // Title Fallback (from h1)
  const safeTitle =
    post.title ||
    post.content
      ?.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .trim() ||
    "ShedBody Article";

  // Excerpt Fallback (from first p tag)
  let safeExcerpt = post.excerpt;
  if (!safeExcerpt || safeExcerpt.trim() === "") {
    const pMatch = post.content?.match(/<p[^>]*>(.*?)<\/p>/i);
    const rawText =
      pMatch && pMatch[1]
        ? pMatch[1]
        : post.content?.substring(0, 160) ||
          "Evidence-based fitness & nutrition guide.";
    safeExcerpt = rawText.replace(/<[^>]+>/g, "").trim();
    if (safeExcerpt.length > 150)
      safeExcerpt = safeExcerpt.substring(0, 150) + "...";
  }

  // Image Fallback (from img src or markdown image)
  let safeImage = post.featured_image || post.image;
  if (!safeImage && post.content) {
    safeImage =
      post.content.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ||
      post.content.match(/!\[.*?\]\((.*?)\)/i)?.[1];
  }
  safeImage = safeImage || `/og-image.png`;

  return {
    title: safeTitle,
    description: safeExcerpt,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: safeTitle,
      description: safeExcerpt,
      url: postUrl,
      siteName: "ShedBody",
      type: "article",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
      authors: expert ? ["ShedBody", expert.name] : ["ShedBody"],
      images: [
        {
          url: safeImage,
          alt: safeTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: safeTitle,
      description: safeExcerpt,
      images: [safeImage],
    },
  };
}

// Calculate Reading Time
function calculateReadingTime(html) {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.trim().split(/\s+/).length;
  const wordPerMinute = 200;
  return Math.ceil(words / wordPerMinute);
}

// Remove SEO Yoast and SEO Rank Math TOC
function removeLegacyTOC(html) {
  return html
    .replace(
      /<div class="[^"]*wp-block-yoast-seo-table-of-contents[^"]*"[\s\S]*?<\/div>/gi,
      "",
    )
    .replace(
      /<div class="[^"]*wp-block-rank-math-toc-block[^"]*"[\s\S]*?<\/div>/gi,
      "",
    )
    .replace(
      /<nav>\s*<ul>([\s\S]*?<a href="#[^"]+">[\s\S]*?<\/a>){2,}[\s\S]*?<\/ul>\s*<\/nav>/gi,
      "",
    );
}

// Generate Clean ID for Headings
function generateHeadingId(text) {
  return text
    .replace(/<[^>]*>/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Extract Headings (TOC)
function extractHeadings(html) {
  const regex = /<h([2-3])[^>]*>(.*?)<\/h\1>/gi;
  const headings = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = match[1];
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    const id = generateHeadingId(text);

    if (level === "2") {
      headings.push({ id, text, level, items: [] });
    } else if (level === "3") {
      if (headings.length > 0 && headings[headings.length - 1].level === "2") {
        headings[headings.length - 1].items.push({ id, text, level });
      } else {
        // Fallback if H3 appears before any H2
        headings.push({ id, text, level, items: [] });
      }
    }
  }
  return headings;
}

// Add Heading IDs (TOC)
function addHeadingIds(html) {
  return html.replace(
    /<h([2-3])([^>]*)>(.*?)<\/h\1>/gi,
    (match, level, attrs, text) => {
      const id = generateHeadingId(text);
      return `<h${level} id="${id}" ${attrs}>${text}</h${level}>`;
    },
  );
}

// Transform Callouts (Pro Tip Block)
function transformCallouts(html) {
  html = html.replace(
    /\[tip\]([\s\S]*?)\[\/tip\]/gi,
    `<div class="callout callout-tip"><div class="callout-title">Pro Tip</div><p>$1</p></div>`,
  );
  html = html.replace(
    /\[key\]([\s\S]*?)\[\/key\]/gi,
    `<div class="callout callout-key"><div class="callout-title">Key Takeaways</div><p>$1</p></div>`,
  );
  return html;
}

// Transform Footnotes
function transformFootnotes(html) {
  let index = 1;
  const footnotes = [];

  const content = html.replace(/\(\((.*?)\)\)/g, (_, text) => {
    footnotes.push(text);
    const number = index++;
    return `
      <sup class="relative group cursor-pointer text-emerald-400">
        <a href="#footnote-${number}" id="ref-${number}">[${number}]</a> 
        <span class="absolute hidden group-hover:block bg-zinc-900 text-gray-300 text-xs p-3 rounded-md shadow-lg w-72 bottom-full mb-2 left-1/2 -translate-x-1/2 z-50">
          ${text}
        </span>  
      </sup>
    `;
  });

  return {
    content: content,
    count: footnotes.length,
    sources: footnotes,
  };
}

export default async function PostPage({ params }) {
  const { slug, category } = await params;

  const post = await getPost(slug);

  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(category, slug);
  const expert = getExpertForPost(post);

  const postDate = formatPostDate(post.updated_at || post.published_at, {
    showUpdatedLabel: true,
    isUpdated: !!post.updated_at,
  });

  // PIPELINES
  let finalContent = cleanWordPressContent(post.content);
  finalContent = removeLegacyTOC(finalContent);
  finalContent = optimizeImages(finalContent);
  finalContent = transformCallouts(finalContent);
  finalContent = injectInlineRelated(finalContent, relatedPosts);

  const footnoteResult = transformFootnotes(finalContent);
  const finalCleanHTML = footnoteResult.content;
  const sourceCount = footnoteResult.count;
  const sources = footnoteResult.sources || [];

  const contentWithIds = addHeadingIds(finalCleanHTML);
  const headings = extractHeadings(contentWithIds);
  const readingTime = calculateReadingTime(contentWithIds);

  // SCHEMA DATA
  const articleSchema = getArticleSchema(post, expert);
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: post.category.charAt(0).toUpperCase() + post.category.slice(1),
        item: `${BASE_URL}/${post.category.toLowerCase()}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${BASE_URL}/${post.category.toLowerCase()}/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <ReadingProgress />

      {articleSchema && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleSchema),
          }}
        />
      )}

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <ViewTracker postId={post.id} />

      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-16">
          <article className="mx-auto w-full">
            {/* Article Hero */}
            <header className="mb-12">
              <Breadcrumbs
                category={post.category}
                title={post.title}
                className="mb-4"
              />

              <div className="flex items-center gap-3 mb-4">
                <Link
                  href={`/${post.category}`}
                  className="text-emerald-500 text-sm font-semibold"
                >
                  <p>
                    {post.category.charAt(0).toUpperCase() +
                      post.category.slice(1)}
                  </p>
                </Link>

                {sourceCount > 0 && (
                  <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded">
                    &#10003; Evidence-Based &bull; {sourceCount} Sources
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-zinc-400 text-lg max-w-2xl mb-4">
                  {post.excerpt}
                </p>
              )}

              <ExpertInline expert={expert} />

              <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-zinc-500">
                <span>{postDate}</span>
                <span>&bull;</span>

                <span>
                  {readingTime} min{readingTime !== 1 ? "s" : ""} read
                </span>
                <span>&bull;</span>

                <span>
                  {post.views || 0} view{post.views !== 1 ? "s" : ""}
                </span>
              </div>
            </header>

            <div className="prose prose-invert prose-lg max-w-none">
              {/* TOC UI */}
              {headings && headings.length > 0 && (
                <nav
                  aria-label="Article Table of contents"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8"
                >
                  <h2 className="text-lg font-semibold mb-4">
                    In This Article
                  </h2>
                  <ul className="space-y-3 text-sm">
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          className="block py-1 no-underline font-medium text-emerald-400 hover:text-emerald-300 transition"
                        >
                          {heading.text}
                        </a>
                        {/* Render Nested H3s */}
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

              {/* Article Content */}
              <div
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
                suppressHydrationWarning
              />

              {/* Share Component */}
              <ShareArticle
                title={post.title}
                category={post.category}
                slug={post.slug}
              />

              {/* Sources Toggle */}
              <SourcesToggle count={sourceCount}>
                <ul className="space-y-3 pl-5 text-zinc-300">
                  {sources.map((source, i) => (
                    <li
                      key={i}
                      className="text-zinc-400 leading-relaxed text-sm"
                    >
                      <span dangerouslySetInnerHTML={{ __html: source }} />
                    </li>
                  ))}
                </ul>
              </SourcesToggle>

              {/* Related Articles */}
              <InlineRelatedArticle posts={relatedPosts} />
            </div>
          </article>

          {/* Sidebar TOC */}
          <TableOfContents
            headings={headings.flatMap((h) => [h, ...(h.items || [])])}
          />
        </div>
      </section>
    </>
  );
}
