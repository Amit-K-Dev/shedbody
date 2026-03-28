"use client";

import { ShieldCheck, FlaskConical, RefreshCcw } from "lucide-react";
import { experts } from "@/lib/experts";

export default function TrustSection() {
  return (
    <section className="mt-10 space-y-6">
      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        {/* Expert Verified */}
        <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full border border-green-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-300">
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
      <p className="text-center text-gray-400 text-sm max-w-lg mx-auto">
        Reviewd by ceritfied experts in nutrition, excercise science, and
        medical fields to ensure accuracy and reliability.
      </p>

      {/* Expert Avatar Stack */}
      <div className="flex justify-center items-center gap-3">
        <div className="flex -space-x-3">
          {experts.map((expert, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center text-xs font-semibold text-black border-2 border-black"
              title={`${expert.name} - ${expert.role}`}
            >
              {expert.name.charAt(4)}
            </div>
          ))}
        </div>

        <span className="text-sm text-gray-400">
          Reviewed by{" "}
          <span className="text-white font-medium">
            {experts.length}+ experts
          </span>
        </span>
      </div>
    </section>
  );
}
