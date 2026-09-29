"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, AlertTriangle, CheckCircle2, ChevronRight, Activity } from "lucide-react";

export default function CoachChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      title: "How can I help you today?",
      summary: "I'm your personal AI health coach. Ask me about your nutrition, workouts, or goals.",
      confidence: "high"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages((prev) => [...prev, { role: "assistant", ...data.data }]);
    } catch (error) {
      console.error("Coach API Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          type: "error",
          title: "Connection Error",
          summary: error.message || "I'm having trouble connecting right now. Please try again later.",
          safetyNote: "If you have a medical emergency, please contact a healthcare professional."
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-300">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`flex items-start gap-3 max-w-[85%] ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                  msg.role === "user"
                    ? "bg-emerald-500 text-zinc-950"
                    : "bg-zinc-800 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
              </div>

              {/* Message Content */}
              <div
                className={`flex flex-col gap-2 ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.role === "user" ? (
                  // User Message Style
                  <div className="bg-emerald-500 text-zinc-950 px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-md">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ) : (
                  // Assistant Message Style
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm p-4 space-y-4 shadow-md text-sm">
                    
                    {/* Header: Title and Confidence */}
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-semibold text-zinc-100 text-base">
                        {msg.title || (msg.type === "error" ? "Error" : "Response")}
                      </h3>
                      {msg.confidence && (
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold border ${
                          msg.confidence === "high" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          msg.confidence === "medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                          "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                        }`}>
                          {msg.confidence}
                        </span>
                      )}
                    </div>

                    {/* Summary */}
                    {msg.summary && (
                      <p className="text-zinc-300 leading-relaxed">
                        {msg.summary}
                      </p>
                    )}

                    {/* Evidence / Rationale */}
                    {msg.evidence && msg.evidence.length > 0 && (
                      <div className="bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                          <Activity size={14} />
                          <span className="text-xs font-semibold uppercase tracking-wide">Based on your data</span>
                        </div>
                        <ul className="space-y-1.5">
                          {msg.evidence.map((ev, i) => (
                            <li key={i} className="flex items-start gap-2 text-zinc-300">
                              <ChevronRight size={14} className="mt-0.5 flex-shrink-0 text-emerald-500/50" />
                              <span>{ev.claimType}: {ev.assertedValue !== undefined ? `${ev.assertedValue} ${ev.unit || ''}` : 'Verified'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400 ml-1">
                          Actionable Steps
                        </span>
                        <ul className="space-y-2">
                          {msg.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5">
                              <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-400" />
                              <span className="text-emerald-100/90">{rec.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Safety Note */}
                    {msg.safetyNote && (
                      <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-200/90 p-3 rounded-lg text-xs mt-2">
                        <AlertTriangle size={14} className="mt-0.5 flex-shrink-0 text-amber-500" />
                        <p>{msg.safetyNote}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg">
              <Bot size={18} />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm p-4 shadow-md">
              <div className="flex gap-1.5 items-center h-4">
                <div className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950">
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 max-w-4xl mx-auto relative"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask me anything about your health or plan..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-5 py-3 pr-12 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-emerald-500"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </form>
        <div className="text-center mt-2">
          <p className="text-[10px] text-zinc-500">
            AI Coach responses are generated by AI and may be inaccurate. Always consult a healthcare professional for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
