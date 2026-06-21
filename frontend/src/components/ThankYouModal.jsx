import { FaHandsPraying } from 'react-icons/fa6'

export default function ThankYouModal({ message = 'Thank you for your review!', onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl border border-app bg-card p-6 text-center shadow-xl">
        <p className="flex justify-center text-4xl text-brand-emphasis"><FaHandsPraying aria-hidden /></p>
        <h3 className="mt-3 text-lg font-semibold text-main">{message}</h3>
        <p className="mt-2 text-sm text-muted">Your feedback helps others choose better.</p>
        <button type="button" onClick={onClose} className="btn-primary mt-6 w-full">
          OK
        </button>
      </div>
    </div>
  )
}
