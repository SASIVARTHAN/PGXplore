import { FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeSwitch() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition ${
        isDark
          ? 'border-brand-700 bg-brand-600'
          : 'border-stone-300 bg-stone-200 dark:border-slate-600 dark:bg-slate-700'
      }`}
    >
      <span
        className={`absolute flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs text-brand-700 shadow transition ${
          isDark ? 'translate-x-7' : 'translate-x-1'
        }`}
      >
        {isDark ? <FiMoon aria-hidden /> : <FiSun aria-hidden />}
      </span>
    </button>
  )
}
