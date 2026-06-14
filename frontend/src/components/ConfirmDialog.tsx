import { useState, useCallback, createContext, useContext } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmOptions { title: string; message: string; confirmText?: string }
type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn>(() => Promise.resolve(false))
export function useConfirm() { return useContext(ConfirmContext) }

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ options: ConfirmOptions; resolve: (v: boolean) => void } | null>(null)

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => setState({ options, resolve }))
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">{state.options.title}</h3>
            </div>
            <p className="text-sm text-[#94a3b8] mb-6">{state.options.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => { state.resolve(false); setState(null) }}
                className="px-4 py-2 rounded-xl border border-white/10 text-sm text-[#94a3b8] hover:bg-white/5 transition-colors">
                取消
              </button>
              <button onClick={() => { state.resolve(true); setState(null) }}
                className="px-4 py-2 rounded-xl bg-red-500/80 text-sm text-white hover:bg-red-500 transition-colors">
                {state.options.confirmText || '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
