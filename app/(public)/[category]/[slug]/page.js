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

const BASE_URL = "https://shedbody.com";

export const revalidate = 3600;

// Generate Metadata
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/${post.category}/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: `${BASE_URL}/${post.category}/${post.slug}/og-image`,
          width: 1200,
          height: 630,
        },
      ],
      type: "article",
      siteName: "ShedBody",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
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

// Extract Headings (TOC)
function extractHeadings(html) {
  const regex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi;
  const headings = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = match[1];
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ id, text, level });
  }
  return headings;
}

// Add Heading IDs (TOC)
function addHeadingIds(html) {
  return html.replace(
    /<h([2-3])([^>]*)>(.*?)<\/h[2-3]>/gi,
    (match, level, attrs, text) => {
      const id = text
        .replace(/<[^>]*>/g, "")
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-");
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
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [`${BASE_URL}/${post.category}/${post.slug}/og-image.jpg`],
    author: expert
      ? {
          "@type": "Person",
          name: expert.name,
          jobTitle: expert.role,
          description: expert.specialty,
        }
      : {
          "@type": "Organization",
          name: "ShedBody",
        },
    reviewedBy: expert
      ? {
          "@type": "Person",
          name: expert.name,
          jobTitle: expert.role,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "ShedBody",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    articleSection: post.category,
    about: {
      "@type": "Thing",
      name: post.category,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/${post.category}/${post.slug}`,
    },
    wordCount: post.content.replace(/<[^>]*>/g, "").split(/\s+/).length,
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
                  <ul className="space-y-2 text-sm">
                    {headings.map((heading) => (
                      <li
                        key={heading.id}
                        className={
                          heading.level !== "2" ? "ml-4 text-zinc-400" : ""
                        }
                      >
                        <a
                          href={`#${heading.id}`}
                          className="block py-1 no-underline text-emerald-400 hover:text-emerald-300 transition"
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              {/* Article Content */}
              <div dangerouslySetInnerHTML={{ __html: contentWithIds }} />

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
          <TableOfContents headings={headings} />
        </div>
      </section>
    </>
  );
}
