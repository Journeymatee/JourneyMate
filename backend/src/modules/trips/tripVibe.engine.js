'use strict'

/**
 * Pure-function engine that takes a baseline trip plan and a (tripType, vibes)
 * tuple and returns a new plan with:
 *   • Prices scaled (one multiplier per trip type + per vibe).
 *   • Accommodation copy overridden where a (type,vibe,tier) overlay exists.
 *   • Vibe-specific perks merged on top of the plan's defaults.
 *   • A stable badge label echoing the active selection back to the client.
 *
 * Frontend mirror lives in `frontend/src/data/tripVibes.js` for instant UI
 * feedback. Backend remains the source of truth for prices.
 *
 * Why immutable spreads everywhere — the upstream `trip.service` cache may
 * reuse the same baseline object for many concurrent requests; mutating it
 * would leak per-user overrides.
 */

const TRIP_TYPES = new Set(['solo', 'couple', 'family', 'friends'])

/* ── per-type baseline multipliers ─────────────────────────────── */
/** Reflects the *occupancy* difference more than luxury — e.g. solo
 *  travellers split nothing, families pay extra for bigger rooms. */
const TYPE_MULTIPLIER = {
  solo:    { silver: 0.78, gold: 0.88 },
  couple:  { silver: 1.00, gold: 1.05 },
  family:  { silver: 1.40, gold: 1.55 },
  friends: { silver: 1.20, gold: 1.30 },
}

/* ── per-vibe overlays (multipliers + copy + perks) ────────────── */
/** Multipliers compose multiplicatively (clamped). Copy uses the FIRST
 *  selected vibe; perks deduplicate from all selected vibes. */
const VIBE = {
  /* couple ----------------------------------------------------- */
  'couple/beach': {
    mult:  { silver: 1.08, gold: 1.18 },
    accommodation:        { silver: 'Sea-View Beach Stay',     gold: 'Luxury Beachfront Suite' },
    accommodation_detail: {
      silver: 'Sea-facing room at a beachside guesthouse — wake up to the waves and walk straight to the sand.',
      gold:   'Beachfront suite with private balcony, plunge pool & sunset terrace overlooking the shore.',
    },
    perks: ['Sea-facing balcony', 'Sunset cocktail for two'],
  },
  'couple/romantic': {
    mult:  { silver: 1.10, gold: 1.20 },
    accommodation:        { silver: 'Romantic Cosy Stay',      gold: 'Honeymoon Suite' },
    accommodation_detail: {
      silver: 'Cosy boutique room with bedroom décor for two, mood lighting and a turn-down service.',
      gold:   'Honeymoon suite — rose-petal turn-down, private dining, couple spa session and sunset deck.',
    },
    perks: ['Candle-light dinner', 'Rose-petal bed décor', 'Couple massage voucher'],
  },
  'couple/handmade': {
    mult:  { silver: 1.12, gold: 1.22 },
    accommodation:        { silver: 'Private Wooden Cabin',    gold: 'Handcrafted Luxury Villa' },
    accommodation_detail: {
      silver: 'Hand-built wooden cabin tucked in nature — privacy guaranteed, no shared walls or hallways.',
      gold:   'Hand-crafted private villa — heritage carpentry, in-villa dining, butler service.',
    },
    perks: ['Private deck', 'In-cabin dining', 'No shared walls'],
  },
  'couple/best': {
    mult:  { silver: 1.18, gold: 1.35 },
    accommodation:        { silver: 'Top-rated Boutique Room', gold: 'Presidential Suite' },
    accommodation_detail: {
      silver: 'Highest-rated room category at a top-reviewed property — the room your friends will ask about.',
      gold:   'Presidential suite — the best room in the house, butler, priority everything, premium turn-down.',
    },
    perks: ['Suite upgrade subject to availability', 'Priority check-in'],
  },

  /* solo ------------------------------------------------------- */
  'solo/budget': {
    mult:  { silver: 0.85, gold: 0.92 },
    accommodation:        { silver: 'Backpacker Hostel',       gold: 'Boutique Solo Room' },
    accommodation_detail: {
      silver: 'Clean backpacker dorm or single — meet other travellers in the lounge, free breakfast in the kitchen.',
      gold:   'Boutique single room with co-traveller events & curated solo experiences.',
    },
    perks: ['Common lounge & meet-ups'],
  },
  'solo/workation': {
    mult:  { silver: 1.05, gold: 1.10 },
    accommodation:        { silver: 'Workation Stay',          gold: 'Premium Workation Suite' },
    accommodation_detail: {
      silver: 'Fast WiFi, ergonomic desk and quiet hours — built for remote work without sacrificing the trip.',
      gold:   'Suite with dedicated office, 200+ Mbps WiFi, printing, call rooms and 24×7 quiet floor.',
    },
    perks: ['200+ Mbps WiFi', 'Co-work lounge access', 'Quiet hours till 10am'],
  },
  'solo/spiritual': {
    mult:  { silver: 0.95, gold: 1.05 },
    accommodation:        { silver: 'Ashram / Retreat Stay',   gold: 'Wellness Retreat Suite' },
    accommodation_detail: {
      silver: 'Simple ashram-style room near temples & meditation hall — sattvic meals included.',
      gold:   'Wellness retreat suite — daily yoga, ayurveda meals, guided meditation with senior teachers.',
    },
    perks: ['Daily yoga', 'Sattvic meals', 'Meditation hall access'],
  },
  'solo/adventure': {
    mult:  { silver: 1.10, gold: 1.18 },
    accommodation:        { silver: 'Adventure Base Camp',     gold: 'Premium Adventure Lodge' },
    accommodation_detail: {
      silver: 'Base-camp tents or rooms close to trek trailheads & gear rental shops.',
      gold:   'Premium adventure lodge — gear locker, certified guides, hot showers post-trek.',
    },
    perks: ['Gear locker', 'Trek briefings'],
  },

  /* family ----------------------------------------------------- */
  'family/villa': {
    mult:  { silver: 1.20, gold: 1.30 },
    accommodation:        { silver: 'Family-Sized Suite',      gold: 'Private Family Villa' },
    accommodation_detail: {
      silver: 'Two-bedroom family suite that fits 4–6 with shared sitting area and kitchenette.',
      gold:   'Private 3BR villa with kitchen, lawn & dedicated host — perfect for the whole family.',
    },
    perks: ['Sleeps 4–6', 'Kitchenette / private dining'],
  },
  'family/kidfriendly': {
    mult:  { silver: 1.05, gold: 1.10 },
    accommodation:        { silver: 'Kid-friendly Hotel',      gold: 'Premium Family Resort' },
    accommodation_detail: {
      silver: "Hotel with a kids' play area, child menus and stroller-friendly access throughout.",
      gold:   "Family resort with kids' club, baby-sitting on request and child-safe pool & dining.",
    },
    perks: ["Kids' play area", 'Child menus', 'Baby cot on request'],
  },
  'family/pool': {
    mult:  { silver: 1.10, gold: 1.20 },
    accommodation:        { silver: 'Pool-side Stay',          gold: 'Private Pool Villa' },
    accommodation_detail: {
      silver: 'Pool-side room — kids can splash without leaving the property, towels included.',
      gold:   'Private pool villa — your own pool, fenced, gated and chlorine-light for sensitive skin.',
    },
    perks: ['Pool towels & loungers', "Kids' shallow zone"],
  },
  'family/safe': {
    mult:  { silver: 1.05, gold: 1.10 },
    accommodation:        { silver: 'Safe-area Hotel',         gold: 'Gated Premium Property' },
    accommodation_detail: {
      silver: 'Hotel in a low-traffic, well-lit neighbourhood — easy taxis at any hour.',
      gold:   'Gated premium property with 24×7 security, CCTV, and on-call doctor.',
    },
    perks: ['24×7 security', 'On-call doctor'],
  },

  /* friends ---------------------------------------------------- */
  'friends/shared': {
    mult:  { silver: 0.90, gold: 1.05 },
    accommodation:        { silver: 'Group Hostel',            gold: 'Private Group Villa' },
    accommodation_detail: {
      silver: 'Group hostel rooms or shared dorm — sleeps 6–8, common kitchen and lounge.',
      gold:   'Private 4–6BR villa for the squad — full house, BBQ, music allowed.',
    },
    perks: ['Sleeps the whole squad', 'Common lounge'],
  },
  'friends/nightlife': {
    mult:  { silver: 1.08, gold: 1.18 },
    accommodation:        { silver: 'Stay near Nightlife',     gold: 'Premium Hotel · Nightlife Hub' },
    accommodation_detail: {
      silver: 'Walking distance from popular bars, clubs and late-night food joints.',
      gold:   'Premium hotel right at the nightlife hub — late checkout, club passes, valet on call.',
    },
    perks: ['Late checkout 1pm', 'Walking distance to bars'],
  },
  'friends/adventure': {
    mult:  { silver: 1.10, gold: 1.18 },
    accommodation:        { silver: 'Adventure Stay',          gold: 'Premium Adventure Lodge' },
    accommodation_detail: {
      silver: 'Group-friendly adventure stay close to trek/raft/dive operators with shared dorms.',
      gold:   'Premium adventure lodge with group activities, certified guides, and gear room.',
    },
    perks: ['Group adventure deals', 'Gear rentals on-site'],
  },
  'friends/foodie': {
    mult:  { silver: 1.05, gold: 1.12 },
    accommodation:        { silver: 'Foodie-quarter Stay',     gold: 'Hotel · Chef Tasting Tier' },
    accommodation_detail: {
      silver: 'Stay in the food district — every cuisine within a 10-minute walk, food-walk maps included.',
      gold:   'Hotel with private chef tasting menu and curated food walks led by local chefs.',
    },
    perks: ['Foodie walking map', 'Local chef tasting'],
  },
}

/* ────────────────────────────────────────────────────────────── */

const VIBES_BY_TYPE = {
  solo:    ['budget', 'workation', 'spiritual', 'adventure'],
  couple:  ['beach', 'romantic', 'handmade', 'best'],
  family:  ['villa', 'kidfriendly', 'pool', 'safe'],
  friends: ['shared', 'nightlife', 'adventure', 'foodie'],
}

/** Coerce raw query input — strings/arrays — into a clean string array. */
function normalizeVibes(raw) {
  if (raw == null) return []
  const list = Array.isArray(raw)
    ? raw
    : String(raw).split(',')
  const seen = new Set()
  const out = []
  for (const v of list) {
    const s = String(v).trim().toLowerCase()
    if (!s) continue
    if (seen.has(s)) continue
    seen.add(s)
    out.push(s)
    if (out.length >= 6) break
  }
  return out
}

/** Validates and normalises (tripType, vibes) — drops unknown vibes silently. */
function normalizeSelection(rawType, rawVibes) {
  const t = String(rawType || '').trim().toLowerCase()
  const tripType = TRIP_TYPES.has(t) ? t : null
  const all = normalizeVibes(rawVibes)
  if (!tripType) return { tripType: null, vibes: [] }
  const allowed = new Set(VIBES_BY_TYPE[tripType] || [])
  const vibes = all.filter((v) => allowed.has(v))
  return { tripType, vibes }
}

/** Round to nearest hundred; clamp by per-tier floor so prices stay sensible. */
function roundPrice(raw, tier) {
  const floor = tier === 'gold' ? 4000 : 2000
  return Math.max(floor, Math.round(Number(raw) / 100) * 100)
}

/** Compute final multiplier for a tier given selection. Caps prevent runaway. */
function computeMultiplier(tier, tripType, vibes) {
  if (!tripType) return 1
  const base = TYPE_MULTIPLIER[tripType]?.[tier] ?? 1
  let m = base
  for (const v of vibes) {
    const overlay = VIBE[`${tripType}/${v}`]
    if (!overlay) continue
    m *= overlay.mult?.[tier] ?? 1
  }
  // Clamp between 0.5x and 2.5x of the original list price.
  return Math.min(2.5, Math.max(0.5, m))
}

/** Apply (tripType, vibes) to a single plan. Pure — never mutates input. */
function applyToPlan(plan, tier, tripType, vibes) {
  if (!plan || typeof plan !== 'object') return plan
  if (!tripType || vibes.length === 0) {
    // Even with no vibes, a trip type still rescales price.
    if (tripType) {
      const m = computeMultiplier(tier, tripType, [])
      const next = { ...plan }
      if (Number.isFinite(Number(plan.price))) {
        next.price = roundPrice(Number(plan.price) * m, tier)
      }
      return next
    }
    return plan
  }

  const m = computeMultiplier(tier, tripType, vibes)
  const primaryKey = `${tripType}/${vibes[0]}`
  const primary = VIBE[primaryKey] || {}

  const seen = new Set((plan.perks || []).map((p) => String(p).toLowerCase()))
  const extras = []
  for (const v of vibes) {
    const overlay = VIBE[`${tripType}/${v}`]
    if (!overlay?.perks) continue
    for (const p of overlay.perks) {
      const k = String(p).toLowerCase()
      if (seen.has(k)) continue
      seen.add(k)
      extras.push(p)
      if (extras.length >= 6) break
    }
    if (extras.length >= 6) break
  }

  const next = { ...plan }
  if (Number.isFinite(Number(plan.price))) {
    next.price = roundPrice(Number(plan.price) * m, tier)
  }
  if (primary.accommodation?.[tier]) {
    next.accommodation = primary.accommodation[tier]
  }
  if (primary.accommodation_detail?.[tier]) {
    next.accommodation_detail = primary.accommodation_detail[tier]
  }
  if (extras.length > 0) {
    next.perks = [...extras, ...(plan.perks || [])]
  }
  return next
}

/**
 * Apply a (tripType, vibes) selection to a complete trip object.
 *
 * @param {object} trip   The baseline trip from `trip.service.search()`.
 * @param {string|null} tripType  One of solo|couple|family|friends or null.
 * @param {string[]} vibes        Vibe ids (already validated against tripType).
 * @returns {object} A new trip object — original is never mutated.
 */
function applyToTrip(trip, tripType, vibes) {
  if (!trip || typeof trip !== 'object') return trip
  const safeVibes = Array.isArray(vibes) ? vibes : []
  const silver = applyToPlan(trip.silver, 'silver', tripType, safeVibes)
  const gold   = applyToPlan(trip.gold,   'gold',   tripType, safeVibes)
  return {
    ...trip,
    silver,
    gold,
    tripType: tripType || null,
    vibes: safeVibes,
  }
}

module.exports = {
  TRIP_TYPES: Array.from(TRIP_TYPES),
  VIBES_BY_TYPE,
  normalizeSelection,
  normalizeVibes,
  applyToTrip,
  applyToPlan,
  computeMultiplier,
}
