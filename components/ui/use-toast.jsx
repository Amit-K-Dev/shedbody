"use client";

import { useState, useCallback, useEffect } from "react";

let listeners = [];

const MAX_TOASTS = 4;

function createToast(data) {
  return {
    id: crypto.randomUUID(),
    ...data,
  };
}

export const toast = {
  show(data) {
    const t = createToast(data);
    listeners.forEach((l) => l(t));
    return t.id;
  },

  loading(message = "Loading...") {
    return this.show({
      title: message,
      variant: "success",
    });
  },

  error(message = "Something went wrong") {
    return this.show({
      title: message,
      variant: "destructive",
    });
  },

  update(id, data) {
    listeners.forEach((l) => l({ id, ...data, update: true }));
  },
};

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts((prev) => {
      // update existing
      if (toast.update) {
        return prev.map((t) => (t.id === toast.id ? { ...t, ...toast } : t));
      }

      const updated = [toast, ...prev];
      return updated.slice(0, MAX_TOASTS);
    });

    // auto remove
    if (toast.variant !== "loading") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    listeners.push(addToast);
    return () => {
      listeners = listeners.filter((l) => l !== addToast);
    };
  }, [addToast]);

  return { toasts, removeToast };
}
