import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ExpertInline({ expert }) {
  if (!expert) return null;

  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center text-black font-bold">
        {expert.name.charAt(4)}
      </div>

      <div className="text-sm">
        <p className="text-gray-300 font-medium flex items-center gap-1">
          <Link
            href="/editorial-process"
            className="underline hover:text-green-400"
          >
            Reviewed
          </Link>{" "}
          by {expert.name}
          <ShieldCheck size={14} className="text-green-400" />
        </p>

        <p className="text-gray-400">
          {expert.role} &bull; {expert.degree}
        </p>
        <p className="text-gray-300">Writen by ShedBody team</p>
      </div>
    </div>
  );
}
