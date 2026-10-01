"use client";

import { Activity, Dumbbell, Droplets, Sparkles, Flame, User, Footprints } from "lucide-react";

export default function Timeline({ events = [] }) {
  if (events.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-8 text-center mt-6">
        <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-zinc-50 mb-2">No Timeline Data</h3>
        <p className="text-zinc-400 text-sm">
          Log some weight, workouts, or nutrition to see your chronological timeline.
        </p>
      </div>
    );
  }

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a));

  const getIcon = (type, label) => {
    if (type === "insight") return <Sparkles className="w-4 h-4 text-emerald-400" />;
    if (type === "body" && label === "Weight") return <User className="w-4 h-4 text-blue-400" />;
    if (type === "lifestyle" && label === "Workout completed") return <Dumbbell className="w-4 h-4 text-purple-400" />;
    if (type === "lifestyle" && label === "Steps") return <Footprints className="w-4 h-4 text-orange-400" />;
    if (type === "nutrition" && label === "Nutrition logged") return <Flame className="w-4 h-4 text-orange-500" />;
    if (type === "nutrition" && label === "Water") return <Droplets className="w-4 h-4 text-blue-500" />;
    return <Activity className="w-4 h-4 text-zinc-400" />;
  };

  const getFormatDate = (dateStr) => {
    const d = new Date(dateStr);
    // Add timezone offset to prevent shifting
    const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(localDate);
  };

  return (
    <div className="space-y-8 pb-32">
      {sortedDates.map((date) => (
        <div key={date} className="relative">
          {/* Date Header */}
          <div className="sticky top-0 z-20 bg-[#09090b]/90 backdrop-blur-md py-3 mb-6 border-b border-zinc-800/50">
            <h3 className="text-sm font-black text-zinc-300 uppercase tracking-wider">
              {getFormatDate(date)}
            </h3>
          </div>

          {/* Events List */}
          <div className="ml-4 pl-6 border-l-2 border-zinc-800/50 space-y-6">
            {groupedEvents[date].map((event) => (
              <div key={event.id} className="relative">
                {/* Icon Marker */}
                <div className="absolute -left-10.25 top-1 flex items-center justify-center w-8 h-8 rounded-full border border-zinc-700 bg-zinc-950 shadow-sm z-10">
                  {getIcon(event.type, event.label)}
                </div>

                {/* Card */}
                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 shadow-sm hover:bg-zinc-800/40 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      {event.label}
                    </span>
                    {event.type === 'insight' && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-black uppercase">
                        AI Insight
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-zinc-200">
                    {event.type === 'lifestyle' && event.label === 'Workout completed' ? (
                      <span className="text-purple-400 font-bold">Session Completed!</span>
                    ) : (
                      event.value
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
