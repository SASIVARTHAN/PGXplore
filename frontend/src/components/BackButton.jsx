import { useLocation, useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { resolveBackTarget } from '../utils/navigation'

export default function BackButton({
  fallback = '/home',
  label = 'Back',
  to,
  returnKey,
  replace = false,
  useHistoryBack = false,
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    if (useHistoryBack && window.history.length > 1) {
      navigate(-1)
      return
    }
    const target = to ?? resolveBackTarget(location, fallback, returnKey)
    navigate(target, { replace })
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="relative z-50 inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-sm font-medium text-brand-emphasis transition hover:text-brand-900 dark:hover:text-brand-300"
    >
      <FiArrowLeft aria-hidden /> {label}
    </button>
  )
}
