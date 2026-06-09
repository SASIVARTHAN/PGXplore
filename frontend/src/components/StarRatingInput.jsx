import { FaRegStar, FaStar } from 'react-icons/fa6'

export default function StarRatingInput({ value, onChange, max = 5 }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rating">
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1
        const filled = star <= value
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl transition hover:scale-110 ${
              filled ? 'text-amber-500' : 'text-stone-300 dark:text-slate-600'
            }`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            {filled ? <FaStar aria-hidden /> : <FaRegStar aria-hidden />}
          </button>
        )
      })}
    </div>
  )
}
