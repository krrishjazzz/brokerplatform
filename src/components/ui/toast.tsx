"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setItems((current) => [...current, { id, type, message }].slice(-4));
    window.setTimeout(() => remove(id), 3600);
  }, [remove]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-24 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-3 rounded-card border bg-white p-3 shadow-modal",
              item.type === "success" && "border-success/20",
              item.type === "error" && "border-error/20",
              item.type === "info" && "border-primary/20"
            )}
          >
            <span
              className={cn(
                "mt-0.5",
                item.type === "success" && "text-success",
                item.type === "error" && "text-error",
                item.type === "info" && "text-primary"
              )}
            >
              {item.type === "success" ? <CheckCircle size={18} /> : item.type === "error" ? <XCircle size={18} /> : <Info size={18} />}
            </span>
            <p className="min-w-0 flex-1 text-sm font-medium leading-5 text-foreground">{item.message}</p>
            <button type="button" onClick={() => remove(item.id)} className="rounded-btn p-0.5 text-text-secondary hover:bg-surface hover:text-foreground">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
