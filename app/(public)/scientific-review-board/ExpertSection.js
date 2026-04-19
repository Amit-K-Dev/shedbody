"use client";

import { GraduationCap, Briefcase, ShieldCheck, Target } from "lucide-react";
import Link from "next/link";
import { experts } from "@/lib/experts";
import ExpertAvatar from "@/components/ExpertAvatar";

export default function ExpertSection() {
  return (
    <section className="mt-16 space-y-10">
      {/* Title */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-zinc-50">Meet Our Experts</h2>
        <p className="text-zinc-400 max-w-xl mx-auto">
          Our Scientific Review Board consists of ceritfied professionals with
          years of experience in nutrition, fitness, and medical science.
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {experts.map((expert, i) => (
          <Link
            href={`/experts/${expert.id}`}
            key={expert.id}
            className="bg-zinc-50/5 border border-zinc-50/10 rounded-2xl p-6 backdrop-blur-sm hover:border-zinc-50/20 hover:scale-[1.02] transition-all duration-300 block"
          >
            {/* Avatar */}
            <ExpertAvatar
              expert={expert}
              className="w-14 h-14 font-bold text-lg mb-4"
            />

            {/* Name */}
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-zinc-50">
                {expert.name}
              </h3>
              {expert.verified || expert.verified === null ? (
                <ShieldCheck size={16} className="text-blue-400" />
              ) : (
                ""
              )}
            </div>

            {/* Role */}
            <p className="text-green-400 text-sm mb-3">{expert.role}</p>

            {/* Info */}
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="flex items-center gap-2">
                <GraduationCap size={16} />
                <span>{expert.degree}</span>
              </div>

              <div className="flex items-center gap-2">
                <Briefcase size={16} />
                <span>{expert.experience}</span>
              </div>

              <div className="flex items-center gap-2">
                <Target size={16} />
                <span>{expert.specialty}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
