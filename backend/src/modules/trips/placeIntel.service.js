'use strict'

/**
 * Free / open data: OSRM (BSD), OpenStreetMap / Overpass (ODbL), Wikipedia (CC BY-SA).
 * Server-side only — respects rate limits; set a clear User-Agent.
 */

const USER_AGENT = 'JourneyMate/1.0 (https://github.com) travel-comparison; contact: dev@local'

const OSRM = 'https://router.project-osrm.org/route/v1/driving'
const WIKI_API = 'https://en.wikipedia.org/w/api.php'
const WIKI_REST = 'https://en.wikipedia.org/api/rest_v1/page/summary'
const WIKI_V1 = 'https://en.wikipedia.org/w/rest.php/v1'

/** Strips phrases that add misleading tokens for fulltext search (e.g. "exist" → eXist article). */
function sanitizeWikipediaQuery(q) {
  return String(q)
    .replace(/\bdoes\s+not\s+exist(s)?\b/gi, ' ')
    .replace(/\bno\s+(?:matching|automatic|results?)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const WIKI_STOP = new Set(
  (
    'the a an and or of in to is for on with that this it as be are was were from at not no nor but per day ' +
    'any all may can will would could should must shall dont its his her he she we you they them our your also ' +
    'back even much some such only own same so than then these those there here when what which who how why few ' +
    'more most other another both each next very just into over out up down about off than again further once if ' +
    'off place history literary nonsense does do did have has had was were been being not exist exists existing ' +
    'will can could should would need must get got order long understood some'
  )
    .split(/\s+/)
    .filter(Boolean)
)

const WIKIWeak = new Set(['exist', 'exists', 'existing'])

/** Block rare fulltext hits on generic one-word articles when the user query is long / travel-unrelated. */
const WIKI_BANNED_SINGLE_WORD_TITLES = new Set(['nonsense', 'that', 'exist'])

/**
 * Reject off-topic first hits. For 3+ real tokens, at least 2 must appear in the result title
 * (avoids one coincidental match like "nonsense" → "Literary nonsense" or "exist" → eXist).
 */
function wikipediaMatchWord(titleLower, w) {
  if (!w) return false
  const t = String(titleLower).toLowerCase()
  const word = w.replace(/'s$/, '').toLowerCase()
  if (t === word) return true
  try {
    return new RegExp(
      `\\b${word.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&')}\\b`,
      'i',
    ).test(t)
  } catch {
    return false
  }
}

function wikipediaRelevant(candidateQuery, pageTitle, opts) {
  const t = String(pageTitle).toLowerCase()
  const qRe = (opts && opts.fullQuery)
    ? sanitizeWikipediaQuery(String(opts.fullQuery))
    : sanitizeWikipediaQuery(String(candidateQuery))
  const firstSeg = t.split(/[,(/]/)[0].replace(/_/g, ' ').trim().toLowerCase()
  const wordCount = qRe.split(/\s+/).filter(Boolean).length
  if (wordCount >= 4 && WIKI_BANNED_SINGLE_WORD_TITLES.has(firstSeg)) return false
  if (wordCount >= 4) {
    const tNorm = t.replace(/_/g, ' ')
    if (/^some [a-z0-9'\s-]{0,20} (road|street|avenue|lane|highway|route)\b/i.test(tNorm)) {
      return false
    }
  }
  if (!/[A-Za-z]{2,}/.test(qRe)) return true
  const toks = (qRe.toLowerCase().match(/\b[a-z][a-z0-9']{1,}\b/g) || []).filter(
    (x) => !WIKI_STOP.has(x) && !/^(d|day)\d+$/i.test(x) && x.length > 2
  )
  if (toks.length < 2) {
    if (toks.length === 1) {
      const w0 = toks[0]
      return wikipediaMatchWord(t, w0) || wikipediaMatchWord(t.replace(/_/g, ' '), w0)
    }
    if (toks.length === 0) return false
  }
  const inTitle = toks.filter((w) => wikipediaMatchWord(t, w))
  if (inTitle.length === 0) return false
  if (inTitle.length >= 2) return true
  if (toks.length === 2) {
    const w = inTitle[0]
    if (t === w || t.split(/[,(/]/)[0].trim() === w) return true
    return false
  }
  const w = inTitle[0]
  if (t === w) return true
  const first = t.split(/[,(/]/)[0].trim()
  if (first === w) return true
  return false
}
/**
 * Fetch with a hard per-request timeout. Without this, a slow upstream
 * (OSRM / Overpass / Wikipedia / Open-Meteo) can hang the entire `/trips/search`
 * response. We default to 6 s — short enough to never block the user, long
 * enough for a real round-trip from a Render dyno → Europe-hosted API.
 *
 * Returns null on any failure (timeout, non-2xx, parse error) so callers
 * can degrade gracefully via Promise.allSettled / try-catch.
 */
async function fetchJson(url, opts = {}) {
  const { timeoutMs = 6000, ...rest } = opts
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
        ...rest.headers,
      },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** Strip emoji / noise so Wikipedia search is less likely to match nothing. */
function normalizeSearchQuery(q) {
  if (!q) return ''
  let s = String(q)
  try {
    s = s.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu, '')
  } catch {
    s = s.replace(/[\uD83C][\uDF00-\uDFFF]|[\uD83D][\uDC00-\uDFFF]|[\uD83E][\uDD00-\uDFFF]/g, '')
  }
  return s
    .replace(/\s+/g, ' ')
    .replace(/^["']|["']$/g, '')
    .trim()
    .slice(0, 240)
}

/**
 * Shorter phrasing often matches an article: activity lines, long POI names, etc.
 */
function searchQueryCandidates(raw) {
  const q0 = normalizeSearchQuery(sanitizeWikipediaQuery(String(raw || '')))
  if (q0.length < 2) return []
  const cands = new Set()
  cands.add(q0)

  const noIndia = q0.replace(/\s+India$/i, '').trim()
  if (noIndia.length > 1 && noIndia !== q0) cands.add(noIndia)

  const emDash = q0.split(/\s[—–]\s/)
  if (emDash[0] && emDash[0].length > 2) cands.add(emDash[0].trim())
  const hyphen = q0.split(/\s-\s/)
  if (hyphen[0] && hyphen[0].length > 2) cands.add(hyphen[0].trim())
  for (const comma of q0.split(',')) {
    const t = comma.trim()
    if (t.length > 2) cands.add(t)
  }

  const mAfter = q0.match(/[—–-]\s*(.+)$/)
  if (mAfter && mAfter[1].length > 2) {
    const seg = mAfter[1].trim().replace(/[.,;]+$/g, '')
    const segsw = (seg.split(/\s+/).pop() || '').toLowerCase()
    if (!WIKI_STOP.has(segsw) && !WIKIWeak.has(segsw)) cands.add(seg)
  }

  const words = q0.split(/\s+/).filter((w) => w.length)
  for (const k of [1, 2, 3]) {
    if (words.length > k) {
      const tail = words.slice(-k).join(' ')
      const lastW = (tail.split(/\s+/).pop() || '').toLowerCase()
      if (WIKIWeak.has(lastW) || WIKI_STOP.has(lastW)) continue
      if (tail.length > 2) cands.add(tail)
    }
  }
  for (const drop of [1, 2]) {
    if (words.length > drop + 1) {
      const withoutHead = words.slice(drop).join(' ')
      if (withoutHead.length > 2) cands.add(withoutHead)
    }
  }

  if (q0.length > 56) {
    const cut = q0.slice(0, 56)
    const at = Math.max(cut.lastIndexOf(' '), cut.lastIndexOf(','))
    const short = (at > 8 ? q0.slice(0, at) : q0.slice(0, 40)).trim()
    if (short.length > 2) cands.add(short)
  }
  if (q0.length > 22) {
    const first = q0.split(/\s+/)
    for (let n = Math.min(4, first.length - 1); n >= 1; n -= 1) {
      const phrase = first.slice(0, n + 1).join(' ').replace(/,+$/, '')
      if (phrase.length > 2) cands.add(phrase)
    }
  }
  return [...cands]
    .filter((s) => s.length > 1)
    .filter((s) => {
      const parts = String(s)
        .trim()
        .split(/\s+/)
        .map((p) => p.replace(/,+$/, ''))
        .filter((p) => p.length)
      if (parts.length === 1) {
        const w = parts[0].toLowerCase()
        if (w === 'that' || w === 'the' || w === 'this' || WIKI_STOP.has(w) || WIKIWeak.has(w)) return false
      }
      return true
    })
    .slice(0, 16)
}

function stripWikiHtml(s) {
  if (!s) return ''
  return String(s)
    .replace(/<span[^>]*>/gi, ' ')
    .replace(/<\/span>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;|&#x[0-9A-Fa-f]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isDisambiguation(rest) {
  if (!rest || isSummaryMissing(rest)) return false
  const ty = String(rest.type || '')
  if (ty.toLowerCase().includes('disambiguation')) return true
  if (rest.title && /\(disambiguation\)/i.test(rest.title)) return true
  return false
}

function isSummaryMissing(rest) {
  if (!rest) return true
  if (rest.type === 'https://mediawiki.org/wiki/Hypertext/not_found') return true
  return false
}

/** REST summary; skips disambiguation (try next result instead). */
async function fetchWikipediaPageSummaryByTitle(title) {
  if (!title) return null
  const safe = encodeURIComponent(String(title).replace(/ /g, '_'))
  const rest = await fetchJson(`${WIKI_REST}/${safe}`, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  })
  if (isSummaryMissing(rest)) return null
  if (isDisambiguation(rest)) return null
  return {
    title: rest.title,
    extract: rest.extract || rest.description || null,
    url: rest.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${safe}`,
    thumbnail: rest.thumbnail?.source || null,
    source: 'wikipedia',
  }
}

function wikiPageUrlForTitle(title) {
  if (!title) return 'https://en.wikipedia.org'
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(String(title).replace(/ /g, '_'))}`
}

function pickThumb(u) {
  if (!u || typeof u !== 'object') return null
  if (u.source) return u.source
  if (u.url) return u.url
  return null
}

/**
 * Broad title discovery: v1 /search/page often finds what opensearch & strict title search miss.
 */
async function wikipediaSummaryFromQuery(searchQuery, relOpts) {
  const q0 = sanitizeWikipediaQuery(String(searchQuery).trim())
  if (q0.length < 2) return null
  const rel = (pTitle) => wikipediaRelevant(q0, pTitle, relOpts)

  const u = `${WIKI_API}?action=opensearch&search=${encodeURIComponent(q0)}&limit=8&namespace=0&format=json`
  const ft = `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(q0)}&format=json&srlimit=10&utf8=1`
  const tSearch = `${WIKI_V1}/search/title?q=${encodeURIComponent(q0)}&limit=15`
  const pSearch = `${WIKI_V1}/search/page?q=${encodeURIComponent(q0)}&limit=15`
  const [j, data, stTitle, stPage] = await Promise.all([
    fetchJson(u),
    fetchJson(ft),
    fetchJson(tSearch, { headers: { Accept: 'application/json' } }),
    fetchJson(pSearch, { headers: { Accept: 'application/json' } }),
  ])

  const order = []
  const pageHits = []
  if (stPage?.pages?.length) {
    for (const p of stPage.pages) {
      if (p?.title) {
        order.push(p.title)
        pageHits.push(p)
      }
    }
  }
  if (stTitle?.pages?.length) {
    for (const p of stTitle.pages) {
      if (p?.title) order.push(p.title)
    }
  }
  if (j && Array.isArray(j) && j[1]) {
    for (const t of j[1]) {
      if (t) order.push(t)
    }
  }
  const hits = data?.query?.search
  if (Array.isArray(hits)) {
    for (const h of hits) {
      if (h?.title) order.push(h.title)
    }
  }

  const seen = new Set()
  for (const title of order) {
    const t = String(title)
    if (seen.has(t)) continue
    seen.add(t)
    const sum = await fetchWikipediaPageSummaryByTitle(t)
    if (sum && rel(t)) {
      return sum
    }
  }

  for (const p of pageHits) {
    if (!p?.title) continue
    if (!rel(p.title)) continue
    const fromDesc = p.description && String(p.description).length > 10
    const fromEx = p.excerpt && String(p.excerpt).length > 15
    if (!fromDesc && !fromEx) continue
    return {
      title: p.title,
      extract: fromDesc
        ? p.description
        : stripWikiHtml(p.excerpt),
      url: wikiPageUrlForTitle(p.title),
      thumbnail: pickThumb(p.thumbnail),
      source: 'wikipedia',
    }
  }

  return null
}

/**
 * Live weather for a coordinate using Open-Meteo (no API key, free, CORS-OK).
 * Returns current snapshot + 3-day forecast condensed for comparison cards.
 */
async function getCityWeather(label, lat, lon) {
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) return null
  const u =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m' +
    '&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max' +
    '&forecast_days=3&timezone=auto'

  const data = await fetchJson(u)
  const cur = data?.current
  if (!cur) return null

  const days = []
  const d = data.daily || {}
  if (Array.isArray(d.time)) {
    for (let i = 0; i < d.time.length && i < 3; i += 1) {
      days.push({
        date: d.time[i],
        max: Number(d.temperature_2m_max?.[i]) ?? null,
        min: Number(d.temperature_2m_min?.[i]) ?? null,
        code: Number(d.weather_code?.[i]) ?? null,
        precipChance: Number(d.precipitation_probability_max?.[i] ?? 0),
      })
    }
  }

  return {
    label: String(label || ''),
    lat: Number(lat),
    lon: Number(lon),
    timezone: data.timezone || null,
    current: {
      temperature: Number(cur.temperature_2m) ?? null,
      feelsLike: Number(cur.apparent_temperature) ?? null,
      humidity: Number(cur.relative_humidity_2m) ?? null,
      precipitation: Number(cur.precipitation) ?? null,
      wind: Number(cur.wind_speed_10m) ?? null,
      code: Number(cur.weather_code) ?? null,
    },
    forecast: days,
    source: 'open-meteo',
  }
}

/**
 * Real driving distance & time (OSRM public demo — good-faith use only).
 */
async function getOsrmRoute(lon1, lat1, lon2, lat2) {
  const u = `${OSRM}/${lon1},${lat1};${lon2},${lat2}?overview=false`
  const data = await fetchJson(u)
  const r = data?.routes?.[0]
  if (!r) return null
  return {
    distanceM: r.distance,
    distanceKm: Math.round((r.distance / 1000) * 10) / 10,
    durationSec: r.duration,
    durationMin: Math.round(r.duration / 60),
    source: 'osrm',
  }
}

/**
 * English Wikipedia: try several query phrasings, opensearch + fulltext, skip disamb pages.
 */
async function getWikipediaSummary(searchQuery) {
  if (!searchQuery) return null
  const pre = normalizeSearchQuery(sanitizeWikipediaQuery(String(searchQuery)))
  if (pre.length < 2) return null
  for (const candidate of searchQueryCandidates(pre)) {
    const article = await wikipediaSummaryFromQuery(candidate, { fullQuery: pre })
    if (article) return article
  }
  return null
}

/**
 * Tourist attractions from OpenStreetMap (Overpass) near destination.
 */
async function getTopSightsNear(lat, lon) {
  const la = Number(lat)
  const lo = Number(lon)
  if (Number.isNaN(la) || Number.isNaN(lo)) return []
  // Reduced overpass server-side timeout from 20 → 8 s and tightened
  // client-side abort to 9 s so a slow upstream never holds the search.
  const q = `
[out:json][timeout:8];
(
  nwr["tourism"="attraction"](around:35000,${la},${lo});
  nwr["tourism"="museum"](around:25000,${la},${lo});
);
out center 12;
`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 9000)
  let res
  try {
    res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', 'User-Agent': USER_AGENT, Accept: 'application/json' },
      body: q,
      signal: controller.signal,
    })
  } catch {
    clearTimeout(timer)
    return []
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) return []
  const data = await res.json().catch(() => null)
  if (!data) return []
  const elements = data?.elements || []
  const out = []
  for (const el of elements) {
    const tags = el.tags || {}
    const name = tags.name
    if (!name || out.some((o) => o.name === name)) continue
    let clat = el.lat
    let clon = el.lon
    if (el.type === 'way' || el.type === 'relation') {
      clat = el.center?.lat
      clon = el.center?.lon
    }
    if (clat == null || clon == null) continue
    out.push({ name: String(name).slice(0, 120), lat: clat, lon: clon })
    if (out.length >= 8) break
  }
  return out
}

/**
 * Wraps a promise with an overall hard timeout. Whichever side wins,
 * the promise resolves — never throws — so callers can keep going.
 */
function withSoftTimeout(promise, timeoutMs, fallback = null) {
  return new Promise((resolve) => {
    let done = false
    const timer = setTimeout(() => {
      if (done) return
      done = true
      resolve(fallback)
    }, timeoutMs)
    promise.then(
      (v) => { if (done) return; done = true; clearTimeout(timer); resolve(v) },
      () => { if (done) return; done = true; clearTimeout(timer); resolve(fallback) },
    )
  })
}

/**
 * Enrich a trip with OSRM, Wikipedia (destination), and local OSM sights.
 *
 * Every external call gets:
 *   • per-fetch timeout (inside fetchJson / Overpass call)
 *   • per-call soft-timeout wrapper here (extra safety against unhandled hangs)
 *   • Wikipedia is fired in parallel with the others (was sequential — saves ~3 s)
 *   • whole enrichment cannot exceed 9 s; partial data is shipped anyway
 */
async function enrichForComparison(fromC, toC) {
  const PER_CALL_MS = 7000
  const TOTAL_BUDGET_MS = 9000

  const all = Promise.allSettled([
    withSoftTimeout(getOsrmRoute(fromC.lng, fromC.lat, toC.lng, toC.lat), PER_CALL_MS, null),
    withSoftTimeout(getTopSightsNear(toC.lat, toC.lng),                   PER_CALL_MS, []),
    withSoftTimeout(getCityWeather(fromC.label, fromC.lat, fromC.lng),    PER_CALL_MS, null),
    withSoftTimeout(getCityWeather(toC.label, toC.lat, toC.lng),          PER_CALL_MS, null),
    withSoftTimeout(
      (async () => (await getWikipediaSummary(`${toC.label} India`)) || (await getWikipediaSummary(toC.label)))(),
      PER_CALL_MS,
      null,
    ),
  ])

  const settled = await withSoftTimeout(all, TOTAL_BUDGET_MS, [])

  const get = (i, fb) =>
    settled?.[i]?.status === 'fulfilled' ? (settled[i].value ?? fb) : fb

  const o   = get(0, null)
  const s   = get(1, [])
  const oWx = get(2, null)
  const dWx = get(3, null)
  const w   = get(4, null)

  const attributions = [
    'Route time & distance: OSRM (OpenStreetMap data, ODbL).',
    'Place intro: Wikipedia (CC BY-SA).',
    'Sights: OpenStreetMap contributors (ODbL).',
  ]
  if (oWx || dWx) attributions.push('Weather: Open-Meteo (CC BY 4.0).')

  return {
    osrm: o,
    wikipedia: w,
    topSights: Array.isArray(s) ? s : [],
    weather: oWx || dWx ? { origin: oWx, destination: dWx } : null,
    attributions,
  }
}

module.exports = {
  getOsrmRoute,
  getWikipediaSummary,
  getTopSightsNear,
  getCityWeather,
  enrichForComparison,
}
