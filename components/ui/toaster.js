"use client";

import { useToast } from "./use-toast";
import { X, CheckCircle, AlertCircle, Loader2, Undo2 } from "lucide-react";

export function Toaster() {
  const { toasts, removeToast } = useToast();

  const getIcon = (variant) => {
    switch (variant) {
      case "success":
        return <CheckCircle size={18} />;
      case "destructive":
        return <AlertCircle scale={18} />;
      case "loading":
        return <Loader2 size={18} className="animate-spin" />;
      default:
        return null;
    }
  };

  const getStyle = (variant) => {
    switch (variant) {
      case "success":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "destructive":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "loading":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-zinc-800 text-white border-zinc-700";
    }
  };

  return (
    <div className="fixed top-5 right-5 z-50 space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`w-80 p-4 rounded-xl shadow-xl border backdrop-blur-sm flex gap-3 items-start ${getStyle(
            toast.variant,
          )}`}
        >
          {/* ICON */}
          <div className="mt-1">{getIcon(toast.variant)}</div>

          {/* CONTENT */}
          <div className="flex-1">
            <p className="text-semibold">{toast.title}</p>

            {toast.description && (
              <p className="text-sm opacity-80">{toast.description}</p>
            )}

            {/* UNDO BUTTON */}
            {toast.onUndo && (
              <button
                onClick={() => {
                  toast.onUndo();
                  removeToast(toast.id);
                }}
                className="flex items-center gap-1 text-sm mt-2 underline hover:opacity-80"
              >
                <Undo2 size={14} /> Undo
              </button>
            )}
          </div>

          {/* CLOSE */}
          <button
            onClick={() => removeToast(toast.id)}
            className="text-zinc-400 hover:text-zinc-50"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
