import api from '../api/client'

/**
 * Saved trips & wishlist client.
 *
 * Mirrors backend `/api/saved-trips`. All write operations are authenticated
 * (api client adds the Bearer header automatically). The "share" endpoint is
 * public and works without a token — used to render `/shared/:token`.
 */

function unwrap(promise) {
  return promise.then((r) => r.data)
}

export function listSavedTrips() {
  return unwrap(api.get('/saved-trips')).then((d) => d?.items || [])
}

export function getSavedTrip(id) {
  return unwrap(api.get(`/saved-trips/${id}`)).then((d) => d?.item || null)
}

/**
 * @param {object} args
 * @param {object} args.payload - the full server-shaped trip object from /trips/search
 * @param {string} [args.name]  - user-given name; default is "Origin → Destination"
 * @param {string} [args.notes] - free-text notes
 */
export function createSavedTrip({ payload, name, notes } = {}) {
  return unwrap(api.post('/saved-trips', { payload, name, notes })).then((d) => d?.item || null)
}

export function updateSavedTrip(id, patch) {
  return unwrap(api.patch(`/saved-trips/${id}`, patch || {})).then((d) => d?.item || null)
}

export function deleteSavedTrip(id) {
  return api.delete(`/saved-trips/${id}`).then(() => true)
}

export function rotateShareLink(id) {
  return unwrap(api.post(`/saved-trips/${id}/rotate-share`)).then((d) => d?.item || null)
}

/** Public — no auth required. Used by /shared/:token. */
export function getSharedTrip(token) {
  return unwrap(api.get(`/saved-trips/share/${encodeURIComponent(token)}`)).then((d) => d?.item || null)
}

/** Build the canonical share URL for a saved trip's share token. */
export function shareUrl(token) {
  if (typeof window === 'undefined' || !token) return ''
  return `${window.location.origin}/shared/${encodeURIComponent(token)}`
}
