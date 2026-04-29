import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Baby,
  Bike,
  Calculator,
  ChefHat,
  Droplets,
  Flame,
  PieChart,
  Pill,
  Ruler,
  Scale,
  Target,
  Utensils,
} from "lucide-react";
import { calculatorArchive } from "@/lib/calculators/archive";

const iconMap = {
  Activity,
  Baby,
  Bike,
  Calculator,
  ChefHat,
  Droplets,
  Flame,
  PieChart,
  Pill,
  Ruler,
  Scale,
  Target,
  Utensils,
};

export const metadata = {
  title: "ShedBody Calculators - Fitness, Nutrition & Health Tools",
  description:
    "Fitness calculators from ShedBody help you estimate body metrics, nutrition targets, hydration, pregnancy milestones, baby growth, and activity burn with practical context.",
  keywords: [
    "fitness calculators",
    "health calculators",
    "nutrition calculators",
    "BMI calculator",
    "calorie calculator",
    "macro calculator",
    "hydration calculator",
  ],
  alternates: {
    canonical: "/calculators",
  },
};

function CalculatorArchiveCard({ calculator }) {
  const Icon = iconMap[calculator.icon] || Calculator;

  return (
    <Link
      href={calculator.href}
      className="group flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-950/75 p-6 transition hover:-translate-y-1 hover:border-emerald-500/70 hover:bg-zinc-950"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="grid size-11 place-items-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
          <Icon size={22} />
        </div>
        <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs font-bold uppercase tracking-widest text-zinc-500">
          {calculator.category}
        </span>
      </div>

      <h2 className="text-xl font-bold tracking-tight text-zinc-50 transition group-hover:text-emerald-300">
        {calculator.title}
      </h2>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">
        {calculator.description}
      </p>

      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-400">
        Open calculator
        <ArrowRight size={16} className="transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export default function CalculatorsArchivePage() {
  return (
    <section className="px-6 py-14 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-400">
            ShedBody tools
          </p>
          <h1 className="text-4xl font-black tracking-tight text-zinc-50 md:text-6xl">
            Fitness, nutrition, and health calculators
          </h1>
          <p className="mt-5 text-base leading-7 text-zinc-400 md:text-lg">
            Use the full ShedBody calculator archive to estimate body metrics,
            daily targets, timelines, hydration, pregnancy milestones, and baby
            growth percentiles.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {calculatorArchive.map((calculator) => (
            <CalculatorArchiveCard
              key={calculator.href}
              calculator={calculator}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
