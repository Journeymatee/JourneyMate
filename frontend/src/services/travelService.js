import api from '../api/client'
export { CITIES } from '../data/indianCities'

export const searchTrip = async (from, to) => {
  const { data } = await api.get('/trips/search', {
    params: { from: from.trim(), to: to.trim() },
  })
  return data
}

/**
 * Quick-search shortcuts shown on the hero section.
 * Covers the most-searched Indian routes — each triggers
 * a full backend search with curated real data.
 */
export const POPULAR_DESTINATIONS = [
  { from: 'Delhi',     to: 'Goa',       emoji: '🏖️', tag: 'Beach'    },
  { from: 'Mumbai',    to: 'Goa',       emoji: '🌊', tag: 'Weekend'  },
  { from: 'Delhi',     to: 'Manali',    emoji: '🏔️', tag: 'Mountains'},
  { from: 'Delhi',     to: 'Jaipur',    emoji: '🏰', tag: 'Heritage' },
  { from: 'Delhi',     to: 'Rishikesh', emoji: '🧘', tag: 'Adventure'},
  { from: 'Bangalore', to: 'Goa',       emoji: '🌴', tag: 'Beach'    },
  { from: 'Mumbai',    to: 'Udaipur',   emoji: '🏛️', tag: 'Royal'   },
  { from: 'Delhi',     to: 'Amritsar',  emoji: '🕉️', tag: 'Spiritual'},
  { from: 'Hyderabad', to: 'Varanasi',  emoji: '⛵', tag: 'Spiritual'},
  { from: 'Kolkata',   to: 'Darjeeling',emoji: '🍵', tag: 'Hills'   },
]
