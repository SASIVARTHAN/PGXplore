import { useState } from 'react'

const REPORT_TYPES = ['Wrong Rent', 'Wrong Vacancy', 'Wrong Images', 'Other']

export default function ReportModal({ pgName, onClose, onSubmit }) {
  const [type, setType] = useState(REPORT_TYPES[0])
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ type, description })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-main">Report Incorrect Info</h2>
        <p className="mt-1 text-sm text-muted">Reporting: {pgName}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-main">Issue type</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className="select-app mt-1">
              {REPORT_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-main">Details (optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what's incorrect..."
              className="input-app mt-1 w-full"
            />
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
