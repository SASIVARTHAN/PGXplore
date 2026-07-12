import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { isMobileView, useMobileBackNavigation } from '../hooks/useMobileBackNavigation'
import {
  getPathname,
  isLegalPage,
  NAV_FROM_KEY,
  resolveBackTarget,
} from '../utils/navigation'
import { markPendingScrollRestore } from '../utils/scrollRestoration'

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
  const hasExplicitOrigin = Boolean(location.state?.[NAV_FROM_KEY] ?? location.state?.from)
  const onLegal = isLegalPage(location.pathname)

  const handleBack = useCallback(
    (meta = {}) => {
      const fromPopState = Boolean(meta.fromPopState)

      if (onLegal) {
        const target = to ?? resolveBackTarget(location, fallback, returnKey)
        markPendingScrollRestore(target)
        // OS back already moved off this page — only sync if needed.
        if (fromPopState) return
        if (window.history.length > 1) {
          navigate(-1)
          return
        }
        navigate(target, { replace: true })
        return
      }

      if (isMobileView()) {
        let target = to ?? resolveBackTarget(location, fallback, returnKey)
        if (!to && getPathname(target) === '/') {
          target = fallback !== '/' ? fallback : '/home'
        }
        if (fromPopState) {
          navigate(target, { replace: true })
          return
        }
        navigate(target, { replace: true })
        return
      }
      if ((useHistoryBack || hasExplicitOrigin) && window.history.length > 1) {
        navigate(-1)
        return
      }
      const target = to ?? resolveBackTarget(location, fallback, returnKey)
      navigate(target, { replace: replace || hasExplicitOrigin })
    },
    [
      fallback,
      hasExplicitOrigin,
      location,
      navigate,
      onLegal,
      replace,
      returnKey,
      to,
      useHistoryBack,
    ],
  )

  useMobileBackNavigation(handleBack, { trap: !onLegal })

  return (
    <button
      type="button"
      onClick={() => handleBack({ fromPopState: false })}
      className="relative z-50 hidden cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-sm font-medium text-brand-emphasis transition hover:text-brand-900 dark:hover:text-brand-300 md:inline-flex"
    >
      <FiArrowLeft aria-hidden /> {label}
    </button>
  )
}
