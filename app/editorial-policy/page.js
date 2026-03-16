import Link from "next/link";

export default function EditorialPolicy() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-20 text-gray-300">
      <h1 className="text-4xl font-bold mb-8">Editorial Policy</h1>

      <p className="mb-6">
        At <Link href="/">ShedBody</Link>, our content is created using trusted
        scientific research, peer-reviewed studies, and reputable health
        sources.
      </p>

      <p className="mb-6">
        Every article is written to provide accurate practical, and
        evidence-based guidance on fitness, nutrition, and overall health.
      </p>

      <p>
        Sources and references used in our articles are listed at the end of
        each article to maintain transparency.
      </p>
    </main>
  );
}
