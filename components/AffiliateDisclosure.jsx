import Link from "next/link";
import { Info } from "lucide-react";

export default function AffiliateDisclosure({
  processHref = "/editorial-process",
}) {
  return (
    <aside
      aria-label="Affiliate disclosure"
      className="mb-8 rounded-lg border border-zinc-800 bg-zinc-900/55 px-4 py-3"
    >
      <div className="flex gap-2.5">
        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-zinc-500">
          <Info size={15} aria-hidden="true" />
        </span>
        <div className="min-w-0 text-xs leading-6 text-zinc-400">
          <span className="font-semibold text-zinc-300">
            Affiliate disclosure:
          </span>{" "}
          <span>
            We include products we think are useful for our readers. If you buy
            through links on this page, we may earn a small commission.
          </span>{" "}
          <Link
            href={processHref}
            className="font-medium text-emerald-400 underline decoration-emerald-500/30 underline-offset-4 transition hover:text-emerald-300 hover:decoration-emerald-400"
          >
            Here&apos;s our process.
          </Link>
        </div>
      </div>
    </aside>
  );
}
