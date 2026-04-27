/**
 * Detects the speech language for a given text using a quick Devanagari heuristic.
 * Returns IETF language tag suitable for Web Speech APIs.
 */
export function detectSpeechLang(text) {
  return /[\u0900-\u097F]/.test(String(text || '')) ? 'hi-IN' : 'en-IN'
}

/**
 * Normalizes meta payload into a one-liner indicator the UI can show under bot replies.
 */
export function getRealtimeHint(realtime) {
  if (!realtime) return ''
  if (realtime.weather?.city) {
    const t = realtime.weather.current?.temperature_2m
    return Number.isFinite(t)
      ? `Live data: ${realtime.weather.city} weather (${t}°C).`
      : `Live data: ${realtime.weather.city} weather.`
  }
  if (realtime.routeStats?.citySlug) {
    return `Live data: platform routes for ${realtime.routeStats.citySlug}.`
  }
  if (realtime.userBookingStats && Number.isFinite(realtime.userBookingStats.totalBookings)) {
    return 'Live data: your booking history.'
  }
  return ''
}
