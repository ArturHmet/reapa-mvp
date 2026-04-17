"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface ToastItem { id: string; message: string; type: ToastType; }
interface ToastCtx  { addToast: (msg: string, type?: ToastType) => void; }

const ToastContext = createContext<ToastCtx>({ addToast: () => {} });

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev.slice(-4), { id, message, type }]); // max 5 toasts
    setTimeout(() => dismiss(id), 4000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 bg-[var(--bg-card)] border rounded-xl shadow-xl text-sm min-w-[240px] max-w-[320px] ${
              t.type === "success" ? "border-emerald-500/40" :
              t.type === "error"   ? "border-red-500/40"     :
                                     "border-blue-500/40"
            }`}
          >
            {t.type === "success" && <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />}
            {t.type === "error"   && <XCircle     size={15} className="text-red-400 flex-shrink-0"     />}
            {t.type === "info"    && <Info        size={15} className="text-blue-400 flex-shrink-0"    />}
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-[var(--text-muted)] hover:text-[var(--text)] flex-shrink-0 transition-colors"
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
