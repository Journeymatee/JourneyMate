import api from '../api/client'

/**
 * Live Booking Agent client.
 *
 * Five thin wrappers around `POST /api/agent/*`. Every call returns the raw
 * backend payload — see `backend/src/modules/agent/tools/*` for the exact
 * shape of each tool result.
 *
 * Errors are normalized to a plain `Error` whose `.message` is the friendliest
 * message we can extract from the backend response, so the UI just renders
 * `err.message` in an inline banner.
 */

function unwrap(err, defaultMsg) {
  const e = err?.response?.data?.error
  let msg
  if (e == null) msg = err?.message
  else if (typeof e === 'string') msg = e
  else if (e.message) msg = e.message
  else if (Array.isArray(e.details) && e.details[0]?.msg) msg = e.details[0].msg
  else msg = err?.message
  return new Error(msg || defaultMsg)
}

const TIMEOUT_MS = 22_000

function clean(value) {
  return String(value || '').trim()
}

export async function searchTrains({ from, to, date, klass } = {}) {
  try {
    const res = await api.post(
      '/agent/trains',
      { from: clean(from), to: clean(to), date: clean(date), class: clean(klass) },
      { timeout: TIMEOUT_MS }
    )
    return res.data
  } catch (err) {
    throw unwrap(err, 'Could not search trains. Please try again.')
  }
}

export async function searchFlights({ from, to, date, return_date, passengers, cabin } = {}) {
  try {
    const res = await api.post(
      '/agent/flights',
      {
        from: clean(from),
        to: clean(to),
        date: clean(date),
        return_date: clean(return_date) || undefined,
        passengers: Number(passengers) || 1,
        cabin: clean(cabin) || 'economy',
      },
      { timeout: TIMEOUT_MS }
    )
    return res.data
  } catch (err) {
    throw unwrap(err, 'Could not search flights. Please try again.')
  }
}

export async function searchHotels({ destination, check_in, check_out, guests, type } = {}) {
  try {
    const res = await api.post(
      '/agent/hotels',
      {
        destination: clean(destination),
        check_in: clean(check_in),
        check_out: clean(check_out),
        guests: Number(guests) || 2,
        type: clean(type) || 'any',
      },
      { timeout: TIMEOUT_MS }
    )
    return res.data
  } catch (err) {
    throw unwrap(err, 'Could not search hotels. Please try again.')
  }
}

export async function searchWeb({ query, topic = 'general', max_results = 5 } = {}) {
  try {
    const res = await api.post(
      '/agent/web',
      { query: clean(query), topic, max_results },
      { timeout: TIMEOUT_MS }
    )
    return res.data
  } catch (err) {
    throw unwrap(err, 'Web search failed. Please try again.')
  }
}

export async function checkTatkal({ journey_date, klass } = {}) {
  try {
    const res = await api.post(
      '/agent/tatkal',
      { journey_date: clean(journey_date), class: clean(klass) || 'SL' },
      { timeout: TIMEOUT_MS }
    )
    return res.data
  } catch (err) {
    throw unwrap(err, 'Could not compute Tatkal advice.')
  }
}

export async function askAgent({ message, history = [] } = {}) {
  try {
    const res = await api.post(
      '/agent/ask',
      { message: clean(message), history },
      { timeout: 45_000 }
    )
    return res.data
  } catch (err) {
    throw unwrap(err, 'The agent is busy — please try again in a moment.')
  }
}
