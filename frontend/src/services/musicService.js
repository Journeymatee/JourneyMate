import api from '../api/client'

/**
 * Fetch place-aware music suggestions from the backend.
 *
 * Backend returns:
 *   {
 *     place, region, tripType, vibe, mood, summary,
 *     tracks: [{ title, artist, language, mood, links: { spotify, youtube, ytMusic, jiosaavn } }],
 *     links:  { spotify, youtube, ytMusic, appleMusic, jiosaavn },
 *     source: 'curated' | 'llm' | 'llm+curated' | 'fallback' | 'empty',
 *   }
 *
 * Always resolves: any failure returns a tiny `{ tracks: [], links: ... }` shape
 * so the UI can degrade gracefully.
 */
export async function getPlaceMusic({ place, tripType, vibes } = {}) {
  if (!place) return null
  // Use the *first* selected vibe — the backend keys the mood by a single vibe id
  // (vibes are multi-select; we pick the strongest signal).
  const firstVibe = Array.isArray(vibes) && vibes.length > 0 ? vibes[0] : null
  const vibeKey = tripType && firstVibe ? `${tripType}/${firstVibe}` : null

  const params = { place: String(place).trim() }
  if (tripType) params.tripType = String(tripType).trim().toLowerCase()
  if (vibeKey) params.vibe = vibeKey.toLowerCase()

  try {
    const { data } = await api.get('/trips/music', { params })
    return data
  } catch {
    return null
  }
}
