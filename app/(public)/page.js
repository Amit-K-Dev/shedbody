import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { getTrendingPosts, getPopularPosts, getSmartFeed } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import HeroSection from "@/components/HeroSection";
import { safeJsonLd } from "@/lib/security/html";
import { normalizeImageUrl } from "@/lib/utils/imageUrl";

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
  const featuredImage = normalizeImageUrl(featured?.featured_image);
  const latest = posts?.slice(1, 5);

  const smartIds = new Set(smartFeed?.map((p) => p.id) || []);
  const filteredTrending =
    trendingPosts?.filter((p) => !smartIds.has(p.id)) || [];
  const filteredPopular =
    popularPosts?.filter((p) => !smartIds.has(p.id)) || [];

  return (
    <>
      {/* Website JSON-LD Schema for advanced SEO */}
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
        {/* HERO SECTION */}
        <HeroSection />

        <section className="max-w-6xl mx-auto px-6 py-24">
          {/* RECOMMENDED ARTICLE */}
          {smartFeed?.length > 0 && (
            <section id="recommended" className="mb-16">
              <h2 className="text-2xl font-bold mb-6">
                🔥 Recommended For You
              </h2>
              <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                {smartFeed.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {/* FEATURED ARTICLE */}
          {featured && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6">⭐ Featured</h2>
              <Link
                href={`/${featured.category}/${featured.slug}`}
                className="group grid gap-8 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-emerald-500 md:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
              >
                <div className="relative aspect-video min-h-64 bg-zinc-950 md:aspect-auto">
                  <Image
                    src={featuredImage || "/hero-section.jpg"}
                    alt={featured.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 58vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col justify-center p-6 md:p-8">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-400">
                    {featured.category}
                  </p>
                  <h3 className="text-3xl font-semibold leading-tight text-zinc-50 transition group-hover:text-emerald-400 md:text-4xl">
                    {featured.title}
                  </h3>
                  {featured.excerpt && (
                    <p className="mt-4 max-w-2xl text-zinc-400">
                      {featured.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </section>
          )}

          {/* LATEST ARTICLE */}
          {latest?.length > 0 && (
            <section id="latest" className="mb-16">
              <h2 className="text-2xl font-bold mb-6">🧾 Just In</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {latest.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {/* TRENDING POSTS */}
          {filteredTrending?.length > 0 && (
            <section id="trending" className="mb-16">
              <h2 className="text-2xl font-bold mb-6">🔥 Trending</h2>
              <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                {filteredTrending.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {/* POPULAR POSTS */}
          {filteredPopular?.length > 0 && (
            <section id="popular" className="mb-16">
              <h2 className="text-2xl font-bold mb-6">🏆 Most Popular</h2>
              <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                {filteredPopular.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </section>
      </section>
    </>
  );
}
