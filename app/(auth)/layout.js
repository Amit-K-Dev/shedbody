import { BicepsFlexed } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <section className="py-16">
      <h1 className="text-2xl font-bold text-zinc-50 text-center mb-6">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center justify-center tracking-wide group"
        >
          <BicepsFlexed
            size={22}
            className="text-emerald-400 mr-2 group-hover:scale-110 transition"
          />
          <span className="text-zinc-50">Shed</span>
          <span className="text-emerald-400">Body</span>
        </a>
      </h1>

      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50 px-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          {children}
        </div>
      </div>
    </section>
  );
}
