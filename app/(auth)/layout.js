export default function AuthLayout({ children }) {
  return (
    <section className="py-16">
      <h1 className="text-2xl font-bold text-zinc-50 text-center mb-6">
        ShedBody
      </h1>
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50 px-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          {children}
        </div>
      </div>
    </section>
  );
}
