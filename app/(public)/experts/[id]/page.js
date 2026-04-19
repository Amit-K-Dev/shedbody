import { getExpertById } from "@/lib/getExpert";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Target,
  Award,
  Building,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { getPersonSchema } from "@/lib/schema";
import ExpertAvatar from "@/components/ExpertAvatar";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";
import { categoryExpertMap } from "@/lib/expertMapping";

// Cache this page and its Supabase queries for 1 hour (3600 seconds)
export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const expert = getExpertById(id);

  if (!expert) return { title: "Expert Not Found" };

  const title = `${expert.name} - ${expert.role}`;
  const description = `${expert.degree}. ${expert.experience}. Specializes in ${expert.specialty}. Medically reviewed articles and fitness insights on ShedBody.`;
  const url = `/experts/${expert.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      images: expert.image ? [{ url: expert.image, alt: expert.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: expert.image ? [expert.image] : [],
    },
  };
}

export default async function ExpertProfilePage({ params }) {
  const { id } = await params;
  const expert = getExpertById(id);

  if (!expert) notFound();

  // Fetch articles reviewed by this expert
  const supabase = await createClient();
  const expertCategories = Object.keys(categoryExpertMap).filter(
    (cat) => categoryExpertMap[cat] === expert.id,
  );

  let reviewedPosts = [];
  if (expertCategories.length > 0) {
    const { data } = await supabase
      .from("posts")
      .select("id, title, slug, category, excerpt, published_at, views")
      .in("category", expertCategories)
      .not("title", "is", null)
      .not("slug", "is", null)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(6);

    if (data) reviewedPosts = data;
  }

  const schema = getPersonSchema(expert);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="mb-10">
            <Link
              href="/scientific-review-board"
              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition"
            >
              &larr; Go to Scientific Review Board
            </Link>
          </div>

          {/* Expert Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12">
            <ExpertAvatar
              key={expert.id}
              expert={expert}
              className="w-32 h-32 md:w-40 md:h-40 shrink-0 font-extrabold text-5xl shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              sizes="(max-width: 768px) 128px, 160px"
              priority={true}
            />

            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold text-zinc-50">
                  {expert.name}
                </h1>
                {expert.verified && (
                  <ShieldCheck className="text-blue-400 w-8 h-8 mt-2" />
                )}
              </div>
              <p className="text-xl text-emerald-400 font-semibold mb-4">
                {expert.role}
              </p>
              {expert.sameAs?.length > 0 && (
                <div className="flex gap-4">
                  {expert.sameAs.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-zinc-50 flex items-center gap-1 text-sm transition"
                    >
                      <ExternalLink size={16} />
                      {link.includes("linkedin") ? "LinkedIn" : "Twitter"}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expert Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm text-zinc-500 uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                  <GraduationCap size={18} className="text-emerald-500" />{" "}
                  Education
                </h3>
                <p className="text-zinc-200">{expert.degree}</p>
              </div>
              <div>
                <h3 className="text-sm text-zinc-500 uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                  <Building size={18} className="text-emerald-500" /> Alumni Of
                </h3>
                <p className="text-zinc-200">{expert.alumniOf}</p>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm text-zinc-500 uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                  <Award size={18} className="text-emerald-500" /> Credentials
                </h3>
                <p className="text-zinc-200 leading-relaxed">
                  {expert.credentials}
                </p>
              </div>
              <div>
                <h3 className="text-sm text-zinc-500 uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                  <Briefcase size={18} className="text-emerald-500" />{" "}
                  Experience
                </h3>
                <p className="text-zinc-200">{expert.experience}</p>
              </div>
              <div>
                <h3 className="text-sm text-zinc-500 uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                  <Target size={18} className="text-emerald-500" /> Specialty
                </h3>
                <p className="text-zinc-200">{expert.specialty}</p>
              </div>
            </div>
          </div>

          {/* Articles Reviewed */}
          {reviewedPosts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-zinc-800/50">
              <h2 className="text-2xl font-bold text-zinc-50 mb-8">
                Articles Reviewed by {expert.name}
              </h2>
              <div className="grid gap-8 sm:grid-cols-2">
                {reviewedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
