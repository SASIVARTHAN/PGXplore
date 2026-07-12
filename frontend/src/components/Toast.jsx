import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const clearToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setToast(null)
  }, [])

  const showToast = useCallback((message, type = 'success', durationMs = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ message, type })
    timerRef.current = setTimeout(() => {
      setToast(null)
      timerRef.current = null
    }, durationMs)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={`toast-enter fixed bottom-24 left-1/2 z-50 flex w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium leading-snug text-white shadow-lg md:bottom-8 ${
            toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.type === 'error' ? (
            <FiAlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <FiCheckCircle className="h-4 w-4 shrink-0" aria-hidden />
          )}
          <span className="min-w-0 flex-1 text-left">{toast.message}</span>
          <button
            type="button"
            onClick={clearToast}
            className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/15 hover:text-white"
            aria-label="Dismiss"
          >
            <FiX className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
