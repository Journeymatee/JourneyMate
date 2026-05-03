import api from '../api/client'

/**
 * Fetch shopping suggestions for a destination.
 *
 * Backend returns:
 *   {
 *     place, region, summary,
 *     spots: [{
 *       name, type, area, description, knownFor: string[], priceRange,
 *       links: { googleMaps, googleSearch, osm }
 *     }],
 *     links: { googleMaps, googleSearch, osm },
 *     source: 'curated' | 'curated+osm' | 'osm' | 'generic' | 'empty',
 *   }
 *
 * Always resolves: any failure returns `null` so the UI can degrade gracefully
 * (the panel will render an empty/retry state instead of crashing).
 */
export async function getPlaceShopping({ place } = {}) {
  if (!place) return null
  try {
    const { data } = await api.get('/trips/shopping', {
      params: { place: String(place).trim() },
    })
    return data
  } catch {
    return null
  }
}
