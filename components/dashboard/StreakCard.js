export default function StreakCard({ streak }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <p className="text-sm text-zinc-400">Current Streak</p>

      <div className="flex items-center gap-2 mt-2">
        <span className="text-3xl">🔥</span>
        <span className="text-2xl font-bold">{streak}</span>
      </div>

      <p className="text-sm text-zinc-500 mt-2">Don't break your streak!</p>
    </div>
  );
}
