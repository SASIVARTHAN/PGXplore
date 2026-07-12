import { useId, useRef, useState } from 'react'
import { useToast } from '../Toast'
import {
  MAX_PG_IMAGES,
  normalizeImageList,
  readImageFileAsDataUrl,
} from '../../utils/pgImages'

export default function PGImageManager({ value, onChange, error }) {
  const { showToast } = useToast()
  const inputId = useId()
  const fileRef = useRef(null)
  const [urlDraft, setUrlDraft] = useState('')
  const [uploading, setUploading] = useState(false)

  const images = normalizeImageList(value)
  const atLimit = images.length >= MAX_PG_IMAGES

  const addUrl = () => {
    const url = urlDraft.trim()
    if (!url) return
    if (atLimit) return
    onChange([...images, url])
    setUrlDraft('')
  }

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return

    setUploading(true)
    try {
      const next = [...images]
      for (const file of files) {
        if (next.length >= MAX_PG_IMAGES) break
        const dataUrl = await readImageFileAsDataUrl(file)
        next.push(dataUrl)
      }
      onChange(next)
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeAt = (index) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const setCover = (index) => {
    if (index === 0) return
    const next = [...images]
    const [picked] = next.splice(index, 1)
    onChange([picked, ...next])
  }

  return (
    <section className="pg-image-manager">
      <div className="pg-image-manager__header">
        <div>
          <h3 className="pg-image-manager__title">PG photos</h3>
          <p className="pg-image-manager__hint">
            Add or replace photos here. After you save, listing cards and the PG detail gallery update
            immediately for users (no refresh needed if they already have the page open).
          </p>
        </div>
        <span className="pg-image-manager__count">
          {images.length} / {MAX_PG_IMAGES}
        </span>
      </div>

      {error ? (
        <p className="sharing-config-section__error" role="alert">
          {error}
        </p>
      ) : null}

      {images.length > 0 ? (
        <ul className="pg-image-manager__grid">
          {images.map((src, index) => (
            <li key={`${index}-${src.slice(0, 48)}`} className="pg-image-manager__card">
              <img src={src} alt="" className="pg-image-manager__preview" />
              {index === 0 ? (
                <span className="pg-image-manager__cover-badge">Cover</span>
              ) : (
                <button
                  type="button"
                  className="pg-image-manager__cover-btn"
                  onClick={() => setCover(index)}
                >
                  Set as cover
                </button>
              )}
              <button
                type="button"
                className="pg-image-manager__remove"
                onClick={() => removeAt(index)}
                aria-label="Remove photo"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="sharing-config-empty">
          <p className="text-sm text-muted">No photos yet. Upload files or paste image URLs below.</p>
        </div>
      )}

      <div className="pg-image-manager__actions">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <input
            type="url"
            className="input-app min-w-0 flex-1"
            placeholder="https://example.com/photo.jpg"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addUrl()
              }
            }}
            disabled={atLimit}
          />
          <button type="button" className="btn-secondary shrink-0" onClick={addUrl} disabled={atLimit || !urlDraft.trim()}>
            Add URL
          </button>
        </div>

        <input
          ref={fileRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          disabled={atLimit || uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <label htmlFor={inputId} className={`btn-primary cursor-pointer text-center ${atLimit || uploading ? 'pointer-events-none opacity-50' : ''}`}>
          {uploading ? 'Uploading…' : 'Upload photos'}
        </label>
      </div>

      <p className="mt-2 text-xs text-muted">
        JPG, PNG, or WebP up to 2 MB each. Uploaded images are stored with your listing data.
      </p>
    </section>
  )
}
