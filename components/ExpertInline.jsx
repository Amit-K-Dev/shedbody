import { ShieldCheck } from "lucide-react";
import Link from "next/link";

// Helper Function
function getInitials(name) {
  if (!name) return "E";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export default function ExpertInline({ expert }) {
  if (!expert) return null;

  return (
    <div className="flex items-center gap-4 py-2 mt-4 mb-2">
      <div className="w-12 h-12 shrink-0 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-900 font-bold shadow-lg shadow-emerald-500/20">
        {getInitials(expert.name)}
      </div>

      <div className="text-sm leading-snug">
        <p className="text-zinc-200 font-medium flex items-center gap-1.5 mb-0.5">
          <Link
            href="/editorial-process"
            className="underline decoration-zinc-600 underline-offset-4 hover:text-emerald-400 hover:decoration-emerald-400 transition-colors"
          >
            Reviewed
          </Link>{" "}
          by {expert.name}
          <ShieldCheck
            size={16}
            className="text-emerald-400"
            aria-label="Verified Expert"
          />
        </p>

        <p className="text-zinc-400">
          {expert.role} {expert.degree ? `• ${expert.degree}` : ""}
        </p>

        <p className="text-zinc-500 text-xs mt-0.5">Written by ShedBody Team</p>
      </div>
    </div>
  );
}
