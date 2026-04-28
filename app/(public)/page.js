import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { getTrendingPosts, getPopularPosts, getSmartFeed } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import HeroSection from "@/components/HeroSection";
import { safeJsonLd } from "@/lib/security/html";
import { normalizeImageUrl } from "@/lib/utils/imageUrl";
import { formatPostDate } from "@/lib/utils/date";
import {
  Activity,
  ArrowRight,
  Dumbbell,
  LineChart,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";

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
        <p className="mb-4 w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
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

function TrustSection() {
  const pillars = [
    {
      metric: "01",
      label: "Evidence first",
      text: "Every guide is built around practical, research-aware fitness and nutrition advice, not hype cycles.",
    },
    {
      metric: "02",
      label: "Reviewed expertise",
      text: "Our review board connects articles with qualified specialists across training, nutrition, yoga, and recovery.",
    },
    {
      metric: "03",
      label: "Made for real life",
      text: "We prioritize sustainable routines, clear tradeoffs, and steps people can actually repeat week after week.",
    },
  ];

  return (
    <section className="mb-24 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/30">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="relative p-7 md:p-10 lg:p-12">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 via-transparent to-transparent" />
          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
              <ShieldCheck size={14} />
              Trust standard
            </div>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-zinc-50 md:text-5xl">
              Why you can trust us on your fitness journey
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400">
              Fitness advice should feel clear, accountable, and usable. We
              build ShedBody around transparent guidance that respects your
              time, body, and long-term progress.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {["Clear", "Reviewed", "Practical"].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-center"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-zinc-800 bg-zinc-950/80 p-6 md:grid-cols-3 lg:border-l lg:border-t-0 lg:p-8">
          {pillars.map((pillar) => (
            <div
              key={pillar.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/55 p-5 shadow-lg shadow-black/10 transition hover:border-emerald-500/50"
            >
              <p className="mb-8 text-3xl font-black leading-none text-zinc-800">
                {pillar.metric}
              </p>
              <h3 className="mb-3 text-base font-semibold text-zinc-50">
                {pillar.label}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardValueSection() {
  const features = [
    {
      icon: Dumbbell,
      label: "Workout plans",
      text: "Generate goal-based routines for strength, fat loss, mobility, or beginner consistency.",
    },
    {
      icon: Utensils,
      label: "Diet guidance",
      text: "Build practical nutrition plans around your body goals and daily routine.",
    },
    {
      icon: Activity,
      label: "Daily tracking",
      text: "Log progress, stay accountable, and keep your plan visible inside your dashboard.",
    },
    {
      icon: LineChart,
      label: "Progress signals",
      text: "See the patterns that matter so you know when to adjust training, food, or recovery.",
    },
  ];

  return (
    <section className="mb-24 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/30">
      <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
        <div className="p-7 md:p-10 lg:p-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300 shadow-[0_0_22px_rgba(16,185,129,0.14)]">
            <Sparkles size={14} />
            Member dashboard
          </div>

          <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-zinc-50 md:text-5xl">
            Your workout, diet, and progress system in one place
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Create plans, track what you complete, and keep your fitness journey
            moving with a dashboard built for daily action.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.label}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/55 p-5 shadow-lg shadow-black/10 transition hover:border-emerald-500/50"
                >
                  <Icon className="mb-4 h-6 w-6 text-emerald-400" />
                  <h3 className="text-base font-semibold text-zinc-50">
                    {feature.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {feature.text}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400"
            >
              Start free
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              Preview dashboard
            </Link>
          </div>
        </div>

        <div className="relative min-h-[620px] bg-zinc-900">
          <Image
            src="/hero-section.jpg"
            alt="ShedBody dashboard preview"
            fill
            sizes="(max-width: 1024px) 100vw, 52vw"
            className="object-cover opacity-35 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-linear-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/20" />

          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="w-full max-w-md rounded-2xl border border-zinc-700/80 bg-zinc-950/90 p-5 shadow-2xl shadow-black/50 backdrop-blur">
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                    Today
                  </p>
                  <h3 className="mt-1 text-xl font-bold leading-tight text-zinc-50">
                    Fitness dashboard
                  </h3>
                </div>
                <div className="shrink-0 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  68% done
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-zinc-100">
                      Push strength session
                    </span>
                    <span className="text-emerald-400">5 moves</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full w-3/4 bg-emerald-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Calories
                    </p>
                    <p className="mt-2 text-xl font-bold text-zinc-50">
                      2,180
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                    <p className="text-xs uppercase tracking-widest text-zinc-500">
                      Protein
                    </p>
                    <p className="mt-2 text-xl font-bold text-zinc-50">142g</p>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <p className="mb-3 text-sm font-semibold text-zinc-100">
                    Weekly momentum
                  </p>
                  <div className="flex h-20 items-end gap-2">
                    {[42, 64, 52, 78, 72, 88, 80].map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t bg-emerald-500/80"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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

          <TrustSection />

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

          <DashboardValueSection />

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
