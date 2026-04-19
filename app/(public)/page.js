import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getTrendingPosts, getPopularPosts, getSmartFeed } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import HeroSection from "@/components/HeroSection";

// Advanced SEO Metadata for Home Page
export const metadata = {
  title: "ShedBody | Science-Backed Fitness & Nutrition",
  description:
    "Transform your body with evidence-based workouts, fat loss strategies, and nutrition guides reviewed by certified experts.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ShedBody | Science-Backed Fitness & Nutrition",
    description:
      "Transform your body with evidence-based workouts, fat loss strategies, and nutrition guides.",
    url: "/",
    siteName: "ShedBody",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShedBody | Science-Backed Fitness & Nutrition",
    description:
      "Transform your body with evidence-based workouts, fat loss strategies, and nutrition guides.",
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
        .select("id, title, slug, category, excerpt, published_at, views")
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

  return (
    <>
      {/* Website JSON-LD Schema for advanced SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
            <h2 className="text-2xl font-bold mb-6">🔥 Recommended For You</h2>
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
              className="block"
            >
              <h3 className="text-4xl font-semibold text-zinc-50 hover:text-emerald-400 transition">
                {featured.title}
              </h3>
            </Link>
            <p className="text-zinc-400 mt-4 max-w-2xl">{featured.excerpt}</p>
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
