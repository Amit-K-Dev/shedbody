import { HeartPlus, ClipboardList, Target, Gauge, Scale } from "lucide-react";

export default function StatCards({
  latestBMI,
  totalLogs,
  category,
  currentWeight,
  goalWeight,
}) {
  const stats = [
    {
      title: "Latest BMI",
      value: latestBMI || 0,
      icon: HeartPlus,
      color: "text-blue-400",
      bgGlow: "group-hover:shadow-[0_0_20px_rgba(96,165,250,0.15)]",
      iconBg: "bg-blue-500/10",
      borderColor: "group-hover:border-blue-500/30",
    },
    {
      title: "Total Logs",
      value: totalLogs || 0,
      icon: ClipboardList,
      color: "text-blue-400",
      bgGlow: "group-hover:shadow-[0_0_20px_rgba(96,165,250,0.15)]",
      iconBg: "bg-blue-500/10",
      borderColor: "group-hover:border-blue-500/30",
    },
    {
      title: "Category",
      value: category || "--",
      icon: Gauge,
      color: "text-yellow-400",
      bgGlow: "group-hover:shadow-[0_0_20px_rgba(250,204,21,0.15)]",
      iconBg: "bg-yellow-500/10",
      borderColor: "group-hover:border-yellow-500/30",
    },
    {
      title: "Current Weight",
      value: currentWeight ? `${currentWeight} kg` : "--",
      icon: Scale,
      color: "text-emerald-400",
      bgGlow: "group-hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]",
      iconBg: "bg-emerald-500/10",
      borderColor: "group-hover:border-emerald-500/30",
    },
    {
      title: "Goal",
      value: goalWeight ? `${goalWeight} kg` : "--",
      icon: Target,
      color: "text-purple-400",
      bgGlow: "group-hover:shadow-[0_0_20px_rgba(192,132,252,0.15)]",
      iconBg: "bg-purple-500/10",
      borderColor: "group-hover:border-purple-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`group relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-5 transition-all duration-500 ease-out hover:-translate-y-1 hover:bg-zinc-800/40 ${stat.borderColor} ${stat.bgGlow}`}
          >
            {/* Top Section: Icon & Title */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2.5 rounded-xl ${stat.iconBg} transition-colors duration-300`}
              >
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <h3 className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                {stat.title}
              </h3>
            </div>

            {/* Bottom Section: Value */}
            <div>
              <p className="text-2xl font-bold text-zinc-50 tracking-tight">
                {stat.value}
              </p>
            </div>

            {/* Corner Glow Effect (Subtle) */}
            <div
              className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-current ${stat.color}`}
            ></div>
          </div>
        );
      })}
    </div>
  );
}
