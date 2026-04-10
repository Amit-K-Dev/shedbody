import { Sparkles, TrendingUp, AlertCircle, ArrowRight } from "lucide-react";

export default function PremiumInsights({ insights }) {
  if (!insights || insights.length === 0) {
    return (
      <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 text-zinc-400">
          <Sparkles className="w-5 h-5 text-zinc-500" />
          <p>Add more weight entries to generate AI insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 mb-8 group">
      {/* Background AI Glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent opacity-50"></div>
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700"></div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-50 tracking-tight">
            AI Coach Insights
          </h3>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {insights.map((insight, index) => {
          const isWarning =
            insight.toLowerCase().includes("warning") ||
            insight.toLowerCase().includes("careful") ||
            insight.toLowerCase().includes("too fast");
          const isPositive =
            insight.toLowerCase().includes("good") ||
            insight.toLowerCase().includes("perfect") ||
            insight.toLowerCase().includes("consistent");

          return (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30 hover:bg-zinc-800/50 transition-colors"
            >
              <div className="mt-0.5 shrink-0">
                {isWarning ? (
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                ) : isPositive ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{insight}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
