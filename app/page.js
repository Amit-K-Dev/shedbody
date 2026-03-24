import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { getTrendingPosts, getPopularPosts, getSmartFeed } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default async function Home() {
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, category, excerpt, published_at, views")
    .order("published_at", { ascending: false })
    .limit(7);

  const featured = posts?.[0];
  const latest = posts?.slice(1, 5);

  const [smartFeed, trendingPosts, popularPosts] = await Promise.all([
    getSmartFeed(6),
    getTrendingPosts(4),
    getPopularPosts(4),
  ]);

  const smartIds = new Set(smartFeed.map((p) => p.id));

  const filteredTrending = trendingPosts.filter((p) => !smartIds.has(p.id));
  const filteredPopular = popularPosts.filter((p) => !smartIds.has(p.id));

  return (
    <main className="max-w-6xl mx-auto px-6 py-24">
      {/* HERO SECTION */}

      <section className="mb-24">
        {/* Accent Bar */}

        <div className="w-16 h-1 bg-green-500 mb-6 rounded"></div>

        {/* Headline */}

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Build Muscle.
          <br />
          <span className="bg-linear-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Lose Fat.
          </span>
          <br />
          Live Strong.
        </h1>

        {/* Description */}

        <p className="text-gray-400 mt-5 max-w-xl text-lg">
          Evidence-based workouts, fat loss strategies, and nutrition guides to
          help you transform your body.
        </p>

        {/* CTA */}

        <div className="mt-8 flex gap-4">
          <Link
            href="/start"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black hover:text-black font-semibold px-6 py-3 rounded-lg transition transform hover:-translate-y-1 shadow-lg shadow-green-500/20 cursor-pointer"
          >
            Start Your Fitness Journey
          </Link>

          <a
            href="#latest"
            className="inline-flex items-center px-5 py-3 border border-gray-700 rounded-lg text-gray-300 hover:border-green-500 hover:text-green-400 transition cursor-pointer"
          >
            Read Latest Articles
          </a>
        </div>
      </section>

      {/* RECOMMENDED ARTICLE */}
      <section id="recommended" className="mb-16">
        <h2 className="text-2xl font-bold mb-6">🔥 Recommended For You</h2>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {smartFeed?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* FEATURED ARTICLE */}
      {featured && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">⭐ Featured</h2>
          <Link
            href={`/${featured.category}/${featured.slug}`}
            className="block"
          >
            <h3 className="text-4xl font-semibold text-white hover:text-green-400 transition">
              {featured.title}
            </h3>
          </Link>

          <p className="text-gray-400 mt-4 max-w-2xl">{featured.excerpt}</p>
        </section>
      )}

      {/* LATEST ARTICLE */}
      <section id="latest" className="mb-16">
        <h2 className="text-2xl font-bold mb-6">🧾 Just In</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {latest?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* TRENDING POSTS */}
      <section id="trending" className="mb-16">
        <h2 className="text-2xl font-bold mb-6">🔥 Trending</h2>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrending?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* POPULAR POSTS */}
      <section id="popular" className="mb-16">
        <h2 className="text-2xl font-bold mb-6">🏆 Most Popular</h2>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {filteredPopular?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
