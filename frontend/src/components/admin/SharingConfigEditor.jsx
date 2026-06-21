import { useMemo } from 'react'
import {
  SHARING_TYPE_OPTIONS,
  createFormSharingConfig,
  getSharingLabel,
} from '../../utils/sharingTypes'

export default function SharingConfigEditor({ value, onChange, error }) {
  const usedTypes = useMemo(() => new Set(value.map((c) => c.type).filter(Boolean)), [value])

  const canAddMore = usedTypes.size < SHARING_TYPE_OPTIONS.length

  const addConfiguration = () => {
    if (!canAddMore) return
    onChange([...value, createFormSharingConfig()])
  }

  const removeConfiguration = (id) => {
    onChange(value.filter((c) => c.id !== id))
  }

  const updateConfiguration = (id, patch) => {
    onChange(value.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  const optionsForCard = (config) => {
    return SHARING_TYPE_OPTIONS.filter((opt) => opt.id === config.type || !usedTypes.has(opt.id))
  }

  return (
    <section className="sharing-config-section">
      <div className="sharing-config-section__header">
        <div>
          <h3 className="sharing-config-section__title">Room & sharing configuration</h3>
          <p className="sharing-config-section__hint">
            Add each sharing type offered at this PG. Set rent and optional vacancies per type.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary text-sm"
          onClick={addConfiguration}
          disabled={!canAddMore}
        >
          + Add sharing type
        </button>
      </div>

      {error ? (
        <p className="sharing-config-section__error" role="alert">
          {error}
        </p>
      ) : null}

      {value.length === 0 ? (
        <div className="sharing-config-empty">
          <p className="text-sm text-muted">No sharing types configured yet.</p>
          <button type="button" className="btn-secondary mt-3 text-sm" onClick={addConfiguration}>
            Add your first sharing type
          </button>
        </div>
      ) : (
        <ul className="sharing-config-list">
          {value.map((config, index) => (
            <li key={config.id} className="sharing-config-card">
              <div className="sharing-config-card__head">
                <span className="sharing-config-card__index">#{index + 1}</span>
                <p className="sharing-config-card__label">
                  {config.type ? getSharingLabel(config.type) : 'New configuration'}
                </p>
                <button
                  type="button"
                  className="sharing-config-card__remove"
                  onClick={() => removeConfiguration(config.id)}
                  aria-label="Remove sharing configuration"
                >
                  Remove
                </button>
              </div>

              <div className="sharing-config-card__grid">
                <label className="block text-sm sm:col-span-2">
                  <span className="font-medium text-main">Sharing type</span>
                  <select
                    className="select-app mt-1 w-full"
                    value={config.type}
                    onChange={(e) => updateConfiguration(config.id, { type: e.target.value })}
                    required
                  >
                    <option value="">Select sharing type…</option>
                    {optionsForCard(config).map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="font-medium text-main">Monthly rent (₹)</span>
                  <input
                    type="number"
                    min="1"
                    className="input-app mt-1 w-full"
                    placeholder="e.g. 6500"
                    value={config.price}
                    onChange={(e) => updateConfiguration(config.id, { price: e.target.value })}
                    required
                  />
                </label>

                <label className="block text-sm">
                  <span className="font-medium text-main">
                    Available vacancies <span className="font-normal text-muted">(optional)</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    className="input-app mt-1 w-full"
                    placeholder="Leave blank — Coming Soon"
                    value={config.vacancies}
                    onChange={(e) => updateConfiguration(config.id, { vacancies: e.target.value })}
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}

      {value.length > 0 && canAddMore ? (
        <button type="button" className="btn-secondary mt-4 w-full text-sm sm:w-auto" onClick={addConfiguration}>
          + Add another sharing type
        </button>
      ) : null}

      {!canAddMore && value.length > 0 ? (
        <p className="mt-3 text-xs text-muted">All available sharing types have been added for this PG.</p>
      ) : null}
    </section>
  )
}
