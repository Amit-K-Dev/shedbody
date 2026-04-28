"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

const FEEDBACK_REASONS = {
  yes: [
    { value: "clear", label: "Clear" },
    { value: "actionable", label: "Actionable" },
    { value: "evidence", label: "Evidence backed" },
    { value: "complete", label: "Complete" },
  ],
  no: [
    { value: "unclear", label: "Unclear" },
    { value: "missing_detail", label: "Needs detail" },
    { value: "outdated", label: "May be outdated" },
    { value: "hard_to_follow", label: "Hard to follow" },
  ],
};

const STATUS_COPY = {
  idle: "Select an answer to help improve this guide.",
  saving: "Saving your feedback securely...",
  saved: "Feedback saved. Thank you for helping improve this article.",
  error: "Saved on this device. We could not sync it right now.",
};

export default function ArticleHelpfulFeedback({ postId, slug }) {
  const storageKey = useMemo(
    () => `shedbody_article_helpful_${slug || "unknown"}`,
    [slug],
  );
  const [choice, setChoice] = useState(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [syncStatus, setSyncStatus] = useState("idle");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (typeof saved === "string") {
        setChoice(saved);
        return;
      }

      if (saved && typeof saved === "object") {
        setChoice(saved.vote || null);
        setReason(saved.reason || "");
        setNote(saved.note || "");
        setShowDetails(Boolean(saved.reason || saved.note));
      }
    } catch {
      setChoice(null);
    }
  }, [storageKey]);

  async function submitFeedback(nextFeedback) {
    setSyncStatus("saving");

    try {
      localStorage.setItem(storageKey, JSON.stringify(nextFeedback));
    } catch {
      // Feedback still works visually if storage is unavailable.
    }

    try {
      const res = await fetch("/api/article-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          vote: nextFeedback.vote,
          reason: nextFeedback.reason || null,
          note: nextFeedback.note || null,
        }),
      });

      if (!res.ok) throw new Error("Feedback request failed");

      setSyncStatus("saved");
    } catch (err) {
      console.warn("Article feedback sync failed:", err);
      setSyncStatus("error");
    }
  }

  function handleChoice(value) {
    const nextReason = value === choice ? reason : "";
    const nextFeedback = {
      vote: value,
      reason: nextReason,
      note,
      updatedAt: new Date().toISOString(),
    };

    setChoice(value);
    setReason(nextReason);
    setShowDetails(true);
    submitFeedback(nextFeedback);
  }

  function handleReason(nextReason) {
    if (!choice) return;

    const normalizedReason = reason === nextReason ? "" : nextReason;
    const nextFeedback = {
      vote: choice,
      reason: normalizedReason,
      note,
      updatedAt: new Date().toISOString(),
    };

    setReason(normalizedReason);
    submitFeedback(nextFeedback);
  }

  function handleNoteBlur() {
    if (!choice) return;

    submitFeedback({
      vote: choice,
      reason,
      note: note.trim(),
      updatedAt: new Date().toISOString(),
    });
  }

  const options = [
    {
      value: "yes",
      label: "Helpful",
      icon: ThumbsUp,
    },
    {
      value: "no",
      label: "Needs work",
      icon: ThumbsDown,
    },
  ];

  const activeReasons = choice ? FEEDBACK_REASONS[choice] : [];
  const SyncIcon =
    syncStatus === "saving"
      ? Loader2
      : syncStatus === "error"
        ? AlertCircle
        : choice
          ? CheckCircle2
          : ShieldCheck;

  return (
    <section
      aria-labelledby="article-feedback-title"
      className="not-prose mt-8 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
    >
      <div className="border-b border-zinc-800/80 bg-zinc-900/55 px-5 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Sparkles size={14} aria-hidden="true" />
              Reader quality signal
            </div>
            <h3
              id="article-feedback-title"
              className="m-0 text-base font-semibold text-zinc-50"
            >
              Was this article genuinely helpful?
            </h3>
            <p className="m-0 mt-1 text-sm leading-relaxed text-zinc-400">
              Share a quick signal so our team can improve accuracy, clarity,
              and next updates.
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
            {options.map((option) => {
              const Icon = option.icon;
              const selected = choice === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChoice(option.value)}
                  aria-pressed={selected}
                  disabled={syncStatus === "saving"}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
                    selected
                      ? "border-emerald-400/70 bg-emerald-500/15 text-emerald-200"
                      : "border-zinc-800 bg-zinc-950/70 text-zinc-300 hover:border-emerald-500/45 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div
          className={`grid gap-4 transition ${
            showDetails ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            {choice && (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    What stood out?
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeReasons.map((item) => {
                      const selected = reason === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => handleReason(item.value)}
                          disabled={syncStatus === "saving"}
                          className={`inline-flex min-h-9 items-center rounded-lg border px-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
                            selected
                              ? "border-sky-400/70 bg-sky-500/15 text-sky-200"
                              : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-600 hover:text-white"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                    <MessageSquareText size={14} aria-hidden="true" />
                    Optional note
                  </span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value.slice(0, 280))}
                    onBlur={handleNoteBlur}
                    maxLength={280}
                    rows={3}
                    placeholder="Tell us what to improve. Please do not include personal health data."
                    className="min-h-24 w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm leading-relaxed text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/15"
                  />
                  <span className="mt-1 block text-right text-xs text-zinc-500">
                    {note.length}/280
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-zinc-800/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div
            className={`flex items-center gap-2 text-sm ${
              syncStatus === "error"
                ? "text-amber-300"
                : choice
                  ? "text-emerald-300"
                  : "text-zinc-400"
            }`}
            role="status"
            aria-live="polite"
          >
            <SyncIcon
              size={16}
              aria-hidden="true"
              className={syncStatus === "saving" ? "animate-spin" : ""}
            />
            {STATUS_COPY[syncStatus]}
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <ShieldCheck size={14} aria-hidden="true" />
            Stored without name, email, or raw IP.
          </div>
        </div>
      </div>
    </section>
  );
}
