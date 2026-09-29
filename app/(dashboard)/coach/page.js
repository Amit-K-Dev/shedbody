import CoachChat from "./CoachChat";

export const metadata = {
  title: "AI Coach - ShedBody",
  description: "Chat with your personal AI health coach.",
};

export default function CoachPage() {
  return (
    <div className="flex flex-col h-full max-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">AI Health Coach</h1>
        <p className="text-zinc-400 text-sm">
          Ask questions about your plan, nutrition, or health goals.
        </p>
      </div>

      <div className="flex-1 min-h-0 bg-zinc-950/50 border border-zinc-800 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm relative">
        <CoachChat />
      </div>
    </div>
  );
}
