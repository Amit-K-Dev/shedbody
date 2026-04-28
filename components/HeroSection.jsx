"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection() {
  // Framer Motion variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative w-full min-h-[85vh] lg:min-h-screen flex items-center bg-zinc-950 overflow-hidden mb-24">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-section.jpg"
          alt="Fitness Hero Background"
          fill
          className="object-cover object-top opacity-50 mix-blend-luminosity"
          priority
        />

        <div className="absolute inset-0 bg-linear-to-r from-zinc-950 via-zinc-950/70 to-transparent"></div>

        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-zinc-950 to-transparent"></div>
      </div>

      {/* Content Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-20 flex flex-col items-start"
      >
        {/* Accent Bar */}
        <motion.div
          variants={itemVariants}
          className="w-12 h-1.5 bg-emerald-500 mb-8 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"
        ></motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.05] text-zinc-50"
        >
          <span className="mb-5 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.22em] text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.16)] md:text-base">
            ShedBody Fitness
          </span>
          <br />
          Build Muscle.
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-emerald-600">
            Lose Fat.
          </span>
          <br />
          Live Strong.
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-zinc-300 mt-8 max-w-2xl text-lg md:text-xl font-medium leading-relaxed"
        >
          ShedBody brings evidence-based workouts, fat loss strategies, yoga,
          and nutrition guidance into one practical fitness system built to help
          you transform your body with confidence.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-col sm:flex-row gap-5 w-full sm:w-auto"
        >
          <Link
            href="/start"
            className="group relative inline-flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
          >
            {/* Subtle button shine effect */}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            <span className="relative">Start Your Journey</span>
          </Link>

          <Link
            href="/articles"
            className="inline-flex justify-center items-center px-8 py-4 bg-transparent border border-zinc-700 hover:border-emerald-500 hover:bg-zinc-900 rounded-full text-zinc-300 hover:text-emerald-400 font-semibold transition-all duration-300"
          >
            Read Articles
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
