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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
      onClick={onStay}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-app bg-card p-6 text-center shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="flex justify-center text-3xl text-brand-emphasis">
          <FiLogOut aria-hidden />
        </p>
        <h3 id="logout-confirm-title" className="mt-3 text-lg font-semibold text-main">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
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
