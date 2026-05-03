/**
 * Helpers for the lightweight itinerary editor.
 *
 * The current MVP supports one override type — personal day notes — but the
 * shape is structured so we can grow it (locks, reordering, tier swaps)
 * without breaking saved trips already in the database.
 *
 * Stored shape (attached to a saved trip's payload as `__userOverrides`):
 *
 *   {
 *     v: 1,                        // schema version
 *     notes: {
 *       silver: { "1": "Pack swim gear",  "3": "Sunrise at 5:40am" },
 *       gold:   { "2": "Confirm spa slot" }
 *     }
 *   }
 *
 * Day numbers are 1-based and match `day.day` from the server response so we
 * can join in the UI by `String(day.day)`.
 */

const NOTE_MAX = 600

export const OVERRIDES_VERSION = 1

export function emptyOverrides() {
  return { v: OVERRIDES_VERSION, notes: { silver: {}, gold: {} } }
}

/** Pull overrides off a trip payload, normalising legacy / malformed data. */
export function readOverrides(payload) {
  const raw = payload?.__userOverrides
  if (!raw || typeof raw !== 'object') return emptyOverrides()
  const notes = raw.notes && typeof raw.notes === 'object' ? raw.notes : {}
  const out = emptyOverrides()
  for (const tier of ['silver', 'gold']) {
    const t = notes[tier]
    if (t && typeof t === 'object') {
      for (const [k, v] of Object.entries(t)) {
        const note = String(v == null ? '' : v).slice(0, NOTE_MAX)
        if (note) out.notes[tier][String(k)] = note
      }
    }
  }
  return out
}

/** Return a payload object with overrides attached (immutable update). */
export function withOverrides(payload, overrides) {
  if (!payload || typeof payload !== 'object') return payload
  const cleaned = readOverrides({ __userOverrides: overrides })
  // Drop the marker entirely if nothing is set, so the payload stays small.
  const hasAny =
    Object.keys(cleaned.notes.silver).length > 0 ||
    Object.keys(cleaned.notes.gold).length > 0
  if (!hasAny) {
    const { __userOverrides: _drop, ...rest } = payload
    return rest
  }
  return { ...payload, __userOverrides: cleaned }
}

/** Update a single per-day note for a tier. Empty string clears the entry. */
export function setNote(overrides, tier, dayKey, value) {
  const next = readOverrides({ __userOverrides: overrides })
  const k = String(dayKey)
  const trimmed = String(value == null ? '' : value).slice(0, NOTE_MAX)
  if (!trimmed) {
    delete next.notes[tier][k]
  } else {
    next.notes[tier][k] = trimmed
  }
  return next
}

export function getNote(overrides, tier, dayKey) {
  if (!overrides?.notes?.[tier]) return ''
  return overrides.notes[tier][String(dayKey)] || ''
}

export const NOTE_MAX_LENGTH = NOTE_MAX
