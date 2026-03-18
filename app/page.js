import { supabase } from "../lib/supabase";
import Link from "next/link";
import PostCard from "@/components/PostCard";

export default async function Home() {
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, category, excerpt, published_at, views")
    .order("published_at", { ascending: false })
    .limit(10);

  const featured = posts?.[0];
  const latest = posts?.slice(1);

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
          <a
            href="#latest"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-black hover:text-black font-semibold px-6 py-3 rounded-lg transition transform hover:-translate-y-1 shadow-lg shadow-green-500/20"
          >
            Read Latest Articles
          </a>

          <a
            href="#"
            className="inline-flex items-center px-5 py-3 border border-gray-700 rounded-lg text-gray-300 hover:border-green-500 hover:text-green-400 transition"
          >
            Start Your Fitness Journey
          </a>
        </div>
      </section>

      {/* FEATURED ARTICLE */}

      {featured && (
        <section className="mb-16">
          <Link
            href={`/${featured.category}/${featured.slug}`}
            className="block"
          >
            <h2 className="text-4xl font-semibold text-white hover:text-green-400 transition">
              {featured.title}
            </h2>
          </Link>

          <p className="text-gray-400 mt-4 max-w-2xl">{featured.excerpt}</p>
        </section>
      )}

      {/* ARTICLE GRID */}

      <section
        id="latest"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
      >
        {latest?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
    </main>
  );
}
