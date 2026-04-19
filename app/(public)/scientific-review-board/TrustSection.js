"use client";

import { ShieldCheck, FlaskConical, RefreshCcw } from "lucide-react";
import { experts } from "@/lib/experts";
import ExpertAvatar from "@/components/ExpertAvatar";

export default function TrustSection() {
  return (
    <section className="mt-10 space-y-6">
      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        {/* Expert Verified */}
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-300">
          <ShieldCheck size={16} strokeWidth={2.2} />
          <span>Expert Verified</span>
        </div>

        {/* Evidence-Based */}
        <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full border border-blue-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-300">
          <FlaskConical size={16} strokeWidth={2.2} />
          <span>Evidence-Based</span>
        </div>

        {/* Regularly Updated */}
        <div className="flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full border border-purple-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-300">
          <RefreshCcw size={16} strokeWidth={2.2} />
          <span>Regularly Updated</span>
        </div>
      </div>

      {/* Trust Text */}
      <p className="text-center text-zinc-400 text-sm max-w-lg mx-auto">
        Reviewd by ceritfied experts in nutrition, excercise science, and
        medical fields to ensure accuracy and reliability.
      </p>

      {/* Expert Avatar Stack */}
      <div className="flex flex-wrap justify-center items-center gap-3">
        <div className="flex -space-x-3">
          {experts.map((expert, i) => (
            <ExpertAvatar
              key={i}
              expert={expert}
              className="w-10 h-10 font-semibold text-xs border-2 border-black"
              sizes="40px"
              title={`${expert.name} - ${expert.role}`}
            />
          ))}
        </div>

        <span className="text-sm text-zinc-400">
          Reviewed by{" "}
          <span className="text-zinc-50 font-medium">
            {experts.length}+ experts
          </span>
        </span>
      </div>
    </section>
  );
}
