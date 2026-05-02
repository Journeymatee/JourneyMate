/**
 * Photo resolver — given anything we know about a destination, return
 * a deterministic state-iconic image URL.
 *
 * Resolution order (most reliable → least):
 *   1.  An explicit `stateCode` from the /api/cities response.
 *   2.  An exact match against the curated CITY_TO_STATE famous-spots table.
 *   3.  An exact / alias match against state names + their nicknames.
 *   4.  Substring scan of state names.
 *   5.  Generic FALLBACK_PHOTO.
 *
 * Steps 2-4 all run on a *normalised* form of the input — lower-case,
 * letters only, no spaces — so "Tamil-Nadu", "TamilNadu", "tamil nadu"
 * and "TAMIL NADU" all collide on the same key.
 */
import {
  STATE_PHOTOS,
  STATE_ALIASES,
  STATE_NAME_INDEX,
  CITY_TO_STATE,
  FALLBACK_PHOTO,
} from '../data/statePhotos'

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z]+/g, '')

/**
 * Resolve a state code (uppercase) from any of the inputs we have.
 * Returns null if nothing matches — callers can use that to keep their
 * existing fallback art instead of swapping it out.
 */
export function resolveStateCode({ stateCode, city, query } = {}) {
  // 1. Explicit stateCode from the API trumps everything
  const codeFromApi = String(stateCode || '').toUpperCase().trim()
  if (codeFromApi && STATE_PHOTOS[codeFromApi]) return codeFromApi

  const candidates = [city, query].filter(Boolean)

  for (const raw of candidates) {
    const key = norm(raw)
    if (!key) continue

    // 2. Famous-spot table (cities, monuments, valleys, etc.)
    if (CITY_TO_STATE[key]) return CITY_TO_STATE[key]

    // 3. State alias / canonical name
    if (STATE_ALIASES[key]) return STATE_ALIASES[key]

    // 4. Substring scan — works for "trip to himachal pradesh"
    for (const entry of STATE_NAME_INDEX) {
      if (key.includes(entry.norm) || entry.norm.includes(key)) {
        return entry.code
      }
    }
  }

  return null
}

/**
 * Convenience: given any location-shaped input, return the photo entry
 * (with file/spot/biome/accent) — falling back to a tiny stub object that
 * still has a usable `file` URL.
 */
export function getStatePhoto(input) {
  const code = resolveStateCode(input)
  if (code && STATE_PHOTOS[code]) return STATE_PHOTOS[code]
  return {
    code: null,
    name: 'India',
    file: FALLBACK_PHOTO,
    spot: 'Indian landscape',
    biome: 'mixed',
    accent: 'cyan',
  }
}

/**
 * Just the URL — handy for inline `style={{ backgroundImage: ... }}`.
 */
export function getStatePhotoUrl(input) {
  return getStatePhoto(input).file
}

/**
 * Tiny telemetry hook — when a photo file 404s (because we haven't generated
 * it yet) we silently degrade to the fallback rather than showing a broken
 * image. Wire this into `<img onError={onPhotoError}>`.
 */
export function onPhotoError(e) {
  if (!e?.currentTarget) return
  if (e.currentTarget.dataset.fallbackApplied === '1') return
  e.currentTarget.src = FALLBACK_PHOTO
  e.currentTarget.dataset.fallbackApplied = '1'
}
