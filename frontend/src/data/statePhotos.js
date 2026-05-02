/**
 * State-photo registry — single source of truth that maps every Indian state
 * (and UT) to a deterministic photo path under /public/destinations/.
 *
 * The filename is fixed *before* the image even exists, so any of three
 * teammates can drop a generated/stock image into /public/destinations/ and
 * the UI immediately picks it up — no code changes required.
 *
 * Schema per entry:
 *   - code:     ISO-style state code (matches `stateCode` returned by /api/cities)
 *   - name:     human-readable state/UT name
 *   - file:     path served from /public — already includes the leading slash
 *   - spot:     short label of the iconic spot (used as caption / alt text)
 *   - biome:    one-word category (mountains | beach | desert | forest | etc.)
 *   - accent:   tailwind hue family that pairs well with the photo
 */
export const STATE_PHOTOS = {
  // ── Wave 1 (already approved): five iconic biomes ───────────────────────
  SK: { code: 'SK', name: 'Sikkim',           file: '/destinations/state-sikkim.png',         spot: 'Yumthang Valley',     biome: 'alpine',    accent: 'rose'   },
  ML: { code: 'ML', name: 'Meghalaya',        file: '/destinations/state-meghalaya.png',      spot: 'Living Root Bridge',  biome: 'rainforest',accent: 'emerald'},
  RJ: { code: 'RJ', name: 'Rajasthan',        file: '/destinations/state-rajasthan.png',      spot: 'Thar Desert dunes',   biome: 'desert',    accent: 'amber'  },
  JK: { code: 'JK', name: 'Jammu & Kashmir',  file: '/destinations/state-kashmir.png',        spot: 'Pahalgam meadow',     biome: 'alpine',    accent: 'sky'    },
  KL: { code: 'KL', name: 'Kerala',           file: '/destinations/state-kerala.png',         spot: 'Munnar tea estate',   biome: 'hills',     accent: 'emerald'},

  // ── Wave 2: hill stations + coast + Western Ghats ───────────────────────
  HP: { code: 'HP', name: 'Himachal Pradesh', file: '/destinations/state-himachal.png',       spot: 'Spiti Valley',        biome: 'highland',  accent: 'indigo' },
  UK: { code: 'UK', name: 'Uttarakhand',      file: '/destinations/state-uttarakhand.png',    spot: 'Valley of Flowers',   biome: 'alpine',    accent: 'violet' },
  GA: { code: 'GA', name: 'Goa',              file: '/destinations/state-goa.png',            spot: 'Palolem Beach',       biome: 'beach',     accent: 'amber'  },
  TN: { code: 'TN', name: 'Tamil Nadu',       file: '/destinations/state-tamilnadu.png',      spot: 'Nilgiri Hills',       biome: 'hills',     accent: 'emerald'},
  KA: { code: 'KA', name: 'Karnataka',        file: '/destinations/state-karnataka.png',      spot: 'Coorg coffee hills',  biome: 'hills',     accent: 'lime'   },
  MH: { code: 'MH', name: 'Maharashtra',      file: '/destinations/state-maharashtra.png',    spot: 'Western Ghats monsoon',biome:'ghats',     accent: 'teal'   },

  // ── Wave 3: east + south-coast + plains ─────────────────────────────────
  AP: { code: 'AP', name: 'Andhra Pradesh',   file: '/destinations/state-andhra.png',         spot: 'Araku Valley',        biome: 'hills',     accent: 'emerald'},
  TG: { code: 'TG', name: 'Telangana',        file: '/destinations/state-telangana.png',      spot: 'Pakhal Lake',         biome: 'lake',      accent: 'cyan'   },
  OD: { code: 'OD', name: 'Odisha',           file: '/destinations/state-odisha.png',         spot: 'Chilika Lagoon',      biome: 'wetland',   accent: 'sky'    },
  WB: { code: 'WB', name: 'West Bengal',      file: '/destinations/state-westbengal.png',     spot: 'Sundarbans mangroves',biome: 'mangrove',  accent: 'emerald'},
  BR: { code: 'BR', name: 'Bihar',            file: '/destinations/state-bihar.png',          spot: 'Bodh Gaya',           biome: 'plains',    accent: 'amber'  },
  JH: { code: 'JH', name: 'Jharkhand',        file: '/destinations/state-jharkhand.png',      spot: 'Hundru Falls',        biome: 'forest',    accent: 'lime'   },

  // ── Wave 4: heartland states ────────────────────────────────────────────
  MP: { code: 'MP', name: 'Madhya Pradesh',   file: '/destinations/state-mp.png',             spot: 'Bandhavgarh',         biome: 'jungle',    accent: 'amber'  },
  CT: { code: 'CT', name: 'Chhattisgarh',     file: '/destinations/state-chhattisgarh.png',   spot: 'Chitrakote Falls',    biome: 'forest',    accent: 'emerald'},
  UP: { code: 'UP', name: 'Uttar Pradesh',    file: '/destinations/state-up.png',             spot: 'Varanasi ghats',      biome: 'river',     accent: 'amber'  },
  PB: { code: 'PB', name: 'Punjab',           file: '/destinations/state-punjab.png',         spot: 'Mustard fields',      biome: 'plains',    accent: 'amber'  },
  HR: { code: 'HR', name: 'Haryana',          file: '/destinations/state-haryana.png',        spot: 'Aravalli foothills',  biome: 'plains',    accent: 'lime'   },
  GJ: { code: 'GJ', name: 'Gujarat',          file: '/destinations/state-gujarat.png',        spot: 'White Rann of Kutch', biome: 'salt-flat', accent: 'sky'    },

  // ── Wave 5: northeast (Seven Sisters + Assam) ───────────────────────────
  AS: { code: 'AS', name: 'Assam',            file: '/destinations/state-assam.png',          spot: 'Kaziranga grasslands',biome: 'grassland', accent: 'emerald'},
  AR: { code: 'AR', name: 'Arunachal Pradesh',file: '/destinations/state-arunachal.png',      spot: 'Tawang Monastery',    biome: 'highland',  accent: 'indigo' },
  MN: { code: 'MN', name: 'Manipur',          file: '/destinations/state-manipur.png',        spot: 'Loktak floating isles',biome:'lake',      accent: 'teal'   },
  MZ: { code: 'MZ', name: 'Mizoram',          file: '/destinations/state-mizoram.png',        spot: 'Phawngpui peak',      biome: 'highland',  accent: 'violet' },
  NL: { code: 'NL', name: 'Nagaland',         file: '/destinations/state-nagaland.png',       spot: 'Dzukou Valley',       biome: 'highland',  accent: 'rose'   },
  TR: { code: 'TR', name: 'Tripura',          file: '/destinations/state-tripura.png',        spot: 'Neermahal lake palace',biome:'lake',      accent: 'cyan'   },

  // ── Bonus: Union Territories (so 'Ladakh', 'Andaman' etc still light up) ─
  LA: { code: 'LA', name: 'Ladakh',           file: '/destinations/state-ladakh.png',         spot: 'Pangong Tso',         biome: 'high-desert',accent:'cyan'   },
  AN: { code: 'AN', name: 'Andaman & Nicobar',file: '/destinations/state-andaman.png',        spot: 'Radhanagar Beach',    biome: 'beach',     accent: 'sky'    },
  LD: { code: 'LD', name: 'Lakshadweep',      file: '/destinations/state-lakshadweep.png',    spot: 'Coral atoll',         biome: 'beach',     accent: 'cyan'   },
  PY: { code: 'PY', name: 'Puducherry',       file: '/destinations/state-puducherry.png',     spot: 'Promenade Beach',     biome: 'beach',     accent: 'amber'  },
  CH: { code: 'CH', name: 'Chandigarh',       file: '/destinations/state-chandigarh.png',     spot: 'Sukhna Lake',         biome: 'lake',      accent: 'emerald'},
  DN: { code: 'DN', name: 'Daman & Diu',      file: '/destinations/state-diu.png',            spot: 'Diu Fort coastline',  biome: 'beach',     accent: 'sky'    },
  DL: { code: 'DL', name: 'Delhi',            file: '/destinations/state-delhi.png',          spot: 'Yamuna riverfront',   biome: 'urban',     accent: 'amber'  },
}

/**
 * Wave membership — purely informational, used by /admin tooling so the
 * generation pipeline can mark which images are still pending.
 */
export const PHOTO_WAVES = {
  1: ['SK', 'ML', 'RJ', 'JK', 'KL'],
  2: ['HP', 'UK', 'GA', 'TN', 'KA', 'MH'],
  3: ['AP', 'TG', 'OD', 'WB', 'BR', 'JH'],
  4: ['MP', 'CT', 'UP', 'PB', 'HR', 'GJ'],
  5: ['AS', 'AR', 'MN', 'MZ', 'NL', 'TR'],
}

/**
 * Generic landscape used when we genuinely cannot infer a state — a soft
 * Himalayan layered-mountains photo we already ship.
 */
export const FALLBACK_PHOTO = '/photos/hero-himalaya.png'

/**
 * Aliases used by the fuzzy resolver. Keys must be lowercase, hyphen-free,
 * space-collapsed forms so the matcher can be a simple O(1) lookup.
 */
export const STATE_ALIASES = {
  // Common spellings & legacy names
  'jammuandkashmir':       'JK',
  'jammu&kashmir':         'JK',
  'jk':                    'JK',
  'kashmir':               'JK',
  'jammu':                 'JK',
  'andamanandnicobar':     'AN',
  'andaman&nicobar':       'AN',
  'andaman':               'AN',
  'andamannicobar':        'AN',
  'tn':                    'TN',
  'tamilnadu':             'TN',
  'ap':                    'AP',
  'andhra':                'AP',
  'andhrapradesh':         'AP',
  'tg':                    'TG',
  'telangana':             'TG',
  'mp':                    'MP',
  'madhyapradesh':         'MP',
  'up':                    'UP',
  'uttarpradesh':          'UP',
  'uk':                    'UK',
  'uttarakhand':           'UK',
  'uttaranchal':           'UK',
  'hp':                    'HP',
  'himachal':              'HP',
  'himachalpradesh':       'HP',
  'wb':                    'WB',
  'westbengal':            'WB',
  'bengal':                'WB',
  'mh':                    'MH',
  'maharashtra':           'MH',
  'ka':                    'KA',
  'karnataka':             'KA',
  'kl':                    'KL',
  'kerala':                'KL',
  'rj':                    'RJ',
  'rajasthan':             'RJ',
  'pb':                    'PB',
  'punjab':                'PB',
  'hr':                    'HR',
  'haryana':               'HR',
  'gj':                    'GJ',
  'gujarat':               'GJ',
  'or':                    'OD',
  'od':                    'OD',
  'odisha':                'OD',
  'orissa':                'OD',
  'br':                    'BR',
  'bihar':                 'BR',
  'jh':                    'JH',
  'jharkhand':             'JH',
  'ct':                    'CT',
  'cg':                    'CT',
  'chhattisgarh':          'CT',
  'as':                    'AS',
  'assam':                 'AS',
  'ar':                    'AR',
  'arunachal':             'AR',
  'arunachalpradesh':      'AR',
  'mn':                    'MN',
  'manipur':               'MN',
  'ml':                    'ML',
  'meghalaya':             'ML',
  'mz':                    'MZ',
  'mizoram':               'MZ',
  'nl':                    'NL',
  'nagaland':              'NL',
  'tr':                    'TR',
  'tripura':               'TR',
  'sk':                    'SK',
  'sikkim':                'SK',
  'la':                    'LA',
  'ladakh':                'LA',
  'ld':                    'LD',
  'lakshadweep':           'LD',
  'py':                    'PY',
  'pondicherry':           'PY',
  'puducherry':            'PY',
  'ch':                    'CH',
  'chandigarh':            'CH',
  'dn':                    'DN',
  'daman':                 'DN',
  'diu':                   'DN',
  'damanandiu':            'DN',
  'damananddiu':           'DN',
  'dl':                    'DL',
  'delhi':                 'DL',
  'newdelhi':              'DL',
  'goa':                   'GA',
  'ga':                    'GA',
}

/**
 * Famous-spot → state shortcut. When the user types a *city* without first
 * picking from the autocomplete (so we never got a `stateCode` from the API),
 * this table lets us still show the right photo.
 *
 * Keep entries to ~3-4 of the marquee spots per state — the autocomplete
 * + Nominatim fallback handles the long-tail.
 */
export const CITY_TO_STATE = {
  // Sikkim
  'gangtok':'SK','pelling':'SK','lachung':'SK','yumthang':'SK','tsomgo':'SK',
  // Meghalaya
  'shillong':'ML','cherrapunji':'ML','sohra':'ML','mawlynnong':'ML','dawki':'ML',
  // Rajasthan
  'jaipur':'RJ','jaisalmer':'RJ','jodhpur':'RJ','udaipur':'RJ','pushkar':'RJ',
  'ajmer':'RJ','bikaner':'RJ','mountabu':'RJ','chittorgarh':'RJ','kumbhalgarh':'RJ',
  'ranthambore':'RJ','sawaimadhopur':'RJ','bharatpur':'RJ',
  // Kashmir / J&K
  'srinagar':'JK','pahalgam':'JK','gulmarg':'JK','sonamarg':'JK','katra':'JK',
  'vaishnodevi':'JK','jammu':'JK',
  // Kerala
  'kochi':'KL','cochin':'KL','munnar':'KL','alleppey':'KL','alappuzha':'KL',
  'thekkady':'KL','kovalam':'KL','varkala':'KL','wayanad':'KL','thiruvananthapuram':'KL',
  'trivandrum':'KL','kumarakom':'KL',
  // Himachal
  'shimla':'HP','manali':'HP','dharamshala':'HP','mcleodganj':'HP','spiti':'HP',
  'kasol':'HP','kullu':'HP','dalhousie':'HP','kufri':'HP','khajjiar':'HP',
  // Uttarakhand
  'dehradun':'UK','rishikesh':'UK','haridwar':'UK','mussoorie':'UK','nainital':'UK',
  'auli':'UK','kedarnath':'UK','badrinath':'UK','gangotri':'UK','yamunotri':'UK',
  'valleyofflowers':'UK','jimcorbett':'UK','ranikhet':'UK',
  // Goa
  'panaji':'GA','panjim':'GA','calangute':'GA','baga':'GA','anjuna':'GA',
  'palolem':'GA','vagator':'GA','margao':'GA','goa':'GA',
  // Tamil Nadu
  'chennai':'TN','ooty':'TN','kodaikanal':'TN','madurai':'TN','rameswaram':'TN',
  'kanyakumari':'TN','mahabalipuram':'TN','thanjavur':'TN','tiruchirappalli':'TN',
  'coimbatore':'TN',
  // Karnataka
  'bangalore':'KA','bengaluru':'KA','mysore':'KA','mysuru':'KA','coorg':'KA',
  'madikeri':'KA','chikmagalur':'KA','hampi':'KA','udupi':'KA','mangalore':'KA',
  'gokarna':'KA','badami':'KA','jog':'KA',
  // Maharashtra
  'mumbai':'MH','pune':'MH','lonavala':'MH','mahabaleshwar':'MH','matheran':'MH',
  'aurangabad':'MH','nashik':'MH','alibag':'MH','shirdi':'MH','ajanta':'MH','ellora':'MH',
  // Andhra
  'visakhapatnam':'AP','vizag':'AP','araku':'AP','tirupati':'AP','amaravati':'AP',
  'vijayawada':'AP','rajahmundry':'AP',
  // Telangana
  'hyderabad':'TG','warangal':'TG','khammam':'TG','nizamabad':'TG','karimnagar':'TG',
  // Odisha
  'bhubaneswar':'OD','puri':'OD','konark':'OD','cuttack':'OD','chilika':'OD',
  // West Bengal
  'kolkata':'WB','calcutta':'WB','darjeeling':'WB','siliguri':'WB','sundarbans':'WB',
  'kalimpong':'WB',
  // Bihar
  'patna':'BR','bodhgaya':'BR','rajgir':'BR','nalanda':'BR','vaishali':'BR',
  // Jharkhand
  'ranchi':'JH','jamshedpur':'JH','dhanbad':'JH','netarhat':'JH','hazaribagh':'JH',
  // MP
  'bhopal':'MP','indore':'MP','khajuraho':'MP','orchha':'MP','maheshwar':'MP',
  'omkareshwar':'MP','ujjain':'MP','pachmarhi':'MP','jabalpur':'MP','bandhavgarh':'MP',
  'panna':'MP',
  // Chhattisgarh
  'raipur':'CT','jagdalpur':'CT','chitrakote':'CT','bilaspur':'CT',
  // UP
  'lucknow':'UP','agra':'UP','varanasi':'UP','sarnath':'UP','mathura':'UP',
  'vrindavan':'UP','ayodhya':'UP','allahabad':'UP','prayagraj':'UP','kanpur':'UP',
  'noida':'UP','dudhwa':'UP',
  // Punjab
  'chandigarh':'CH','amritsar':'PB','ludhiana':'PB','jalandhar':'PB','patiala':'PB',
  // Haryana
  'gurgaon':'HR','gurugram':'HR','faridabad':'HR','kurukshetra':'HR','panipat':'HR',
  // Gujarat
  'ahmedabad':'GJ','gandhinagar':'GJ','surat':'GJ','vadodara':'GJ','rajkot':'GJ',
  'kutch':'GJ','rann':'GJ','dwarka':'GJ','somnath':'GJ','palitana':'GJ','bhuj':'GJ',
  // Assam
  'guwahati':'AS','dispur':'AS','kaziranga':'AS','majuli':'AS','jorhat':'AS',
  'manas':'AS',
  // Arunachal
  'itanagar':'AR','tawang':'AR','ziro':'AR','bomdila':'AR',
  // Manipur
  'imphal':'MN','loktak':'MN','moirang':'MN',
  // Mizoram
  'aizawl':'MZ','phawngpui':'MZ',
  // Nagaland
  'kohima':'NL','dimapur':'NL','dzukou':'NL','khonoma':'NL',
  // Tripura
  'agartala':'TR','udaipurtripura':'TR','neermahal':'TR',
  // Ladakh / UTs
  'leh':'LA','ladakh':'LA','nubra':'LA','pangong':'LA','kargil':'LA','zanskar':'LA',
  'portblair':'AN','havelock':'AN','neilisland':'AN','swarajdweep':'AN',
  'kavaratti':'LD',
  'puducherry':'PY','pondicherry':'PY','auroville':'PY',
  'daman':'DN','diu':'DN','silvassa':'DN',
  'delhi':'DL','newdelhi':'DL',
}

/**
 * Lower-cased flat list of state names — used by `getStatePhoto` for prefix /
 * substring matching against free-typed text.
 */
export const STATE_NAME_INDEX = Object.values(STATE_PHOTOS).map((s) => ({
  code: s.code,
  // strip diacritics + non-letters so "Jammu & Kashmir" → "jammukashmir"
  norm: s.name.toLowerCase().replace(/[^a-z]+/g, ''),
  raw: s.name,
}))
