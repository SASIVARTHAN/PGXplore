export const MAX_PG_IMAGES = 12
export const MAX_IMAGE_FILE_BYTES = 2 * 1024 * 1024

export const PG_IMAGE_PLACEHOLDER =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop&q=80'

/** Cache-bust remote URLs when listing data changes (data URLs unchanged). */
export function listingImageSrc(url, version) {
  if (!url) return PG_IMAGE_PLACEHOLDER
  if (url.startsWith('data:') || !version) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}v=${encodeURIComponent(version)}`
}

export function normalizeImageList(images) {
  if (!Array.isArray(images)) return []
  return images.map((s) => String(s).trim()).filter(Boolean)
}

export function validatePgImages(images) {
  const list = normalizeImageList(images)
  if (list.length === 0) {
    return { valid: false, message: 'Add at least one photo for this PG.' }
  }
  if (list.length > MAX_PG_IMAGES) {
    return { valid: false, message: `Maximum ${MAX_PG_IMAGES} photos allowed.` }
  }
  const invalid = list.find((url) => !url.startsWith('http') && !url.startsWith('data:image/'))
  if (invalid) {
    return { valid: false, message: 'Each photo must be a valid image URL or uploaded file.' }
  }
  const tooLarge = list.find((url) => url.startsWith('data:') && url.length > 2_800_000)
  if (tooLarge) {
    return { valid: false, message: 'Uploaded image is too large. Use a file under 2 MB or paste an image URL.' }
  }
  return { valid: true, images: list }
}

export function readImageFileAsDataUrl(file) {
  if (!file?.type?.startsWith('image/')) {
    return Promise.reject(new Error('Please choose an image file (JPG, PNG, WebP).'))
  }
  if (file.size > MAX_IMAGE_FILE_BYTES) {
    return Promise.reject(new Error('Each image must be under 2 MB.'))
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read the image file.'))
    reader.readAsDataURL(file)
  })
}
