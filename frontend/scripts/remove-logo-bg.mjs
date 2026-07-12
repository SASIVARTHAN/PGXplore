// One-off asset utility: make the near-white background of the brand logo
// transparent so it blends cleanly on any surface (light or dark).
//
// The source asset is actually a JPEG (no alpha channel), so we decode it,
// add transparency for near-white/low-saturation pixels, and re-encode as a
// real PNG. Re-runnable: it always processes from a saved copy of the original.
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import jpeg from 'jpeg-js'
import { PNG } from 'pngjs'

const here = dirname(fileURLToPath(import.meta.url))
const src = resolve(here, '../public/pgxplore-logo.png')
const original = resolve(here, '../public/pgxplore-logo-original.jpg')

if (!existsSync(original)) copyFileSync(src, original)

const raw = jpeg.decode(readFileSync(original), { useTArray: true, formatAsRGBA: true })
const { width, height, data } = raw

// A pixel is treated as background when it is bright and nearly unsaturated
// (white / very light gray). The colored watercolor + wordmark are preserved.
const SOLID = 244 // >= this min-channel and low saturation => fully transparent
const SOFT = 210 // ramp transparency between SOFT..SOLID for clean edges

for (let i = 0; i < data.length; i += 4) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  const maxC = Math.max(r, g, b)
  const minC = Math.min(r, g, b)
  const sat = maxC === 0 ? 0 : (maxC - minC) / maxC

  if (sat < 0.06) {
    if (minC >= SOLID) {
      data[i + 3] = 0
    } else if (minC >= SOFT) {
      const t = (SOLID - minC) / (SOLID - SOFT)
      data[i + 3] = Math.round(data[i + 3] * t)
    }
  }
}

const png = new PNG({ width, height })
png.data = Buffer.from(data.buffer)
writeFileSync(src, PNG.sync.write(png))
console.log(`Logo background removed -> ${src} (${width}x${height})`)
