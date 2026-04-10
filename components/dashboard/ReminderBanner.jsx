"use client";

export default function ReminderBanner({ todayLogged }) {
  if (todayLogged) return null;

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 p-4 rounded-xl">
      ⚠ You havn't logged your progress today. Don't break your streak!
    </div>
  );
}
