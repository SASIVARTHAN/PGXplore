import { FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-app bg-card text-lg transition hover:bg-card-muted ${className}`}
    >
      {isDark ? <FiSun aria-hidden /> : <FiMoon aria-hidden />}
    </button>
  )
}
