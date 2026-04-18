/**
 * Curated "fast path" list of Indian cities for instant client-side filtering
 * (used while the backend request is in-flight). The full canonical list lives
 * in Postgres on the server; we call /api/cities for the real search.
 */
import api from '../api/client'

export const INDIAN_CITIES = [
  // Metros & capitals
  'Mumbai', 'Delhi', 'New Delhi', 'Bangalore', 'Bengaluru', 'Hyderabad',
  'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow',
  'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Patna', 'Vadodara', 'Chandigarh',
  'Thiruvananthapuram', 'Kochi', 'Guwahati', 'Dehradun', 'Shimla', 'Srinagar',
  'Ranchi', 'Bhubaneswar', 'Raipur', 'Gandhinagar', 'Panaji', 'Gangtok',
  'Shillong', 'Aizawl', 'Kohima', 'Imphal', 'Itanagar', 'Agartala', 'Dispur',
  'Amaravati', 'Leh', 'Jammu', 'Port Blair', 'Kavaratti', 'Puducherry',

  // Iconic destinations
  'Goa', 'Manali', 'Darjeeling', 'Ooty', 'Kodaikanal', 'Munnar', 'Coorg',
  'Rishikesh', 'Haridwar', 'Udaipur', 'Jaisalmer', 'Pushkar', 'Ajmer',
  'Mount Abu', 'Spiti', 'Kasol', 'Dharamshala', 'McLeod Ganj', 'Mussoorie',
  'Nainital', 'Auli', 'Pahalgam', 'Gulmarg', 'Sonamarg', 'Alleppey',
  'Thekkady', 'Kovalam', 'Varkala', 'Puri', 'Konark', 'Lonavala',
  'Mahabaleshwar', 'Matheran', 'Pachmarhi', 'Chikmagalur', 'Hampi',
  'Khajuraho', 'Orchha', 'Maheshwar', 'Omkareshwar', 'Kanyakumari',
  'Rameswaram', 'Madurai', 'Thanjavur', 'Mahabalipuram', 'Tirupati',
  'Gokarna', 'Udupi', 'Mangalore', 'Alibag', 'Diu', 'Daman', 'Kaziranga',
  'Tawang', 'Havelock', 'Neil Island', 'Pangong Lake', 'Nubra Valley',
  'Kargil', 'Kedarnath', 'Badrinath', 'Gangotri', 'Yamunotri', 'Bodh Gaya',
  'Mathura', 'Vrindavan', 'Ayodhya', 'Varanasi', 'Sarnath', 'Amritsar',
  'Somnath', 'Dwarka', 'Palitana', 'Vaishno Devi', 'Katra', 'Shirdi',
  'Nashik', 'Aurangabad', 'Agra', 'Mysore', 'Mysuru', 'Jodhpur', 'Bikaner',
  'Bharatpur', 'Sawai Madhopur', 'Chittorgarh', 'Kumbhalgarh',
]

const unique = [...new Set(INDIAN_CITIES)].sort((a, b) => a.localeCompare(b))
export const CITIES = unique

/**
 * Server-side search: hits /api/cities which merges Postgres + Nominatim.
 * Returns [{ name, state, lat, lng, type, source }]. Safe against timeouts.
 */
export async function searchCitiesAPI(query) {
  const q = (query || '').trim()
  if (q.length < 2) return []
  try {
    const { data } = await api.get('/cities', { params: { q, limit: 12 } })
    return (data?.results || []).map((r) => ({
      name: r.name,
      state: r.state,
      stateCode: r.stateCode,
      type: r.type,
      lat: r.lat,
      lng: r.lng,
      source: r.source,
      popularity: r.popularity,
    }))
  } catch {
    return []
  }
}

/** Sync filter for the curated list — used for instant results while API call runs. */
export function filterCitiesSync(query, exclude = '') {
  const q = String(query || '').toLowerCase().trim()
  const ex = String(exclude || '').toLowerCase().trim()
  const scored = []
  for (const c of CITIES) {
    const name = c.toLowerCase()
    if (ex && name === ex) continue
    if (!q) { scored.push({ c, s: 3 }); continue }
    if (name === q) scored.push({ c, s: 0 })
    else if (name.startsWith(q)) scored.push({ c, s: 1 })
    else if (name.includes(q)) scored.push({ c, s: 2 })
  }
  return scored.sort((a, b) => a.s - b.s || a.c.localeCompare(b.c)).map((x) => x.c)
}
