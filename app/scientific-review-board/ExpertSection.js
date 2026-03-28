"use client";

import { GraduationCap, Briefcase, ShieldCheck, Target } from "lucide-react";
import { experts } from "@/lib/experts";

export default function ExpertSection() {
  return (
    <section className="mt-16 space-y-10">
      {/* Title */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-white">Meet Our Experts</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Our Scientific Review Board consists of ceritfied professionals with
          years of experience in nutrition, fitness, and medical science.
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {experts.map((expert, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-white/20 hover:scale-[1.02] transition-all duration-300"
          >
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center text-black font-bold text-lg mb-4">
              {expert.name.charAt(4)}
            </div>

            {/* Name */}
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-white">
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
            <div className="space-y-2 text-sm text-gray-300">
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
          </div>
        ))}
      </div>
    </section>
  );
}
