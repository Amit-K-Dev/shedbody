import { Flame, Trophy, Zap } from "lucide-react";

export default function PremiumHeader({ profile }) {
  const level = profile?.gamification_level || 1;
  const xp = profile?.xp || 0;
  const streak = profile?.streak_count || 0;

  // XP Progress Calculation
  const xpForNextLevel = level * 100;
  const progressPercent = Math.min((xp / xpForNextLevel) * 100, 100);

  return (
    <div className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 shadow-xl">
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Side: Level & XP */}
        <div className="flex items-center gap-5 flex-1 w-full">
          {/* Level Badge */}
          <div className="relative flex items-center justify-center w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-xl shadow-inner">
            <div className="absolute inset-0 bg-linear-to-br from-green-400/10 to-transparent rounded-xl"></div>
            <Trophy className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black text-xs font-bold px-2 py-0.5 rounded-md border border-zinc-900">
              Lvl {level}
            </div>
          </div>

          {/* XP Bar */}
          <div className="flex-1">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h2 className="text-xl font-bold text-zinc-50 tracking-tight">
                  Fitness Journey
                </h2>
                <p className="text-sm text-zinc-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" /> {xp} XP Earned
                </p>
              </div>
              <span className="text-xs font-medium text-zinc-500">
                {xpForNextLevel} XP
              </span>
            </div>

            {/* The Progress Bar Container */}
            <div className="h-2.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
              {/* The Fill */}
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Inner Glow/Shine */}
                <div className="absolute top-0 right-0 bottom-0 w-4 bg-zinc-50/20 blur-[2px]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Streak */}
        <div className="flex items-center gap-4 bg-zinc-950/50 border border-zinc-800 px-5 py-4 rounded-xl shrink-0">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Flame className="w-7 h-7 text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-400">Current Streak</p>
            <p className="text-2xl font-black text-zinc-50">
              {streak}{" "}
              <span className="text-base font-normal text-zinc-500">Days</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
