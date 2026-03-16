import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import TableOfContents from "@/components/TableOfContents";
import ReadingProgress from "@/components/ReadingProgress";
import InlineRelatedArticle from "@/components/InlineRelatedArticles";
import SourcesToggle from "@/components/SourcesToggle";
import { getPost, getRelatedPosts } from "@/lib/posts";
import {
  cleanWordPressContent,
  injectInlineRelated,
  optimizeImages,
} from "@/lib/contentParser";
import Link from "next/link";

// Generate Metadata
export async function generateMetadata({ params }) {
  const { slug, category } = await params;

  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt")
    .eq("category", category)
    .eq("slug", slug)
    .single();

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,

    openGraph: {
      title: post.title,
      description: post.excerpt,

      image: [
        {
          url: `https://shedbody.vercel.app/${post.category}/${post.slug}/opengraph-image`,
          width: 1200,
          height: 630,
        },
      ],

      type: "article",
      siteName: "ShedBody",
    },
  };
}

// Calculate Reading Time
function calculateReadingTime(html) {
  const text = html.replace(/<[^>]*>/g, ""); // remove HTML tags
  const words = text.trim().split(/\s+/).length;
  const wordPerMinute = 200;
  const minutes = Math.ceil(words / wordPerMinute);
  return minutes;
}

// Remove SEO Yoast and SEO Rank Math TOC
function cleanContent(html) {
  html = html
    .replace(
      /<div class="[^"]*wp-block-yoast-seo-table-of-contents[^"]*"[\s\S]*?<\/div>/gi,
      "",
    )
    .replace(
      /<div class="[^"]*wp-block-rank-math-toc-block[^"]*"[\s\S]*?<\/div>/gi,
      "",
    );

  return html;
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
  // Tip block
  html = html.replace(
    /\[tip\]([\s\S]*?)\[\/tip\]/gi,
    `
    <div class="callout callout-tip">
      <div class="callout-title">Pro Tip</div>
      <p>$1</p>    
    </div>
    `,
  );

  // Key takeaway block
  html = html.replace(
    /\[key\]([\s\S]*?)\[\/key\]/gi,
    `
      <div class="callout callout-key">
        <div class="callout-title">Key Takeaways</div>
        <p>$1</p>
      </div>
    `,
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
      <sup class="relative group cursor-pointer text-green-400">
        <a href="#footnote-${number}" id="ref-${number}">[${number}]</a> 

        <span 
          class="absolute hidden group-hover:block bg-zinc-900 text-gray-300 text-xs p-3 rounded-md shadow-lg w-72 top-6 left-1/2 -translate-x-1/2 z-50">
          ${text}
        </span>  
      </sup>
    `;
  });

  let footnoteHTML = "";

  if (footnotes.length > 0) {
    footnoteHTML = `
      <section id="sources" class="mt-16 border-t border-zinc-800 pt-10">

        <button 
          id="sources-button" 
          class="flex items-center gap-2 text-lg font-semibold text-white mb-6">
            <span id="sources-toggle">+</span> 
            ${footnotes.length} Sources
        </button>

        <div id="evidence-source" class="hidden mt-3 text-sm text-gray-400">
          <strong>Evidence-Based</strong> 
          <p class="mt-3 mb-4">
            This article is supported by scientific research and trusted academic sources. For more information see our <a href="/editorial-policy" class="text-green-400 hover:underline">editorial process</a>.
          </p>
        </div>

        <ol id="sources-list" class="space-y-3 text-gray-400 hidden">

          ${footnotes
            .map(
              (note, i) => `
              <li class="text-sm" id="footnote-${i + 1}">
                ${note} 
                <a href="#ref-${i + 1}" class="ml-2 text-green-400">&#8629;</a>
              </li>
            `,
            )
            .join("")}
            
        </ol>

      </section>
    `;
  }

  return {
    content: content,
    count: footnotes.length,
    sources: footnotes,
  };
}

export const revalidate = 3600;

export async function generateStaticParams() {
  if (process.env.NODE_ENV !== "production") {
    return [];
  }

  const { data: posts } = await supabase.from("posts").select("slug, category");

  return posts.map((post) => ({
    slug: post.slug,
    category: post.category,
  }));
}

export default async function PostPage({ params }) {
  const { slug, category } = await params;

  const post = await getPost(slug);

  const relatedPosts = await getRelatedPosts(category, slug);

  if (!post) {
    notFound();
  }

  const readingTime = calculateReadingTime(post.content);

  const articleSchema = post
    ? {
        "@context": "https://schema.org",
        "@type": "Article",

        headline: post.title,
        description: post.excerpt,

        image: [
          `https://shedbody.vercel.app/${post.category}${post.slug}/og-image.jpg`,
        ],

        author: {
          "@type": "Organization",
          name: "ShedBody",
        },

        publisher: {
          "@type": "Organization",
          name: "ShedBody",
          logo: {
            "@type": "ImageObject",
            url: "https://shedbody.vercel.app/logo.png",
          },
        },

        datePublished: post.published_at,
        dateModified: post.published_at,

        articleSection: "Fitness Guide",

        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://shedbody.vercel.app/${post.category}/${post.slug}`,
        },

        wordCount: post.content.replace(/<[^>]*>/g, "").split(/\s+/).length,
      }
    : null;

  // PIPELINES
  let cleanedContent = cleanWordPressContent(post.content);

  cleanedContent = cleanContent(cleanedContent);

  cleanedContent = optimizeImages(cleanedContent);

  // Transform callouts
  cleanedContent = transformCallouts(cleanedContent);

  // Inject related article
  cleanedContent = injectInlineRelated(cleanedContent, relatedPosts);

  // Transform Footnots
  const footnoteResult = transformFootnotes(cleanedContent);
  cleanedContent = footnoteResult.content;
  const sourceCount = footnoteResult.count;
  const sources = footnoteResult.sources || [];

  // Add IDs for anchor links
  const contentWithIds = addHeadingIds(cleanedContent);

  // Extract headings for TOC
  const headings = extractHeadings(contentWithIds);

  return (
    <>
      <ReadingProgress />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {articleSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(articleSchema),
            }}
          />
        )}
        {/* Article Hero */}
        <header className="mb-12">
          {/* Breadcrumbs */}
          <Breadcrumbs
            category={post.category}
            title={post.title}
            className="mb-4"
          />

          {/* Category & Evidence Badge */}
          <div className="flex items-center gap-3 mb-4">
            <Link
              href={`/${post.category}`}
              className="text-green-500 text-sm font-semibold"
            >
              <p>{category.charAt(0).toUpperCase() + category.slice(1)}</p>
            </Link>

            {sourceCount > 0 && (
              <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded">
                &#10003; Evidence-Based &bull; {sourceCount} Sources
              </span>
            )}
          </div>

          {/* Article Title */}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-400 text-lg max-w-2xl">{post.excerpt}</p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 mt-6 text-sm text-gray-500">
            <span>By ShedBody</span>
            <span>&bull;</span>
            <span>
              {new Date(post.published_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>&bull;</span>
            <span>
              {readingTime} min{readingTime > 1 ? "s" : ""} read
            </span>
          </div>

          {/* Editorial Process */}
          <p className="text-xs text-gray-400 mt-3">
            Reviewed under our{" "}
            <Link
              href="/editorial-policy"
              className="text-green-400 hover:underline"
            >
              Editorial Process
            </Link>
          </p>
        </header>
        {/* TOC UI */}
        {headings && headings.length > 0 && (
          <nav
            aria-label="Article Table of contents"
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-10"
          >
            <h2 className="text-lg font-semibold mb-4">In This Article</h2>

            <ul className="space-y-2 text-sm">
              {headings.map((heading) => {
                return (
                  <li
                    key={heading.id}
                    className={
                      heading.level !== "2" ? "ml-4 text-zinc-400" : ""
                    }
                  >
                    <a
                      href={`#${heading.id}`}
                      className="block py-1 text-green-400 hover:text-green-300 transition"
                    >
                      {heading.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
        <div className="max-w-337.5 mx-auto px-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-16">
          {/* Article Content */}
          <article className="min-w-0 prose prose-invert prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: contentWithIds }} />

            {/* Sources Toggle */}
            <SourcesToggle count={sourceCount}>
              <ul className="space-y-3 list-disc pl-5 text-gray-300">
                {sources.map((source, i) => (
                  <li
                    key={i}
                    className="text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: source }}
                  />
                ))}
              </ul>
            </SourcesToggle>

            {/* Related Articles */}
            <InlineRelatedArticle posts={relatedPosts} />
          </article>

          {/* Sidebar TOC */}
          <TableOfContents headings={headings} />
        </div>
      </main>
    </>
  );
}
