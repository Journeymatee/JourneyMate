/**
 * Trip-type and vibe taxonomy — labels & icons only.
 *
 * The backend (`backend/src/modules/trips/tripVibe.engine.js`) is the source
 * of truth for *price multipliers, accommodation copy, and perks*. This file
 * keeps just the chip metadata so the picker and the "Tuned for" badge stay
 * in lock-step across HeroSearch and ComparisonPage.
 */

export const TRIP_TYPES = [
  {
    id: 'solo', icon: '🎒', label: 'Solo trip', short: 'Solo',
    blurb: 'Just you, your own pace.',
    gradient: 'from-cyan-500/25 via-sky-500/15 to-transparent',
    accent: 'text-cyan-300', ring: 'ring-cyan-400/40', border: 'border-cyan-400/40',
  },
  {
    id: 'couple', icon: '💑', label: 'Couple', short: 'Couple',
    blurb: 'Romantic, cosy stays.',
    gradient: 'from-rose-500/25 via-pink-500/15 to-transparent',
    accent: 'text-rose-300', ring: 'ring-rose-400/40', border: 'border-rose-400/40',
  },
  {
    id: 'family', icon: '👨‍👩‍👧', label: 'Family', short: 'Family',
    blurb: 'Kid-friendly, safe & easy.',
    gradient: 'from-emerald-500/25 via-green-500/15 to-transparent',
    accent: 'text-emerald-300', ring: 'ring-emerald-400/40', border: 'border-emerald-400/40',
  },
  {
    id: 'friends', icon: '👯', label: 'Friends', short: 'Friends',
    blurb: 'Group fun, vibe stays.',
    gradient: 'from-amber-500/25 via-orange-500/15 to-transparent',
    accent: 'text-amber-300', ring: 'ring-amber-400/40', border: 'border-amber-400/40',
  },
]

/** Vibes are multi-select. Order = how they render. */
export const VIBES_BY_TYPE = {
  solo: [
    { id: 'budget',     icon: '🛏️',  label: 'Budget hostel' },
    { id: 'workation',  icon: '💻',  label: 'Workation' },
    { id: 'spiritual',  icon: '🧘',  label: 'Spiritual' },
    { id: 'adventure',  icon: '🧗',  label: 'Adventure' },
  ],
  couple: [
    { id: 'beach',      icon: '🏖️',  label: 'Beach view' },
    { id: 'romantic',   icon: '🌹',  label: 'Romantic' },
    { id: 'handmade',   icon: '🛖',  label: 'Private cabin' },
    { id: 'best',       icon: '👑',  label: 'Best room' },
  ],
  family: [
    { id: 'villa',       icon: '🏡',  label: 'Family villa' },
    { id: 'kidfriendly', icon: '🧸',  label: 'Kid-friendly' },
    { id: 'pool',        icon: '🏊',  label: 'Pool stay' },
    { id: 'safe',        icon: '🛡️',  label: 'Safe area' },
  ],
  friends: [
    { id: 'shared',     icon: '🛏️',  label: 'Shared villa' },
    { id: 'nightlife',  icon: '🎉',  label: 'Nightlife' },
    { id: 'adventure',  icon: '🧗',  label: 'Adventure' },
    { id: 'foodie',     icon: '🍜',  label: 'Foodie crawl' },
  ],
}

/** Helper to find a TRIP_TYPES entry by id. */
export function findTripType(id) {
  return TRIP_TYPES.find((t) => t.id === id) || null
}
