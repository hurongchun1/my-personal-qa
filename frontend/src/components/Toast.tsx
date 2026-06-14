import { useState, useCallback, createContext, useContext, useEffect } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
interface ToastItem { id: number; type: ToastType; message: string }

// ── Context ──
const ToastContext = createContext<(type: ToastType, message: string) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Toast 容器 — 右上角 */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-sm
            animate-[slideIn_0.3s_ease-out]
            ${t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''}
            ${t.type === 'error'   ? 'bg-red-500/10 border-red-500/30 text-red-400' : ''}
            ${t.type === 'info'    ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : ''}
          `}>
            {t.type === 'success' && <CheckCircle className="h-5 w-5 shrink-0" />}
            {t.type === 'error'   && <XCircle className="h-5 w-5 shrink-0" />}
            {t.type === 'info'    && <Info className="h-5 w-5 shrink-0" />}
            <span className="text-sm">{t.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="ml-2 text-current/50 hover:text-current transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
