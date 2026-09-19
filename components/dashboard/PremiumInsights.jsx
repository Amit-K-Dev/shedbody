import { Sparkles, TrendingUp, AlertCircle, ArrowRight, Info, CheckCircle2 } from "lucide-react";

export default function PremiumInsights({ insights }) {
  if (!insights || insights.length === 0) {
    return (
      <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 text-zinc-400">
          <Sparkles className="w-5 h-5 text-zinc-500" />
          <p>Add more log entries to generate deterministic insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 mb-8 group">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent opacity-50"></div>
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700"></div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-50 tracking-tight">
            Insight Engine
          </h3>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {insights.map((insight) => {
          let Icon = Info;
          let iconColor = "text-blue-400";
          let badgeColor = "bg-blue-400/10 text-blue-400 border-blue-400/20";
          
          if (insight.type === "warning") {
            Icon = AlertCircle;
            iconColor = "text-orange-400";
            badgeColor = "bg-orange-400/10 text-orange-400 border-orange-400/20";
          } else if (insight.type === "success") {
            Icon = CheckCircle2;
            iconColor = "text-emerald-400";
            badgeColor = "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
          } else if (insight.type === "trend") {
            Icon = TrendingUp;
            iconColor = "text-purple-400";
            badgeColor = "bg-purple-400/10 text-purple-400 border-purple-400/20";
          }

          return (
            <div
              key={insight.id}
              className="flex items-start gap-4 p-5 rounded-xl bg-zinc-800/30 border border-zinc-700/30 hover:bg-zinc-800/50 transition-colors"
            >
              <div className="mt-1 shrink-0">
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-4">
                   <h4 className="font-semibold text-zinc-100">{insight.observation}</h4>
                   <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border uppercase tracking-wider ${badgeColor}`}>
                     {insight.category}
                   </span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {insight.interpretation}
                </p>
                <div className="pt-2 mt-2 border-t border-zinc-700/50 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <p className="text-xs text-zinc-500 flex items-center gap-1 max-w-[65%]">
                    <span className="font-medium text-zinc-400 shrink-0">Evidence:</span> {insight.evidence}
                  </p>
                  <p className="text-xs text-emerald-400/90 font-medium bg-emerald-400/10 px-2 py-1 rounded-md inline-block text-right">
                    Tip: {insight.recommendation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
