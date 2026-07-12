import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

export default function PasswordInput({ className = '', wrapperClassName = 'mt-1', ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={`relative ${wrapperClassName}`}>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`input-app w-full pr-11 ${className}`.trim()}
      />
      <button
        type="button"
        onClick={() => setVisible((show) => !show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-neutral-500 transition hover:text-neutral-900 dark:text-stone-400 dark:hover:text-stone-100"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? <FiEyeOff aria-hidden className="text-lg" /> : <FiEye aria-hidden className="text-lg" />}
      </button>
    </div>
  )
}
