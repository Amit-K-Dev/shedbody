export default function Badges({ badges }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <h3 className="mb-4 font-semibold text-zinc-50">Badges</h3>

      <div className="flex gap-3 flex-wrap">
        {badges.map((b) => (
          <div key={b.id} className="px-3 py-2 bg-zinc-800 rounded-lg text-sm">
            🏆 {b.name}
          </div>
        ))}
      </div>
    </div>
  );
}
