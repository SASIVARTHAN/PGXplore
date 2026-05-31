import { useEffect, useState } from 'react'
import StarRatingInput from './StarRatingInput'

export default function ReviewForm({ onSubmit, initialReview, onCancel }) {
  const [name, setName] = useState(initialReview?.name ?? '')
  const [rating, setRating] = useState(initialReview?.rating ?? 5)
  const [text, setText] = useState(initialReview?.text ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialReview) {
      setName(initialReview.name)
      setRating(initialReview.rating)
      setText(initialReview.text)
    }
  }, [initialReview])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedText = text.trim()
    if (!trimmedName || trimmedText.length < 4) {
      setError('Please enter your name and a review of at least 4 characters.')
      return
    }
    setError('')
    onSubmit({ name: trimmedName, rating: Number(rating), text: trimmedText })
    if (!initialReview) {
      setName('')
      setText('')
      setRating(5)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-app bg-card-muted p-4">
      <h4 className="font-semibold text-main">{initialReview ? 'Edit your review' : 'Write a review'}</h4>
      <label className="mt-3 block text-sm">
        <span className="mb-1 block font-medium text-main">Your name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-app w-full"
          placeholder="e.g. Ananya"
          maxLength={60}
        />
      </label>
      <div className="mt-3">
        <span className="mb-1 block text-sm font-medium text-main">Rating</span>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>
      <label className="mt-3 block text-sm">
        <span className="mb-1 block font-medium text-main">Your review</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="input-app min-h-[88px] w-full resize-y"
          placeholder="Share your experience staying here..."
          maxLength={500}
        />
      </label>
      {error && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
      <div className="action-row mt-4">
        <button type="submit" className="btn-primary">
          {initialReview ? 'Save changes' : 'Submit review'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
