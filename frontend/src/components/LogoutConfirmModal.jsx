import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiLogOut } from 'react-icons/fi'

export default function LogoutConfirmModal({
  open,
  onStay,
  onLogout,
  title = 'Log out?',
  message = 'Do you want to log out or stay signed in?',
  stayLabel = 'Stay',
  logoutLabel = 'Log out',
}) {
  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-7 py-10 sm:px-12 sm:py-12"
      style={{
        paddingTop: 'max(2.5rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(1.75rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(1.75rem, env(safe-area-inset-right, 0px))',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
      onClick={onStay}
    >
      <div
        className="mx-auto w-full max-w-[20rem] rounded-2xl border border-app bg-card px-6 py-7 shadow-xl sm:max-w-[22rem] sm:px-8 sm:py-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-emphasis dark:bg-brand-950/50">
          <FiLogOut className="text-2xl" aria-hidden />
        </div>
        <h3 id="logout-confirm-title" className="mt-5 text-center text-lg font-semibold text-main">
          {title}
        </h3>
        <p className="mt-3 text-center text-sm leading-relaxed text-muted">{message}</p>
        <div className="mt-8 flex flex-col gap-3">
          <button type="button" onClick={onLogout} className="btn-primary w-full">
            {logoutLabel}
          </button>
          <button type="button" onClick={onStay} className="btn-secondary w-full">
            {stayLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
