export default function Insights({ insights }) {
  if (!insights || insights.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <h2 className="mb-4 font-semibold text-zinc-50">AI Insights</h2>
        <p className="text-sm text-zinc-500">
          Not enough data yet. Log more weight entries to see insights!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
      <h2 className="mb-4 font-semibold text-zinc-50">AI Insights</h2>

      <ul className="space-y-2 text-sm text-zinc-300 list-disc list-outside marker:text-green-600">
        {insights.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
