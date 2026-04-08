"use client";

import { motion } from "framer-motion";

export default function LevelCard({ level, xp }) {
  const progress = (xp / (level * 100)) * 100;

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <p className="text-sm text-zinc-400">Level</p>
      <p className="text-2xl font-bold text-zinc-50 mt-1">Lv. {level}</p>

      {/* Progress bar */}
      <div className="w-full h-2 bg-zinc-800 rounded-full mt-3 mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6 }}
          className="h-2 bg-zinc-50 rounded-full"
        />

        <p className="text-sm text-zinc-500 mt-2">
          {xp} XP / {level * 100} XP
        </p>
      </div>
    </div>
  );
}
