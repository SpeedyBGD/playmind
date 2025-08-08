"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

export type Toast = {
  id: string
  message: string
  type?: "success" | "error" | "info"
  durationMs?: number
}

type ToastContextValue = {
  addToast: (toast: Omit<Toast, "id">) => string
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = generateId()
    const next: Toast = { id, durationMs: 3000, type: "info", ...toast }
    setToasts((prev) => [...prev, next])
    if (next.durationMs && next.durationMs > 0) {
      setTimeout(() => removeToast(id), next.durationMs)
    }
    return id
  }, [removeToast])

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed z-[100] bottom-4 right-4 flex flex-col gap-2 w-[calc(100vw-2rem)] sm:w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`backdrop-blur bg-white/90 dark:bg-neutral-900/80 border shadow rounded-lg px-4 py-3 text-sm animate-message-in ${
              t.type === 'success' ? 'border-emerald-300 text-emerald-900 dark:text-emerald-100' : ''
            } ${t.type === 'error' ? 'border-red-300 text-red-900 dark:text-red-100' : ''} ${
              t.type === 'info' ? 'border-sky-300 text-sky-900 dark:text-sky-100' : ''
            }`}
            role="status"
          >
            <div className="flex items-start gap-2">
              <div className={`h-2 w-2 rounded-full mt-1.5 ${t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-red-500' : 'bg-sky-500'}`} />
              <div className="flex-1">{t.message}</div>
              <button className="text-xs opacity-70 hover:opacity-100" onClick={() => removeToast(t.id)}>Close</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
