import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { getTrendingPosts, getPopularPosts, getSmartFeed } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import HeroSection from "@/components/HeroSection";
import { safeJsonLd } from "@/lib/security/html";
import { normalizeImageUrl } from "@/lib/utils/imageUrl";
import { formatPostDate } from "@/lib/utils/date";

// Advanced SEO Metadata for Home Page
export const metadata = {
  title: "ShedBody: Build Muscle. Lose Fat. Live Strong",
  description:
    "ShedBody delivers practical fitness, weight loss, workout, yoga, and nutrition guides to help you build a healthier body and sustainable lifestyle.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ShedBody | Science-Backed Fitness & Nutrition",
    description:
      "ShedBody delivers practical fitness, weight loss, workout, yoga, and nutrition guides to help you build a healthier body and sustainable lifestyle.",
    url: "/",
    siteName: "ShedBody",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShedBody | Science-Backed Fitness & Nutrition",
    description:
      "ShedBody delivers practical fitness, weight loss, workout, yoga, and nutrition guides to help you build a healthier body and sustainable lifestyle.",
  },
  robots: "index, follow",
};

export const revalidate = 3600;

function getPostImage(post) {
  if (!post) return null;
  return normalizeImageUrl(post.featured_image);
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-6 border-b border-zinc-800/80 pb-4">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-50 md:text-3xl">
          {title}
        </h2>
      </div>
    </div>
  );
}

function ArticleMeta({ post }) {
  return (
    <p className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500">
      <span>{post.category}</span>
      <span className="text-zinc-700">&bull;</span>
      <span>
        {formatPostDate(post.updated_at || post.published_at, {
          showUpdatedLabel: true,
          isUpdated: !!post.updated_at,
        })}
      </span>
    </p>
  );
}

function EditorialArticle({ post, priority = false }) {
  const image = getPostImage(post) || "/hero-section.jpg";

  return (
    <Link
      href={`/${post.category}/${post.slug}`}
      className="group grid overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 transition hover:border-emerald-500/70 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]"
    >
      <div className="relative min-h-80 overflow-hidden bg-zinc-900">
        <Image
          src={image}
          alt={post.title}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950/45 via-transparent to-transparent" />
      </div>

      <div className="flex flex-col justify-center p-7 md:p-10">
        <p className="mb-4 w-fit border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
          {post.category}
        </p>
        <h3 className="text-3xl font-bold leading-tight tracking-tight text-zinc-50 transition group-hover:text-emerald-300 md:text-5xl">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-5 line-clamp-3 text-base leading-relaxed text-zinc-400">
            {post.excerpt}
          </p>
        )}
        <ArticleMeta post={post} />
      </div>
    </Link>
  );
}

function FeatureStripCard({ post, index }) {
  const image = getPostImage(post) || "/hero-section.jpg";

  return (
    <Link
      href={`/${post.category}/${post.slug}`}
      className="group grid grid-cols-[112px_minmax(0,1fr)] gap-4 border-b border-zinc-800/70 py-5 first:pt-0 last:border-b-0 last:pb-0"
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-zinc-900">
        <Image
          src={image}
          alt={post.title}
          fill
          sizes="112px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="min-w-0">
        <p className="mb-2 text-xs font-semibold text-zinc-500">
          {String(index + 1).padStart(2, "0")} / {post.category}
        </p>
        <h3 className="line-clamp-3 text-base font-semibold leading-snug text-zinc-100 transition group-hover:text-emerald-300">
          {post.title}
        </h3>
      </div>
    </Link>
  );
}

function CompactArticleList({ posts }) {
  return (
    <div className="divide-y divide-zinc-800/70 border-y border-zinc-800/70">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/${post.category}/${post.slug}`}
          className="group grid gap-4 py-5 transition md:grid-cols-[160px_minmax(0,1fr)]"
        >
          <div className="relative aspect-video overflow-hidden rounded-md bg-zinc-900">
            <Image
              src={getPostImage(post) || "/hero-section.jpg"}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 160px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
              {post.category}
            </p>
            <h3 className="line-clamp-2 text-xl font-semibold leading-snug text-zinc-50 transition group-hover:text-emerald-300">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                {post.excerpt}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function SidebarPost({ post }) {
  return (
    <Link
      href={`/${post.category}/${post.slug}`}
      className="group block rounded-lg border border-zinc-800 bg-zinc-950/70 p-5 transition hover:border-emerald-500/70"
    >
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
        {post.category}
      </p>
      <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-zinc-50 transition group-hover:text-emerald-300">
        {post.title}
      </h3>
    </Link>
  );
}

export default async function Home() {
  const supabase = await createClient();

  const [{ data: posts }, smartFeed, trendingPosts, popularPosts] =
    await Promise.all([
      supabase
        .from("posts")
        .select(
          "id, title, slug, category, excerpt, published_at, updated_at, views, featured_image",
        )
        .or(
          "status.eq.published,status.eq.Published,status.eq.publish,status.is.null",
        )
        .not("title", "is", null)
        .not("slug", "is", null)
        .not("category", "is", null)
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(7),
      getSmartFeed(6),
      getTrendingPosts(4),
      getPopularPosts(4),
    ]);

  const featured = posts?.[0];
  const latest = posts?.slice(1, 5);

  const smartIds = new Set(smartFeed?.map((p) => p.id) || []);
  const filteredTrending =
    trendingPosts?.filter((p) => !smartIds.has(p.id)) || [];
  const filteredPopular =
    popularPosts?.filter((p) => !smartIds.has(p.id)) || [];
  const leadRecommended = smartFeed?.[0];
  const sideRecommended = smartFeed?.slice(1, 6) || [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ShedBody",
            url: "https://shedbody.com/",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://shedbody.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      <section>
        <HeroSection />

        <section className="mx-auto max-w-7xl px-6 pb-24">
          {featured && (
            <section className="mb-24">
              <SectionHeader eyebrow="Featured" title="Editor's lead story" />
              <EditorialArticle post={featured} priority />
            </section>
          )}

          {smartFeed?.length > 0 && (
            <section id="recommended" className="mb-24">
              <SectionHeader
                eyebrow="Recommended"
                title="Picked for your next read"
              />
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
                {leadRecommended && <PostCard post={leadRecommended} />}
                {sideRecommended.length > 0 && (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-5">
                    {sideRecommended.map((post, index) => (
                      <FeatureStripCard
                        key={post.id}
                        post={post}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
            {latest?.length > 0 && (
              <section id="latest">
                <SectionHeader eyebrow="Latest" title="Fresh from ShedBody" />
                <CompactArticleList posts={latest} />
              </section>
            )}

            <div className="space-y-12">
              {filteredTrending?.length > 0 && (
                <section id="trending">
                  <SectionHeader eyebrow="Trending" title="Readers are into" />
                  <div className="space-y-4">
                    {filteredTrending.map((post) => (
                      <SidebarPost key={post.id} post={post} />
                    ))}
                  </div>
                </section>
              )}

              {filteredPopular?.length > 0 && (
                <section id="popular">
                  <SectionHeader eyebrow="Popular" title="Most opened" />
                  <div className="space-y-4">
                    {filteredPopular.map((post, index) => (
                      <Link
                        key={post.id}
                        href={`/${post.category}/${post.slug}`}
                        className="group flex gap-4 rounded-lg border border-zinc-800 bg-zinc-950/70 p-5 transition hover:border-emerald-500/70"
                      >
                        <span className="text-2xl font-black leading-none text-zinc-700 transition group-hover:text-emerald-500">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
                            {post.category}
                          </p>
                          <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-zinc-50 transition group-hover:text-emerald-300">
                            {post.title}
                          </h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </section>
      </section>
    </>
  );
}
