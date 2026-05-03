'use strict'

/**
 * Place-aware music suggestions.
 *
 * Strategy (cheap → smart):
 *   1. Curated map of (place, vibe) → mood + handpicked Indian tracks. Always
 *      returns something instantly for the most-searched destinations, even
 *      offline / without an LLM key.
 *   2. If `AI_API_KEY` is set, ask the LLM for a JSON list of tracks tuned to
 *      (destination, tripType, vibe). Lets the feature work for *any* place,
 *      not just the curated ones. We merge with the curated list and dedupe.
 *   3. Build provider *search* URLs (Spotify / YouTube Music / YouTube /
 *      Apple Music). These open real, playable results without any provider
 *      OAuth dance — zero secrets to manage.
 *
 * Output is cached in-memory by (placeKey|vibeKey|tripTypeKey) for ~1 hour to
 * shield us from LLM calls on repeat visits to the same comparison page.
 */

const env = require('../../config/env')

/* ────────────────────────────────────────────────────────────────── *
 * 1. Curated playlists                                                *
 * ────────────────────────────────────────────────────────────────── */

/** Tracks are intentionally well-known so a click-through search resolves. */
const CURATED = {
  goa: {
    region: 'Goa',
    moods: ['beach', 'sunset', 'chill', 'house', 'trance'],
    tracks: [
      { title: 'Mhara Holiya Mein',     artist: 'Susheela Raman',         language: 'Hindi/Folk',  mood: 'sunset' },
      { title: 'Khoya Khoya Chand',     artist: 'Pritam, Shaan, Shantanu', language: 'Hindi',      mood: 'chill' },
      { title: 'Kya Yahi Pyar Hai',     artist: 'Kishore Kumar',          language: 'Hindi',       mood: 'retro-romance' },
      { title: 'Sun Saathiya',          artist: 'Priya Saraiya, Divya',   language: 'Hindi',       mood: 'beach-romance' },
      { title: 'Goa Beach',             artist: 'Tony Kakkar, Neha Kakkar', language: 'Hindi',     mood: 'party' },
      { title: 'Lungi Dance',           artist: 'Yo Yo Honey Singh',      language: 'Hindi',       mood: 'party' },
    ],
  },
  manali: {
    region: 'Himachal / Manali',
    moods: ['mountain', 'roadtrip', 'indie', 'acoustic'],
    tracks: [
      { title: 'Yeh Ishq Hai',          artist: 'Shreya Ghoshal',         language: 'Hindi',       mood: 'romance' },
      { title: 'Ilahi',                 artist: 'Arijit Singh',           language: 'Hindi',       mood: 'roadtrip' },
      { title: 'Patakha Guddi',         artist: 'Nooran Sisters',         language: 'Punjabi',     mood: 'roadtrip' },
      { title: 'Manali Trance',         artist: 'Yo Yo Honey Singh, Neha', language: 'Hindi',      mood: 'party' },
      { title: 'Phir Se Ud Chala',      artist: 'Mohit Chauhan',          language: 'Hindi',       mood: 'mountains' },
      { title: 'Hawayein',              artist: 'Arijit Singh',           language: 'Hindi',       mood: 'romance' },
    ],
  },
  shimla: {
    region: 'Himachal / Shimla',
    moods: ['mountain', 'mist', 'cozy', 'acoustic'],
    tracks: [
      { title: 'Phir Se Ud Chala',      artist: 'Mohit Chauhan',          language: 'Hindi',       mood: 'mountains' },
      { title: 'Tum Ho',                artist: 'Mohit Chauhan',          language: 'Hindi',       mood: 'cozy' },
      { title: 'Khamoshiyan',           artist: 'Arijit Singh',           language: 'Hindi',       mood: 'mist' },
      { title: 'O Re Piya',             artist: 'Rahat Fateh Ali Khan',   language: 'Hindi',       mood: 'cozy' },
    ],
  },
  jaipur: {
    region: 'Rajasthan / Jaipur',
    moods: ['heritage', 'royal', 'folk', 'rajasthani'],
    tracks: [
      { title: 'Nimbooda',              artist: 'Kavita Krishnamurthy',   language: 'Hindi/Folk',  mood: 'royal' },
      { title: 'Padharo Mhare Des',     artist: 'Reshma',                 language: 'Rajasthani',  mood: 'folk' },
      { title: 'Choodi Jo Khanki',      artist: 'Falguni Pathak',         language: 'Hindi',       mood: 'heritage' },
      { title: 'Kesariya',              artist: 'Arijit Singh',           language: 'Hindi',       mood: 'royal' },
      { title: 'Ghoomar',               artist: 'Shreya Ghoshal',         language: 'Hindi/Folk',  mood: 'royal' },
    ],
  },
  jaisalmer: {
    region: 'Rajasthan / Jaisalmer',
    moods: ['desert', 'folk', 'rajasthani', 'sunset'],
    tracks: [
      { title: 'Kesariya Balam',        artist: 'Mame Khan',              language: 'Rajasthani',  mood: 'desert' },
      { title: 'Damadam Mast Kalandar', artist: 'Wadali Brothers',        language: 'Sufi',        mood: 'folk' },
      { title: 'Padharo Mhare Des',     artist: 'Reshma',                 language: 'Rajasthani',  mood: 'folk' },
      { title: 'Nimbooda',              artist: 'Kavita Krishnamurthy',   language: 'Hindi/Folk',  mood: 'royal' },
    ],
  },
  udaipur: {
    region: 'Rajasthan / Udaipur',
    moods: ['heritage', 'lake', 'royal', 'romantic'],
    tracks: [
      { title: 'Kesariya',              artist: 'Arijit Singh',           language: 'Hindi',       mood: 'romance' },
      { title: 'Jodha Akbar Theme',     artist: 'A. R. Rahman',           language: 'Instrumental',mood: 'royal' },
      { title: 'Albela Sajan',          artist: 'Shankar Mahadevan',      language: 'Hindi',       mood: 'royal' },
      { title: 'Tum Hi Ho',             artist: 'Arijit Singh',           language: 'Hindi',       mood: 'romance' },
    ],
  },
  varanasi: {
    region: 'Uttar Pradesh / Varanasi',
    moods: ['spiritual', 'devotional', 'sitar', 'ghats'],
    tracks: [
      { title: 'Allah Ke Bande',        artist: 'Kailash Kher',           language: 'Hindi',       mood: 'devotional' },
      { title: 'O Saiyyan',             artist: 'Roop Kumar Rathod',      language: 'Hindi',       mood: 'spiritual' },
      { title: 'Khwaja Mere Khwaja',    artist: 'A. R. Rahman',           language: 'Sufi',        mood: 'spiritual' },
      { title: 'Raag Bhairavi',         artist: 'Pt. Ravi Shankar',       language: 'Instrumental',mood: 'sitar' },
    ],
  },
  rishikesh: {
    region: 'Uttarakhand / Rishikesh',
    moods: ['spiritual', 'yoga', 'flute', 'ganga'],
    tracks: [
      { title: 'Om Namah Shivaya',      artist: 'Krishna Das',            language: 'Sanskrit',    mood: 'spiritual' },
      { title: 'Hanuman Chalisa',       artist: 'Hariharan',              language: 'Hindi',       mood: 'devotional' },
      { title: 'Vande Mataram',         artist: 'A. R. Rahman',           language: 'Sanskrit',    mood: 'spiritual' },
      { title: 'Iktara',                artist: 'Kavita Seth',            language: 'Hindi',       mood: 'flute' },
    ],
  },
  amritsar: {
    region: 'Punjab / Amritsar',
    moods: ['gurudwara', 'devotional', 'sikh-shabad', 'punjabi'],
    tracks: [
      { title: 'Ik Onkar',              artist: 'Harshdeep Kaur',         language: 'Punjabi/Sikh',mood: 'shabad' },
      { title: 'Tu Mane Ya Na Mane',    artist: 'Anand Bakshi',           language: 'Hindi',       mood: 'devotional' },
      { title: 'Mitran Di Chhatri',     artist: 'Babbu Maan',             language: 'Punjabi',     mood: 'punjabi' },
      { title: 'Sadda Haq',             artist: 'Mohit Chauhan',          language: 'Hindi',       mood: 'punjabi' },
    ],
  },
  darjeeling: {
    region: 'West Bengal / Darjeeling',
    moods: ['mountain', 'tea', 'misty', 'acoustic'],
    tracks: [
      { title: 'Phir Se Ud Chala',      artist: 'Mohit Chauhan',          language: 'Hindi',       mood: 'mountains' },
      { title: 'Tu Hi Re',              artist: 'Hariharan, Kavita',      language: 'Hindi',       mood: 'mist' },
      { title: 'Dancing in Air',        artist: 'A. R. Rahman',           language: 'Instrumental',mood: 'tea-garden' },
    ],
  },
  ladakh: {
    region: 'Ladakh',
    moods: ['mountain', 'roadtrip', 'high-altitude', 'cinematic'],
    tracks: [
      { title: 'Patakha Guddi',         artist: 'Nooran Sisters',         language: 'Punjabi',     mood: 'roadtrip' },
      { title: 'Ilahi',                 artist: 'Arijit Singh',           language: 'Hindi',       mood: 'roadtrip' },
      { title: 'Senorita',              artist: 'Farhan Akhtar, Hrithik', language: 'Hindi/Spanish',mood: 'roadtrip' },
      { title: 'Phir Se Ud Chala',      artist: 'Mohit Chauhan',          language: 'Hindi',       mood: 'mountains' },
    ],
  },
  kerala: {
    region: 'Kerala',
    moods: ['backwater', 'coconut', 'monsoon', 'soulful'],
    tracks: [
      { title: 'Jiya Jale',             artist: 'Lata Mangeshkar',        language: 'Hindi/Malayalam',mood: 'backwater' },
      { title: 'Munbe Vaa',             artist: 'A. R. Rahman, Shreya',   language: 'Tamil',       mood: 'romance' },
      { title: 'Vinmeen Vidiyum',       artist: 'Sushin Shyam',           language: 'Malayalam',   mood: 'soulful' },
    ],
  },
  munnar: {
    region: 'Kerala / Munnar',
    moods: ['tea-garden', 'mist', 'romantic', 'cool'],
    tracks: [
      { title: 'Tum Hi Ho',             artist: 'Arijit Singh',           language: 'Hindi',       mood: 'romance' },
      { title: 'Munbe Vaa',             artist: 'Shreya Ghoshal',         language: 'Tamil',       mood: 'romance' },
      { title: 'Hawayein',              artist: 'Arijit Singh',           language: 'Hindi',       mood: 'romance' },
    ],
  },
  alleppey: {
    region: 'Kerala / Alleppey',
    moods: ['backwater', 'houseboat', 'coconut', 'sunset'],
    tracks: [
      { title: 'Jiya Jale',             artist: 'Lata Mangeshkar',        language: 'Hindi/Malayalam',mood: 'backwater' },
      { title: 'Vinmeen Vidiyum',       artist: 'Sushin Shyam',           language: 'Malayalam',   mood: 'soulful' },
      { title: 'Tum Hi Ho',             artist: 'Arijit Singh',           language: 'Hindi',       mood: 'romance' },
    ],
  },
  pondicherry: {
    region: 'Pondicherry',
    moods: ['beach', 'french-quarter', 'cafe', 'indie'],
    tracks: [
      { title: 'Kun Faya Kun',          artist: 'A. R. Rahman',           language: 'Hindi/Sufi',  mood: 'soulful' },
      { title: 'Phir Le Aaya Dil',      artist: 'Arijit Singh',           language: 'Hindi',       mood: 'cafe' },
      { title: 'Tum Se Hi',             artist: 'Mohit Chauhan',          language: 'Hindi',       mood: 'cafe' },
    ],
  },
  delhi: {
    region: 'Delhi',
    moods: ['urban', 'street', 'qawwali', 'old-delhi'],
    tracks: [
      { title: 'Dilli Wali Girlfriend', artist: 'Arijit Singh, Sunidhi',  language: 'Hindi',       mood: 'urban' },
      { title: 'Yaar Mod Do',           artist: 'Guru Randhawa',          language: 'Hindi',       mood: 'street' },
      { title: 'Kun Faya Kun',          artist: 'A. R. Rahman',           language: 'Hindi/Sufi',  mood: 'qawwali' },
    ],
  },
  mumbai: {
    region: 'Mumbai',
    moods: ['monsoon', 'urban', 'local', 'bollywood'],
    tracks: [
      { title: 'Yeh Hai Bombay Meri Jaan', artist: 'Geeta Dutt, Mohd. Rafi', language: 'Hindi',    mood: 'classic' },
      { title: 'Aapka Kya Hoga',        artist: 'Kishore Kumar',          language: 'Hindi',       mood: 'classic' },
      { title: 'Senorita',              artist: 'Farhan Akhtar, Hrithik', language: 'Hindi',       mood: 'urban' },
      { title: 'Phir Se Ud Chala',      artist: 'Mohit Chauhan',          language: 'Hindi',       mood: 'monsoon' },
    ],
  },
  hampi: {
    region: 'Karnataka / Hampi',
    moods: ['ruins', 'ancient', 'instrumental', 'cinematic'],
    tracks: [
      { title: 'Bahubali Theme',        artist: 'M. M. Keeravani',        language: 'Instrumental',mood: 'cinematic' },
      { title: 'Khwaja Mere Khwaja',    artist: 'A. R. Rahman',           language: 'Sufi',        mood: 'spiritual' },
      { title: 'Vande Mataram',         artist: 'A. R. Rahman',           language: 'Sanskrit',    mood: 'cinematic' },
    ],
  },
  hyderabad: {
    region: 'Telangana / Hyderabad',
    moods: ['nawabi', 'biryani', 'qawwali', 'urban'],
    tracks: [
      { title: 'Khwaja Mere Khwaja',    artist: 'A. R. Rahman',           language: 'Sufi',        mood: 'qawwali' },
      { title: 'Senorita',              artist: 'Farhan Akhtar, Hrithik', language: 'Hindi',       mood: 'urban' },
      { title: 'Allah Ke Bande',        artist: 'Kailash Kher',           language: 'Hindi',       mood: 'soulful' },
    ],
  },
  bengaluru: {
    region: 'Karnataka / Bengaluru',
    moods: ['indie', 'cafe', 'rock', 'pub'],
    tracks: [
      { title: 'Kabira',                artist: 'Arijit Singh, Harshdeep',language: 'Hindi',       mood: 'indie' },
      { title: 'Phir Le Aaya Dil',      artist: 'Arijit Singh',           language: 'Hindi',       mood: 'cafe' },
      { title: 'Galliyan',              artist: 'Ankit Tiwari',           language: 'Hindi',       mood: 'indie' },
    ],
  },
  bangalore: { alias: 'bengaluru' },
  mysuru:    { alias: 'mysore' },
  mysore: {
    region: 'Karnataka / Mysore',
    moods: ['palace', 'royal', 'classical', 'cinematic'],
    tracks: [
      { title: 'Bahubali Theme',        artist: 'M. M. Keeravani',        language: 'Instrumental',mood: 'royal' },
      { title: 'Albela Sajan',          artist: 'Shankar Mahadevan',      language: 'Hindi',       mood: 'royal' },
      { title: 'Naacho Naacho',         artist: 'Vishal Mishra, Rahul',   language: 'Hindi',       mood: 'royal' },
    ],
  },
  kashmir: {
    region: 'Kashmir',
    moods: ['valley', 'snow', 'sufi', 'romantic'],
    tracks: [
      { title: 'Bumbro',                artist: 'Sanjeev Abhyankar',      language: 'Kashmiri',    mood: 'valley' },
      { title: 'Hawayein',              artist: 'Arijit Singh',           language: 'Hindi',       mood: 'romance' },
      { title: 'Jhelum',                artist: 'Vishal Bhardwaj',        language: 'Hindi',       mood: 'valley' },
      { title: 'Khwaja Mere Khwaja',    artist: 'A. R. Rahman',           language: 'Sufi',        mood: 'sufi' },
    ],
  },
  srinagar:  { alias: 'kashmir' },
  leh:       { alias: 'ladakh' },
  spiti:     { alias: 'ladakh' },
  kasol:     { alias: 'manali' },
  mussoorie: { alias: 'shimla' },
  nainital:  { alias: 'shimla' },
  gokarna:   { alias: 'goa' },
  ooty:      { alias: 'munnar' },
  coorg:     { alias: 'munnar' },
  agra: {
    region: 'Uttar Pradesh / Agra',
    moods: ['heritage', 'mughal', 'ghazal', 'romantic'],
    tracks: [
      { title: 'Albela Sajan',          artist: 'Shankar Mahadevan',      language: 'Hindi',       mood: 'mughal' },
      { title: 'Khwaja Mere Khwaja',    artist: 'A. R. Rahman',           language: 'Sufi',        mood: 'mughal' },
      { title: 'Tu Jo Hain',            artist: 'Ankit Tiwari',           language: 'Hindi',       mood: 'romance' },
    ],
  },
}

/* ────────────────────────────────────────────────────────────────── *
 * 2. Vibe → mood adjective map (used in prompt + provider URL builder) *
 * ────────────────────────────────────────────────────────────────── */

const VIBE_MOOD = {
  // couple
  'couple/beach':    'sunset chill, beach romance',
  'couple/romantic': 'romantic, candle-light, slow',
  'couple/handmade': 'cozy acoustic, indie folk',
  'couple/best':     'cinematic, lounge',
  // solo
  'solo/budget':     'indie, easy-listening',
  'solo/workation':  'lofi, focus, instrumental',
  'solo/spiritual':  'devotional, sufi, mantra',
  'solo/adventure':  'high-energy roadtrip, indie rock',
  // family
  'family/villa':       'feel-good Bollywood family',
  'family/kidfriendly': 'fun, upbeat, family-friendly',
  'family/pool':        'sunshine, summery, feel-good',
  'family/safe':        'mellow, soft Hindi',
  // friends
  'friends/shared':    'roadtrip, sing-along, party',
  'friends/nightlife': 'club, dance, Bollywood party',
  'friends/adventure': 'high-energy, anthems',
  'friends/best':      'cinematic anthems',
}

const TYPE_MOOD = {
  solo:    'reflective, soulful, lofi',
  couple:  'romantic, slow, intimate',
  family:  'feel-good, family-friendly',
  friends: 'high-energy, sing-along, party',
}

/**
 * Last-resort tracks when there's no curated entry AND no LLM key.
 * Picked to cover the most common moods so unknown destinations still get a list.
 */
const GENERIC_BY_MOOD = {
  romantic: [
    { title: 'Tum Hi Ho',          artist: 'Arijit Singh',         language: 'Hindi', mood: 'romance' },
    { title: 'Hawayein',           artist: 'Arijit Singh',         language: 'Hindi', mood: 'romance' },
    { title: 'Kesariya',           artist: 'Arijit Singh',         language: 'Hindi', mood: 'romance' },
    { title: 'Tum Se Hi',          artist: 'Mohit Chauhan',        language: 'Hindi', mood: 'romance' },
    { title: 'Pee Loon',           artist: 'Mohit Chauhan',        language: 'Hindi', mood: 'romance' },
  ],
  party: [
    { title: 'Kala Chashma',       artist: 'Badshah, Neha Kakkar', language: 'Hindi/Punjabi', mood: 'party' },
    { title: 'Lungi Dance',        artist: 'Yo Yo Honey Singh',    language: 'Hindi', mood: 'party' },
    { title: 'Naacho Naacho',      artist: 'Vishal Mishra, Rahul', language: 'Hindi', mood: 'party' },
    { title: 'Senorita',           artist: 'Farhan Akhtar, Hrithik', language: 'Hindi', mood: 'party' },
    { title: 'Sadda Haq',          artist: 'Mohit Chauhan',        language: 'Hindi', mood: 'anthem' },
  ],
  roadtrip: [
    { title: 'Ilahi',              artist: 'Arijit Singh',         language: 'Hindi', mood: 'roadtrip' },
    { title: 'Patakha Guddi',      artist: 'Nooran Sisters',       language: 'Punjabi', mood: 'roadtrip' },
    { title: 'Phir Se Ud Chala',   artist: 'Mohit Chauhan',        language: 'Hindi', mood: 'roadtrip' },
    { title: 'Senorita',           artist: 'Farhan Akhtar, Hrithik', language: 'Hindi', mood: 'roadtrip' },
    { title: 'Yun Hi Chala Chal',  artist: 'Kailash Kher',         language: 'Hindi', mood: 'roadtrip' },
  ],
  spiritual: [
    { title: 'Allah Ke Bande',     artist: 'Kailash Kher',         language: 'Hindi', mood: 'soulful' },
    { title: 'Khwaja Mere Khwaja', artist: 'A. R. Rahman',         language: 'Sufi',  mood: 'sufi' },
    { title: 'Kun Faya Kun',       artist: 'A. R. Rahman',         language: 'Sufi',  mood: 'soulful' },
    { title: 'Hanuman Chalisa',    artist: 'Hariharan',            language: 'Hindi', mood: 'devotional' },
    { title: 'Iktara',             artist: 'Kavita Seth',          language: 'Hindi', mood: 'soulful' },
  ],
  family: [
    { title: 'Gallan Goodiyaan',   artist: 'Yashita Sharma',       language: 'Hindi', mood: 'family' },
    { title: 'Senorita',           artist: 'Farhan Akhtar, Hrithik', language: 'Hindi', mood: 'family' },
    { title: 'Kabhi Kabhi Aditi',  artist: 'Rashid Ali',           language: 'Hindi', mood: 'feel-good' },
    { title: 'Yeh Dosti',          artist: 'Kishore Kumar, Manna Dey', language: 'Hindi', mood: 'family' },
    { title: 'Phir Se Ud Chala',   artist: 'Mohit Chauhan',        language: 'Hindi', mood: 'feel-good' },
  ],
  chill: [
    { title: 'Tum Se Hi',          artist: 'Mohit Chauhan',        language: 'Hindi', mood: 'chill' },
    { title: 'Phir Le Aaya Dil',   artist: 'Arijit Singh',         language: 'Hindi', mood: 'chill' },
    { title: 'Kabira',             artist: 'Arijit, Harshdeep',    language: 'Hindi', mood: 'chill' },
    { title: 'Iktara',             artist: 'Kavita Seth',          language: 'Hindi', mood: 'chill' },
    { title: 'Galliyan',           artist: 'Ankit Tiwari',         language: 'Hindi', mood: 'chill' },
  ],
}

/** Map a tripType+vibe to one of GENERIC_BY_MOOD keys. */
function pickGenericMoodKey(tripType, vibe) {
  const v = vibeKey(vibe)
  if (v) {
    if (/(beach|romantic|handmade|best)/.test(v)) return 'romantic'
    if (/(nightlife|shared)/.test(v))             return 'party'
    if (/(adventure|workation)/.test(v))          return 'roadtrip'
    if (/(spiritual)/.test(v))                    return 'spiritual'
    if (/(villa|kidfriendly|pool|safe)/.test(v))  return 'family'
  }
  const t = String(tripType || '').toLowerCase()
  if (t === 'couple')  return 'romantic'
  if (t === 'friends') return 'party'
  if (t === 'family')  return 'family'
  if (t === 'solo')    return 'chill'
  return 'chill'
}

/* ────────────────────────────────────────────────────────────────── *
 * 3. Cache                                                            *
 * ────────────────────────────────────────────────────────────────── */

const CACHE = new Map()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1h

function cacheGet(key) {
  const hit = CACHE.get(key)
  if (!hit) return null
  if (Date.now() - hit.t > CACHE_TTL_MS) {
    CACHE.delete(key)
    return null
  }
  return hit.v
}
function cacheSet(key, v) {
  CACHE.set(key, { t: Date.now(), v })
  // bound size — old keys evicted lazily on overflow
  if (CACHE.size > 500) {
    const oldest = CACHE.keys().next().value
    if (oldest) CACHE.delete(oldest)
  }
}

/* ────────────────────────────────────────────────────────────────── *
 * 4. Helpers                                                          *
 * ────────────────────────────────────────────────────────────────── */

function normalizePlaceKey(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function curatedFor(place) {
  const key = normalizePlaceKey(place)
  if (!key) return null
  // Direct hit
  let entry = CURATED[key]
  // Alias chain
  let guard = 0
  while (entry && entry.alias && guard < 4) {
    entry = CURATED[entry.alias]
    guard += 1
  }
  if (entry) return { key, ...entry }

  // Suffix match: "north goa" → goa
  for (const k of Object.keys(CURATED)) {
    if (CURATED[k].alias) continue
    if (key.endsWith(' ' + k) || key.startsWith(k + ' ') || key.includes(' ' + k + ' ')) {
      return { key: k, ...CURATED[k] }
    }
  }
  return null
}

function vibeKey(vibe) {
  if (!vibe) return ''
  return String(vibe).trim().toLowerCase()
}

function moodFor(tripType, vibe) {
  const v = vibeKey(vibe)
  if (v && VIBE_MOOD[v]) return VIBE_MOOD[v]
  const t = String(tripType || '').toLowerCase()
  if (TYPE_MOOD[t]) return TYPE_MOOD[t]
  return 'travel mood, indie'
}

function dedupeTracks(list) {
  const seen = new Set()
  const out = []
  for (const t of list) {
    if (!t || !t.title) continue
    const sig = `${String(t.title).toLowerCase().trim()}|${String(t.artist || '').toLowerCase().trim()}`
    if (seen.has(sig)) continue
    seen.add(sig)
    out.push({
      title: String(t.title).slice(0, 120),
      artist: String(t.artist || '').slice(0, 120) || null,
      language: t.language ? String(t.language).slice(0, 60) : null,
      mood: t.mood ? String(t.mood).slice(0, 40) : null,
    })
  }
  return out
}

/** Provider deep-link search URLs — no API keys needed. */
function buildProviderLinks({ place, mood, region }) {
  const queryBase = [region || place, mood].filter(Boolean).join(' ').trim() || place
  const q = encodeURIComponent(queryBase)
  return {
    spotify:    `https://open.spotify.com/search/${q}/playlists`,
    youtube:    `https://www.youtube.com/results?search_query=${q}+playlist`,
    ytMusic:    `https://music.youtube.com/search?q=${q}`,
    appleMusic: `https://music.apple.com/in/search?term=${q}`,
    jiosaavn:   `https://www.jiosaavn.com/search/${q}`,
  }
}

function buildSearchUrlForTrack(track) {
  const q = encodeURIComponent(`${track.title} ${track.artist || ''}`.trim())
  return {
    spotify:  `https://open.spotify.com/search/${q}`,
    youtube:  `https://www.youtube.com/results?search_query=${q}`,
    ytMusic:  `https://music.youtube.com/search?q=${q}`,
    jiosaavn: `https://www.jiosaavn.com/search/${q}`,
  }
}

/* ────────────────────────────────────────────────────────────────── *
 * 5. Optional LLM augmentation                                         *
 * ────────────────────────────────────────────────────────────────── */

const LLM_TIMEOUT_MS = 6000

async function fetchLlmTracks({ place, region, tripType, vibe, mood }) {
  if (!env.AI_API_KEY || typeof fetch !== 'function') return null

  const sys =
    'You are a music curator. Given an Indian travel destination and the ' +
    'traveller context (trip type and vibe), return a STRICT JSON array of 6 ' +
    'real, well-known songs whose vibe matches the place. Mix Indian languages ' +
    '(Hindi, regional) and globally recognisable tracks. ' +
    'Each entry: { "title": string, "artist": string, "language": string, "mood": string }. ' +
    'Output ONLY the JSON array, no prose, no markdown fence.'

  const user =
    `Destination: ${place}` +
    (region ? ` (${region})` : '') +
    `\nTrip type: ${tripType || 'unspecified'}` +
    `\nVibe: ${vibe || 'unspecified'}` +
    `\nDesired mood: ${mood}` +
    '\nReturn JSON only.'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS)
  try {
    const res = await fetch(env.AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.AI_MODEL,
        temperature: 0.5,
        max_tokens: 350,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user },
        ],
      }),
      signal: controller.signal,
    })
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    const raw = String(data?.choices?.[0]?.message?.content || '').trim()
    if (!raw) return null
    // Strip optional markdown fences just in case.
    const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
    let parsed
    try {
      parsed = JSON.parse(stripped)
    } catch {
      // Retry: extract first array via regex.
      const m = stripped.match(/\[[\s\S]*\]/)
      if (!m) return null
      try { parsed = JSON.parse(m[0]) } catch { return null }
    }
    if (!Array.isArray(parsed)) return null
    return parsed
      .map((t) => ({
        title: t?.title ? String(t.title) : '',
        artist: t?.artist ? String(t.artist) : '',
        language: t?.language ? String(t.language) : null,
        mood: t?.mood ? String(t.mood) : null,
      }))
      .filter((t) => t.title)
      .slice(0, 6)
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/* ────────────────────────────────────────────────────────────────── *
 * 6. Public                                                            *
 * ────────────────────────────────────────────────────────────────── */

async function getMusicForPlace({ place, vibe, tripType }) {
  const placeIn = String(place || '').trim()
  if (!placeIn) {
    return {
      place: '',
      tracks: [],
      links: buildProviderLinks({ place: 'India', mood: 'travel' }),
      mood: 'travel',
      region: null,
      summary: 'Pick a destination to get a soundtrack.',
      source: 'empty',
    }
  }

  const tType = String(tripType || '').trim().toLowerCase() || null
  const vKey  = vibeKey(vibe)
  const cacheKey = `${normalizePlaceKey(placeIn)}|${tType || ''}|${vKey}`
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  const curated = curatedFor(placeIn)
  const region  = curated?.region || placeIn
  const mood    = moodFor(tType, vKey)

  // LLM augmentation runs in parallel with curated lookup — best of both.
  const llmTracks = await fetchLlmTracks({
    place: placeIn,
    region,
    tripType: tType,
    vibe: vKey,
    mood,
  })

  let merged = dedupeTracks([
    ...(Array.isArray(llmTracks) ? llmTracks : []),
    ...(curated?.tracks || []),
  ]).slice(0, 8)

  // Last-resort generic suggestions so unknown places (no curated entry & no
  // LLM key) still return a usable list rather than an empty error state.
  let usedGeneric = false
  if (merged.length === 0) {
    const moodKey = pickGenericMoodKey(tType, vKey)
    merged = dedupeTracks(GENERIC_BY_MOOD[moodKey] || GENERIC_BY_MOOD.chill).slice(0, 6)
    usedGeneric = true
  }

  const tracks = merged.map((t) => ({
    ...t,
    links: buildSearchUrlForTrack(t),
  }))

  const summary = curated
    ? `Soundtrack for ${region} — ${mood}.`
    : `A ${mood} soundtrack to set the mood for ${placeIn}.`

  let source
  if (llmTracks && llmTracks.length) source = curated ? 'llm+curated' : 'llm'
  else if (curated)                  source = 'curated'
  else if (usedGeneric)              source = 'generic'
  else                               source = 'fallback'

  const result = {
    place: placeIn,
    region,
    tripType: tType,
    vibe: vKey || null,
    mood,
    summary,
    tracks,
    links: buildProviderLinks({ place: placeIn, mood, region }),
    source,
    attribution: 'Tracks are search suggestions — providers (Spotify / YouTube Music / JioSaavn) handle playback.',
  }

  cacheSet(cacheKey, result)
  return result
}

module.exports = {
  getMusicForPlace,
}
