'use strict'

/**
 * CURATED_ROUTES — hand-researched real Indian travel data.
 *
 * Key format: "<origin-slug>__<destination-slug>"  (double underscore so
 * multi-word city names like "new-delhi" don't break the split logic).
 *
 * All prices are per-person estimates for 2025–2026, sourced from
 * IRCTC, MakeMyTrip, ixigo, Zostel, OYO and Google Flights.
 */
const CURATED_ROUTES = {

  /* ── HYDERABAD DEPARTURES ─────────────────────────────────────── */

  'hyderabad__varanasi': {
    from: 'Hyderabad', to: 'Varanasi',
    duration: '5 Days / 4 Nights', tag: 'Spiritual',
    silver: {
      price: 14500,
      transport: 'Train (AC 3-Tier)',
      accommodation: 'Budget Hostel',
      dining: 'Local Street Food & Dhabas',
      transport_detail: 'Humsafar Express (12771) — ~26 hrs · Berth ₹1,350',
      accommodation_detail: 'Zostel Varanasi or Brijrama Guest House — ₹600–900/night',
      dining_detail: 'Kashi Chaat Bhandar · Blue Lassi · Deena Chat Bhandar',
      perks: ['Free WiFi at hostel', 'Common lounge', 'City map & tips', 'Luggage storage'],
      itinerary: [
        { day: 1, title: 'Arrival & Ghats',    activities: ['Check-in at Zostel Varanasi', 'Dashashwamedh Ghat sunset walk', 'Ganga Aarti ceremony (7 PM)', 'Kashi Chaat dinner'] },
        { day: 2, title: 'Old City & Temples', activities: ['Sunrise boat ride on Ganga (₹200)', 'Kashi Vishwanath Temple darshan', 'Narrow lane walking tour', 'Blue Lassi & street food trail'] },
        { day: 3, title: 'Sarnath Excursion',  activities: ['Sarnath Buddhist ruins (₹40)', 'Mulagandha Kuti Vihar', 'Banaras Hindu University campus', 'Assi Ghat evening fire ritual'] },
        { day: 4, title: 'Markets & Silk',     activities: ['Vishwanath Gali shopping', 'Banarasi silk weaving workshop', 'Ramnagar Fort (₹10)', 'Manikarnika Ghat walk'] },
        { day: 5, title: 'Departure',          activities: ['Morning meditation at Ghat', 'Last sunrise boat ride', 'Souvenir shopping', 'Train back to Hyderabad'] },
      ],
    },
    gold: {
      price: 27000,
      transport: 'Flight (Direct)',
      accommodation: 'Heritage Palace Hotel',
      dining: 'Fine Dining & Curated Food Walks',
      transport_detail: 'IndiGo 6E-507 / Air India AI-431 Direct — ~2 hrs 15 min · ₹4,500–6,000',
      accommodation_detail: 'BrijRama Palace / Nadesar Palace — Heritage Suite ₹12,000–18,000/night',
      dining_detail: 'Varuna Restaurant at BrijRama · Curated ghats food walk · Roof-top café',
      perks: ['Private airport transfer', 'Welcome ritual & high tea', 'VIP darshan pass', 'Concierge', 'Spa access', 'Complimentary breakfast'],
      itinerary: [
        { day: 1, title: 'Luxury Arrival',     activities: ['Private airport pickup in AC car', 'Heritage hotel check-in', 'Welcome puja & high tea', 'Private Ganga Aarti boat experience'] },
        { day: 2, title: 'Royal Varanasi',     activities: ['Private sunrise boat with breakfast', 'VIP fast-track Kashi Vishwanath darshan', 'Silk weaving master studio tour', 'River-view fine dining'] },
        { day: 3, title: 'Sarnath Exclusive',  activities: ['Private car + archaeologist guide', 'Mulagandha Kuti VIP access', 'Monastery meditation session', 'Afternoon spa treatment'] },
        { day: 4, title: 'Art & Culture',      activities: ['Private Banarasi silk shopping', 'Craft master demonstration', 'Banarasi cooking class', 'Rooftop sunset cocktails'] },
        { day: 5, title: 'Grand Departure',    activities: ['Sunrise yoga at Ghat', 'Gourmet farewell breakfast', 'Hotel car to airport', 'Premium lounge access'] },
      ],
    },
  },

  'hyderabad__goa': {
    from: 'Hyderabad', to: 'Goa',
    duration: '4 Days / 3 Nights', tag: 'Beach',
    silver: {
      price: 9800,
      transport: 'Overnight Bus (AC Sleeper)',
      accommodation: 'Beach Hostel',
      dining: 'Beach Shacks & Local Joints',
      transport_detail: 'SRS / Orange Travels AC Sleeper — ~14 hrs · ₹900–1,200',
      accommodation_detail: 'Zostel Goa (Anjuna) / Backpacker Panda — Dorm ₹450–600/night',
      dining_detail: "Martin's Corner (Betalbatim) · Brittos (Calangute) · Fish Thali ₹150",
      perks: ['Common pool access', 'Free breakfast', 'Surf lesson discount 20%', 'Scooter rental help'],
      itinerary: [
        { day: 1, title: 'North Goa Arrival', activities: ['Bus arrival, hostel check-in', 'Calangute & Baga beach dip', "Tito's Lane evening walk", 'Beach shack seafood dinner'] },
        { day: 2, title: 'Beach Hopping',     activities: ['Anjuna Flea Market (Sat/Wed)', 'Vagator cliff sunset views', 'Chapora Fort', 'Arambol beach bonfire night'] },
        { day: 3, title: 'South Goa Day',     activities: ['Palolem beach (2-hr bus)', 'Old Goa churches (UNESCO)', 'Colva beach evening stroll', 'Fish curry rice lunch ₹120'] },
        { day: 4, title: 'Departure',         activities: ['Morning swim', 'Mapusa Market souvenirs', 'Buy cashews & spices', 'Bus/train back'] },
      ],
    },
    gold: {
      price: 22500,
      transport: 'Flight (Direct)',
      accommodation: 'Luxury Beach Resort',
      dining: 'Premium Restaurants & Private Dining',
      transport_detail: 'IndiGo / Vistara Direct HYD→GOI — ~1 hr 15 min · ₹3,500–5,000',
      accommodation_detail: 'Taj Exotica (Benaulim) / W Goa (Vagator) — Deluxe ₹12,000–20,000/night',
      dining_detail: "Antares (Vagator) · Fisherman's Wharf · Thalassa (Vagator) · Resort fine dining",
      perks: ['Private cab from Dabolim', 'Beach butler service', 'Daily breakfast', 'Scuba diving lesson', 'Spa credit ₹2,000', 'Infinity pool access'],
      itinerary: [
        { day: 1, title: 'Luxury Landing',  activities: ['Private cab from Dabolim Airport', 'Resort check-in & welcome cocktails', 'Infinity pool afternoon', 'Beach-restaurant sunset dinner'] },
        { day: 2, title: 'Premium Beach',   activities: ['Private beach morning session', 'Beginner scuba with PADI instructor', 'Lunch at Antares', 'Sunset yacht cruise ₹3,500/couple'] },
        { day: 3, title: 'Heritage & Spa',  activities: ['Private Old Goa guided tour', 'Spice plantation lunch (Savoi)', 'Afternoon spa ritual', 'Tasting-menu dinner at Thalassa'] },
        { day: 4, title: 'VIP Departure',   activities: ['Morning yoga by pool', 'Gourmet resort breakfast', 'Resort car to airport', 'Priority boarding lounge access'] },
      ],
    },
  },

  'hyderabad__manali': {
    from: 'Hyderabad', to: 'Manali',
    duration: '6 Days / 5 Nights', tag: 'Mountains',
    silver: {
      price: 18200,
      transport: 'Flight + Volvo Bus',
      accommodation: 'Budget Mountain Guesthouse',
      dining: 'Local Himachali Cuisine',
      transport_detail: 'Flight HYD→DEL (₹3,000) + Volvo Bus DEL→Manali (~10 hrs, ₹900)',
      accommodation_detail: 'The Hosteller Manali / Snow View Guesthouse — ₹700–1,000/night',
      dining_detail: "Chopsticks Restaurant · Johnson's Café · Drifter's Inn momos",
      perks: ['Bonfire evenings', 'Travel desk assistance', 'Free city map', 'Hot water 24/7'],
      itinerary: [
        { day: 1, title: 'Arrival & Acclimatize', activities: ['Bus arrival, check-in guesthouse', 'Mall Road evening walk', 'Local café dinner', 'Rest for acclimatization'] },
        { day: 2, title: 'Solang Valley',         activities: ['Solang Valley snow activities', 'Paragliding (₹2,500)', 'Views towards Rohtang', 'Guesthouse bonfire night'] },
        { day: 3, title: 'Old Manali',            activities: ['Hadimba Devi Temple', 'Old Manali market stroll', 'Manu Temple short trek', 'Beas River riverside evening'] },
        { day: 4, title: 'Kasol Day Trip',        activities: ['Kasol village (2-hr bus)', 'Parvati River swimming spot', 'Kheerganga trek preview', 'Israeli café culture night'] },
        { day: 5, title: 'Local Explore',         activities: ['Naggar Castle (30 min)', 'Tibetan Monastery visit', 'Local market shopping', 'Farewell momos dinner'] },
        { day: 6, title: 'Journey Home',          activities: ['Bus to Delhi', 'Flight HYD from Delhi', 'Arrive Hyderabad evening'] },
      ],
    },
    gold: {
      price: 38500,
      transport: 'Flight + Private Cab',
      accommodation: 'Premium Mountain Resort',
      dining: 'Resort Dining & Curated Mountain Meals',
      transport_detail: 'Flight HYD→DEL (₹5,000) + Private Innova DEL→Manali (₹6,000, ~9 hrs)',
      accommodation_detail: 'The Himalayan / Span Resort — Mountain Suite ₹8,000–14,000/night',
      dining_detail: 'River deck dining at Span · Orchard Greens · Multi-cuisine resort restaurant',
      perks: ['Fireplace suite', 'Daily breakfast + dinner', 'Private mountain guide', 'Spa & hot tub', 'Private driver throughout', 'Helicopter option (+₹12,000)'],
      itinerary: [
        { day: 1, title: 'VIP Mountain Arrival',  activities: ['Private cab from Delhi airport', 'Resort check-in & welcome tea', 'Fireplace suite', 'Sunset river-view dinner'] },
        { day: 2, title: 'Premium Adventure',     activities: ['Private guide at Solang Valley', 'Helicopter ride to Rohtang (optional)', 'Mountain picnic lunch', 'Evening spa treatment'] },
        { day: 3, title: 'Manali Heritage',       activities: ['Private Hadimba Temple & Manu Temple tour', 'Himalayan artisan craft tour', 'Chef-prepared Himachali dinner', 'Fireside lounge evening'] },
        { day: 4, title: 'Parvati Valley',        activities: ['Private car to Kasol', 'Kheerganga valley nature walk', 'Riverside gourmet lunch', 'Sunset cocktails at resort'] },
        { day: 5, title: 'Farewell Luxury',       activities: ['Morning yoga on riverside deck', 'Premium spa farewell package', 'Gourmet celebration dinner', 'Private transfer arrangements'] },
        { day: 6, title: 'Premium Exit',          activities: ['Luxury cab to Delhi', 'Business lounge Delhi airport', 'Flight home Hyderabad'] },
      ],
    },
  },

  /* ── DELHI DEPARTURES ────────────────────────────────────────── */

  'delhi__goa': {
    from: 'Delhi', to: 'Goa',
    duration: '5 Days / 4 Nights', tag: 'Beach',
    silver: {
      price: 15500,
      transport: 'Train (Sleeper/AC3)',
      accommodation: 'Beach Hostel',
      dining: 'Beach Shacks & Local Restaurants',
      transport_detail: 'Rajdhani Express / Goa Express (12780) — ~39 hrs · ₹1,500–2,200 AC3',
      accommodation_detail: 'Zostel Goa (Anjuna) / The Papaya — Dorm ₹450–600, Private ₹1,200/night',
      dining_detail: "Curlies (Anjuna) · Brittos (Baga) · Mum's Kitchen (Panaji) · Fish thali ₹150",
      perks: ['Pool access at hostel', 'Free breakfast', 'Surf board rental discount', 'Scooter rental ₹300/day help'],
      itinerary: [
        { day: 1, title: 'Arrive North Goa',  activities: ['Train arrival at Madgaon/Thivim', 'Hostel check-in Anjuna', 'Calangute & Baga beach', 'Beach shack dinner'] },
        { day: 2, title: 'Anjuna & Vagator',  activities: ['Anjuna Flea Market', 'Vagator cliff views', 'Chapora Fort trek (1 hr)', 'Sunset cocktails at Curlies'] },
        { day: 3, title: 'South Goa',         activities: ['Palolem & Agonda beach', 'Dudhsagar Waterfall jeep trip (₹450)', 'Old Goa UNESCO churches', 'Panaji river walk'] },
        { day: 4, title: 'Water Sports',      activities: ['Parasailing at Baga (₹500)', 'Banana boat ride', 'Spice plantation tour (₹600)', 'Mapusa market shopping'] },
        { day: 5, title: 'Departure',         activities: ['Last morning swim', 'Buy cashews at Mapusa', 'Train/flight home'] },
      ],
    },
    gold: {
      price: 34500,
      transport: 'Flight (Direct)',
      accommodation: 'Luxury Beach Resort',
      dining: 'Fine Dining & Private Chef Experiences',
      transport_detail: 'IndiGo / Vistara DEL→GOI Direct — ~2.5 hrs · ₹4,500–7,000',
      accommodation_detail: 'Leela Goa (Cavelossim) / Taj Fort Aguada — Suite ₹15,000–25,000/night',
      dining_detail: 'Cavatina at Leela · Spice Route Delhi-Goa style · Private chef beach dinner',
      perks: ['Private transfer both ways', 'Butler service', 'Infinity pool access', 'Daily breakfast', 'Water sports package', 'Spa ₹3,000 credit'],
      itinerary: [
        { day: 1, title: 'Luxury Beach Landing', activities: ['Direct flight + private transfer', 'Leela/Taj resort check-in', 'Welcome cocktails by pool', 'Candlelit beach dinner'] },
        { day: 2, title: 'Premier Beaches',      activities: ['Private beach morning', 'PADI scuba diving session', 'Champagne lunch at resort', 'Sunset yacht private charter'] },
        { day: 3, title: 'Heritage & Spa',       activities: ['Private Old Goa heritage tour', 'Savoi Spice Plantation exclusive tour', 'Ayurvedic spa full day', 'Multi-course dinner'] },
        { day: 4, title: 'Adventure Premium',    activities: ['Private Dudhsagar tour by helicopter', 'Watersports VIP package', 'Beach BBQ private dinner', 'Stargazing session'] },
        { day: 5, title: 'VIP Exit',             activities: ['Morning yoga by sea', 'Gourmet farewell breakfast', 'Resort car to airport', 'Business lounge'] },
      ],
    },
  },

  'delhi__manali': {
    from: 'Delhi', to: 'Manali',
    duration: '5 Days / 4 Nights', tag: 'Adventure',
    silver: {
      price: 12500,
      transport: 'HRTC Volvo Bus (Overnight)',
      accommodation: 'Budget Guesthouse',
      dining: 'Local Himachali Food',
      transport_detail: 'HRTC / RedBus Volvo AC Sleeper DEL→Manali — ~13 hrs overnight · ₹900–1,200',
      accommodation_detail: 'The Hosteller Manali / Zostel Manali — Dorm ₹500, Private ₹1,000/night',
      dining_detail: "Café 1947 · Drifter's Inn · Johnson's Café · Momos stalls ₹60",
      perks: ['Bonfire every evening', 'Free map of Manali', 'Activity desk for bookings', 'Hot water 6 AM–10 PM'],
      itinerary: [
        { day: 1, title: 'Arrival Day',       activities: ['Bus arrival, check-in guesthouse', 'Mall Road & Tibetan Market', 'Local café lunch', 'Hadimba Temple walk'] },
        { day: 2, title: 'Solang Valley',     activities: ['Solang Valley snow point', 'Paragliding (₹2,500)', 'ATV ride (₹1,000)', 'Hostel bonfire night with travellers'] },
        { day: 3, title: 'Old Manali',        activities: ['Old Manali village', 'Manu Temple and trek', 'Beas Kund trail start (2 hrs)', 'River-side café evening'] },
        { day: 4, title: 'Adventure Sports',  activities: ['White water rafting on Beas (₹700)', 'Naggar Castle day trip', 'Rohtang Pass jeep (₹2,500, seasonal)', 'Farewell dinner momos'] },
        { day: 5, title: 'Return to Delhi',   activities: ['Morning walk Mall Road', 'Bus to Delhi (overnight)', 'Arrive Delhi next morning'] },
      ],
    },
    gold: {
      price: 32000,
      transport: 'Flight to Bhuntar + Private Cab',
      accommodation: 'Premium Mountain Resort',
      dining: 'Resort Restaurant & Curated Picnics',
      transport_detail: 'IndiGo DEL→Bhuntar (Kullu) — 55 min · ₹4,500 + Private cab to Manali 1 hr · ₹2,500',
      accommodation_detail: 'The Himalayan / Span Resort & Spa — Suite ₹8,500–15,000/night',
      dining_detail: 'Orchard Greens Restaurant · Riverside Bistro · Mountain picnic by chef',
      perks: ['Fireplace suite', 'All meals included', 'Private adventure guide', 'Spa & hot tub', 'Private cab full trip', 'Snow gear rental free'],
      itinerary: [
        { day: 1, title: 'VIP Fly-In',         activities: ['Flight to Kullu Manali', 'Private cab to resort', 'Welcome high tea', 'Fireplace suite evening'] },
        { day: 2, title: 'Rohtang Premium',    activities: ['Early Rohtang Pass private jeep', 'Snow activities exclusive spot', 'Mountain picnic lunch', 'Evening spa'] },
        { day: 3, title: 'Solang Adventure',   activities: ['Private guide Solang Valley', 'Paragliding VIP launch', 'Riverside gourmet lunch', 'Hot tub + sunset'] },
        { day: 4, title: 'Kullu Valley',       activities: ['Naggar Castle private tour', 'Kullu crafts & shawl shopping', 'Beas riverside trek with guide', 'Multi-course dinner'] },
        { day: 5, title: 'Luxury Exit',        activities: ['Morning meditation on deck', 'Gourmet farewell breakfast', 'Private cab to Kullu airport', 'Flight back Delhi'] },
      ],
    },
  },

  'delhi__jaipur': {
    from: 'Delhi', to: 'Jaipur',
    duration: '3 Days / 2 Nights', tag: 'Heritage',
    silver: {
      price: 5500,
      transport: 'Train (AC Chair Car)',
      accommodation: 'Heritage Budget Guesthouse',
      dining: 'Rajasthani Street Food',
      transport_detail: 'Ajmer Shatabdi (12015) or Jaipur Superfast — 4.5 hrs · ₹600–900 AC Chair',
      accommodation_detail: 'Moustache Hostel Jaipur / Zostel — Dorm ₹400, Private ₹900/night',
      dining_detail: "Laxmi Misthan Bhandar · Chokhi Dhani (₹700 entry) · Bapu Bazaar thalis",
      perks: ['Free cycling map', 'Heritage walk guided tour', 'Auto-rickshaw booking help', 'City orientation briefing'],
      itinerary: [
        { day: 1, title: 'Pink City Arrival',  activities: ['Train arrival Jaipur Junction', 'Hostel check-in & freshen up', 'Hawa Mahal exterior & market', 'City Palace area walk', 'Bapu Bazaar shopping'] },
        { day: 2, title: 'Forts & Palaces',    activities: ['Amer Fort (₹200) morning', 'Jaigarh Fort (₹85)', 'Nahargarh Fort sunset view', 'Chokhi Dhani cultural dinner'] },
        { day: 3, title: 'Markets & Departure', activities: ['Jantar Mantar (₹200)', 'Johari Bazaar gems & jewellery', 'Masala tea & snacks', 'Train back to Delhi'] },
      ],
    },
    gold: {
      price: 15000,
      transport: 'AC Cab or Rajdhani',
      accommodation: 'Heritage Haveli Hotel',
      dining: 'Rooftop Fine Dining & Royal Rajasthani Thali',
      transport_detail: 'Private AC Innova DEL→Jaipur — 5.5 hrs · ₹4,500 | Or Rajdhani 1AC · ₹1,800',
      accommodation_detail: 'Samode Haveli / Raj Palace — Heritage Suite ₹8,000–16,000/night',
      dining_detail: 'Suvarna Mahal at Raj Palace · 1135 AD at Amer · Rooftop sunset dining',
      perks: ['Private heritage walk with historian', 'Elephant/horse polo experience', 'Complimentary breakfast', 'Butler on call', 'Cultural show evening', 'Spa access'],
      itinerary: [
        { day: 1, title: 'Royal Arrival',     activities: ['Private cab from Delhi', 'Haveli check-in with garland welcome', 'Rooftop high tea', 'Hawa Mahal private guided tour', 'Royal Rajasthani dinner'] },
        { day: 2, title: 'Forts VIP Tour',    activities: ['Private guide Amer Fort (elephant option ₹900)', 'Jaigarh & Nahargarh exclusive access', '1135 AD Amer restaurant lunch', 'Sundowner at Nahargarh'] },
        { day: 3, title: 'Heritage Markets',  activities: ['Private Johari Bazaar gems tour', 'Jantar Mantar exclusive guide', 'Gem stone workshop', 'Private cab back to Delhi'] },
      ],
    },
  },

  'delhi__rishikesh': {
    from: 'Delhi', to: 'Rishikesh',
    duration: '3 Days / 2 Nights', tag: 'Adventure',
    silver: {
      price: 4500,
      transport: 'Bus / Train',
      accommodation: 'Ashram / Budget Hostel',
      dining: 'Ashram Meals & Cafés by Ganga',
      transport_detail: 'UPSRTC/Uttarakhand Bus DEL→Rishikesh — 6 hrs · ₹350–550 | Or Haridwar train + bus',
      accommodation_detail: 'Zostel Rishikesh / Parmarth Ashram guesthouse — ₹350–700/night',
      dining_detail: "Little Buddha Café · Chotiwala · Ganga View Café · Ashram sattvic meals",
      perks: ['Free yoga class morning', 'Rafting discount 15%', 'Ganga Aarti attendance', 'Bungee/zipline discount'],
      itinerary: [
        { day: 1, title: 'Arrival & Ganga', activities: ['Bus/train arrival Rishikesh', 'Hostel/ashram check-in', 'Laxman Jhula & Ram Jhula walk', 'Triveni Ghat Ganga Aarti (6 PM)', 'Café dinner by Ganga'] },
        { day: 2, title: 'Adventure Day',   activities: ['Rafting on Ganga (₹700–1,200, 16 km stretch)', 'Bungee jumping at Jumping Heights (₹3,550)', 'Neelkanth Mahadev temple hike', 'Sunset yoga at Parmarth'] },
        { day: 3, title: 'Yoga & Return',   activities: ['Sunrise yoga 6 AM free session', 'Beatles Ashram (₹150)', 'Kunjapuri Devi Temple hike', 'Bus back to Delhi'] },
      ],
    },
    gold: {
      price: 12500,
      transport: 'Private Cab (AC)',
      accommodation: 'Luxury Riverside Camp / Resort',
      dining: 'Gourmet Dining with Ganga Views',
      transport_detail: 'Private Toyota Crysta DEL→Rishikesh — 6 hrs · ₹5,500 round trip',
      accommodation_detail: 'Aloha on the Ganges / Atali Ganga — River Tent Suite ₹7,000–12,000/night',
      dining_detail: 'Ganga Kinare restaurant · Pavilion at Atali · Organic farm-to-table meals',
      perks: ['Private yoga instructor', 'Guided Ayurvedic consultation', 'Private rafting expedition', 'Complimentary meals', 'Campfire evenings', 'Spa & pool'],
      itinerary: [
        { day: 1, title: 'Luxury Ganga Camp',  activities: ['Private cab from Delhi', 'Luxury tent check-in river view', 'Private yoga session', 'Ganga Aarti private boat', 'Chef-prepared organic dinner'] },
        { day: 2, title: 'VIP Adventure',      activities: ['Private white-water rafting expedition', 'Cliff jumping session', 'Ayurvedic massage at camp', 'Guided Neelkanth hike', 'Campfire dinner under stars'] },
        { day: 3, title: 'Wellness & Return',  activities: ['Sunrise yoga & pranayama', 'Ayurvedic breakfast & consultation', 'Beatles Ashram private tour', 'Private cab back Delhi'] },
      ],
    },
  },

  'delhi__shimla': {
    from: 'Delhi', to: 'Shimla',
    duration: '3 Days / 2 Nights', tag: 'Hills',
    silver: {
      price: 5200,
      transport: 'Volvo Bus',
      accommodation: 'Budget Guesthouse near Mall Road',
      dining: 'Local Himachali Food & Bakeries',
      transport_detail: 'HRTC Volvo DEL→Shimla — ~7 hrs · ₹700–900 | Or Kalka-Shimla Toy Train (5 hrs)',
      accommodation_detail: 'Zostel Shimla / Hotel Snow Valley — ₹600–1,000/night',
      dining_detail: "Café Sol · Ashiana Restaurant · Baljees · Himachali dham thali",
      perks: ['Free Mall Road map', 'Ridge viewpoint orientation', 'Adventure activity help', 'Luggage storage'],
      itinerary: [
        { day: 1, title: 'Mall Road & Ridge',    activities: ['Bus arrival, guesthouse check-in', 'Mall Road stroll', 'Christ Church & The Ridge', 'Jakhu Temple hike (2 hrs)', 'Local dinner Baljees'] },
        { day: 2, title: 'Kufri & Chail',        activities: ['Kufri snow point / adventure park', 'Chail Palace (40 km)', 'Scenic valley views', 'Hot chocolate café evening'] },
        { day: 3, title: 'Explore & Return',     activities: ['State Museum (₹20)', 'Tara Devi Temple', 'Market shopping', 'Volvo bus back to Delhi'] },
      ],
    },
    gold: {
      price: 14500,
      transport: 'Private Cab or Toy Train + Cab',
      accommodation: 'Heritage Luxury Hotel',
      dining: 'Fine Dining at Heritage Property',
      transport_detail: 'Private cab DEL→Shimla — 7 hrs · ₹5,000 | Or Kalka Toy Train + private cab',
      accommodation_detail: 'Wildflower Hall / Oberoi Cecil — Heritage Suite ₹10,000–18,000/night',
      dining_detail: 'The Grill Room at Cecil · Wildflower Hall restaurant · Terrace dining with valley views',
      perks: ['Heated pool & spa', 'Daily breakfast included', 'Private guided heritage walk', 'Complimentary evening tea', 'Fireplace suite', 'Airport transfers'],
      itinerary: [
        { day: 1, title: 'Colonial Shimla',       activities: ['Private cab arrival', 'Heritage hotel check-in & welcome tea', 'Private guided Mall Road heritage walk', 'Fine dining dinner with valley views'] },
        { day: 2, title: 'Kufri & Chail VIP',     activities: ['Private car to Kufri & Chail', 'Chail Palace exclusive tour', 'Picnic lunch at scenic viewpoint', 'Spa treatment evening'] },
        { day: 3, title: 'Heritage Walk & Return', activities: ['Viceregal Lodge exclusive access', 'Jakhu Temple private walk', 'Farewell breakfast', 'Private cab back Delhi'] },
      ],
    },
  },

  'delhi__agra': {
    from: 'Delhi', to: 'Agra',
    duration: '2 Days / 1 Night', tag: 'Heritage',
    silver: {
      price: 3800,
      transport: 'Train (Gatimaan/Shatabdi)',
      accommodation: 'Budget Hotel near Taj',
      dining: 'Agra Street Food & Dhabas',
      transport_detail: 'Gatimaan Express (12050) — 1 hr 40 min · ₹755 Chair Car | Shatabdi ₹490',
      accommodation_detail: 'Hotel Kamal / Sidhartha Hotel — ₹800–1,400/night near Taj East Gate',
      dining_detail: "Dasaprakash · Pinch of Spice · Mama Chicken · Petha shops",
      perks: ['Taj sunrise entry guidance', 'Auto-rickshaw tour help', 'Agra Fort entry tip', 'Free city map'],
      itinerary: [
        { day: 1, title: 'Taj & Agra Fort',    activities: ['Gatimaan Express morning arrival', 'Taj Mahal (₹1,100, sunrise 6 AM entry)', 'Agra Fort (₹650)', 'Mehtab Bagh sunset view', 'Petha & street food dinner'] },
        { day: 2, title: 'Sikri & Return',     activities: ['Fatehpur Sikri (₹610, 40 km)', 'Itmad-ud-Daulah (Baby Taj, ₹310)', 'Kinari Bazaar shopping', 'Gatimaan Express back to Delhi'] },
      ],
    },
    gold: {
      price: 9500,
      transport: 'Private Cab (AC Sedan)',
      accommodation: 'Luxury Taj-View Hotel',
      dining: 'Fine Dining with Taj View',
      transport_detail: 'Private Innova/Crysta DEL→Agra — 3.5 hrs · ₹4,000 round trip (highway)',
      accommodation_detail: 'ITC Mughal Resort / The Oberoi Amarvilas — Taj-view Suite ₹12,000–25,000/night',
      dining_detail: 'Bellevue at Amarvilas (Taj view) · Peshawri at ITC Mughal · Rooftop Taj dining',
      perks: ['Taj sunrise private access session', 'Expert archaeologist guide', 'Private car to all monuments', 'Complimentary meals', 'Spa access', 'Candle-lit dinner'],
      itinerary: [
        { day: 1, title: 'Taj Sunrise VIP',    activities: ['Private cab from Delhi early morning', 'Amarvilas check-in Taj view room', 'VIP Taj Mahal with private guide', 'Agra Fort expert tour', 'Candle-lit Taj-view dinner'] },
        { day: 2, title: 'Mughal Heritage',    activities: ['Sunrise Taj view from room balcony', 'Fatehpur Sikri private tour', 'ITC Mughal spa morning', 'Gourmet farewell lunch', 'Private cab back Delhi'] },
      ],
    },
  },

  /* ── MUMBAI DEPARTURES ───────────────────────────────────────── */

  'mumbai__goa': {
    from: 'Mumbai', to: 'Goa',
    duration: '3 Days / 2 Nights', tag: 'Weekend',
    silver: {
      price: 6800,
      transport: 'Train (Konkan Railway)',
      accommodation: 'Beach Hostel',
      dining: 'Beach Shacks & Goan Seafood',
      transport_detail: 'Konkan Kanya Express (10111) or Mandovi Express — ~8 hrs · ₹650–1,100 AC3',
      accommodation_detail: 'Zostel Goa (Anjuna) / Casa Bhonsle — Dorm ₹500, Private ₹1,200/night',
      dining_detail: "Martin's Corner · Ritz Classic · Beach shacks Calangute · Fish thali ₹150",
      perks: ['Sea-view common area', 'Scooter rental ₹350/day', 'Surf lesson group ₹800', 'Laundry service'],
      itinerary: [
        { day: 1, title: 'Arrive & Beach',  activities: ['Train to Madgaon, hostel check-in', 'Calangute + Baga beach', 'Water sports (₹500 package)', 'Shack seafood dinner'] },
        { day: 2, title: 'Explore Goa',    activities: ['Old Goa churches (Basilica of Bom Jesus, UNESCO)', 'Panaji market & Fontainhas Latin quarter', 'Palolem Beach afternoon', 'Beach bonfire night'] },
        { day: 3, title: 'Dudhsagar & Return', activities: ['Dudhsagar Waterfall jeep trip (₹450)', 'Anjuna Flea Market', 'Cashews & spices shopping', 'Train back Mumbai'] },
      ],
    },
    gold: {
      price: 18500,
      transport: 'Flight (Direct)',
      accommodation: 'Boutique Beach Resort',
      dining: 'Premium Goan Restaurants & Resort Dining',
      transport_detail: 'IndiGo / SpiceJet BOM→GOI Direct — ~1 hr 10 min · ₹3,000–4,500',
      accommodation_detail: 'Taj Cidade de Goa / Alila Diwa — Sea-view room ₹10,000–18,000/night',
      dining_detail: "Fisherman's Wharf Cavelossim \u00b7 The Verandah at Taj \u00b7 Shacks by Tito",
      perks: ['Airport transfer', 'Infinity pool', 'Complimentary breakfast', 'Beach butler', 'Spa credit ₹1,500', 'Complimentary water sports intro'],
      itinerary: [
        { day: 1, title: 'Luxury Goa Landing', activities: ['Direct flight + transfer', 'Resort check-in & welcome drinks', 'Private beach afternoon', 'Fine dining at The Verandah'] },
        { day: 2, title: 'Beach & Heritage',   activities: ['Private Old Goa heritage tour', 'Spice plantation lunch', 'Spa afternoon', 'Sunset yacht cruise ₹3,000/couple'] },
        { day: 3, title: 'VIP Departure',      activities: ['Morning pool yoga', 'Gourmet Goan breakfast', 'Anjuna Market premium shopping', 'Flight back Mumbai'] },
      ],
    },
  },

  'mumbai__udaipur': {
    from: 'Mumbai', to: 'Udaipur',
    duration: '4 Days / 3 Nights', tag: 'Royal',
    silver: {
      price: 9800,
      transport: 'Train (Sleeper/AC3)',
      accommodation: 'Heritage Guesthouse near Lake',
      dining: 'Rajasthani Thali & Lakeside Cafés',
      transport_detail: 'Mewar Express (12963) or Bandra-Udaipur Express — ~12 hrs · ₹900–1,400',
      accommodation_detail: 'Nukkad Hostel / Hotel Mahendra Prakash — ₹700–1,200/night lake area',
      dining_detail: "Natraj Dining Hall · Café Edelweiss · Ambrai Restaurant (lakeside) · Dal Baati ₹120",
      perks: ['Sunset boat ride discount', 'City Palace entry help', 'Free city heritage map', 'Rooftop café access'],
      itinerary: [
        { day: 1, title: 'City Palace & Lakes', activities: ['Train arrival, guesthouse check-in', 'City Palace (₹300) guided walk', 'Jagdish Temple', 'Fateh Sagar Lake sunset', 'Ambrai restaurant lakeside dinner'] },
        { day: 2, title: 'Lake Pichola & Crafts', activities: ['Lake Pichola boat ride (₹700)', 'Jag Mandir island visit', 'Saheliyon ki Bari garden', 'Shilpgram crafts village', 'Sunset rooftop dinner'] },
        { day: 3, title: 'Kumbalgarh Day Trip',  activities: ['Kumbalgarh Fort (2 hr drive, ₹600)', 'Great Wall of India walk', 'Ranakpur Jain Temple (₹200)', 'Return Udaipur evening'] },
        { day: 4, title: 'Markets & Return',     activities: ['Hathi Pol & Bada Bazaar shopping', 'Mochi Marg leather goods', 'Udaipur station / train back'] },
      ],
    },
    gold: {
      price: 26500,
      transport: 'Flight (Mumbai→Udaipur Direct)',
      accommodation: 'Floating Palace / Heritage Hotel',
      dining: 'Lake-View Fine Dining & Royal Experiences',
      transport_detail: 'IndiGo / Air India BOM→UDR Direct — 1 hr 25 min · ₹3,500–5,000',
      accommodation_detail: 'Taj Lake Palace (in-lake) / Oberoi Udaivilas — Suite ₹20,000–40,000/night',
      dining_detail: 'Jharokha at Taj Lake Palace · Udai Terrace at Oberoi · Sunset Palace rooftop',
      perks: ['Boat transfer to lake palace', 'Private guide historian', 'Complimentary meals', 'Spa with lake views', 'Cultural dance show', 'Heritage city tour'],
      itinerary: [
        { day: 1, title: 'Lake Palace Check-In', activities: ['Private cab from airport', 'Boat transfer to Taj Lake Palace', 'Welcome with rose petals', 'Sunset from lake terrace', 'Royal Rajasthani dinner'] },
        { day: 2, title: 'Royal Udaipur',        activities: ['Private historian at City Palace', 'Exclusive Jag Mandir boat access', 'Rajasthani cuisine cooking class', 'Sundowner at Fateh Sagar'] },
        { day: 3, title: 'Countryside VIP',      activities: ['Helicopter to Kumbalgarh (optional)', 'Ranakpur Jain Temple exclusive access', 'Village safari & local craft', 'Heritage dinner show'] },
        { day: 4, title: 'Grand Departure',      activities: ['Morning spa & breakfast', 'Private Hathi Pol jewellery tour', 'Flight back Mumbai'] },
      ],
    },
  },

  /* ── BANGALORE DEPARTURES ────────────────────────────────────── */

  'bangalore__goa': {
    from: 'Bangalore', to: 'Goa',
    duration: '4 Days / 3 Nights', tag: 'Beach',
    silver: {
      price: 7800,
      transport: 'Train (Overnight)',
      accommodation: 'Beach Hostel',
      dining: 'Beach Shacks & South Indian Cafés',
      transport_detail: 'Goa Express / Vasco da Gama Express (12779) — ~11 hrs · ₹700–1,100',
      accommodation_detail: 'The Jungle Book Hostel (Anjuna) / Zostel Goa — Dorm ₹450–600/night',
      dining_detail: "Curlies Beach Club · Ritz Classic · Infantaria Bakery · Bhaji pav ₹40",
      perks: ['Breakfast included', 'Scooter rental ₹350/day', 'Beach yoga morning', 'Group bonfire evening'],
      itinerary: [
        { day: 1, title: 'North Goa',       activities: ['Train arrival at Madgaon', 'Hostel Anjuna check-in', 'Anjuna & Vagator beaches', 'Sunset at Chapora Fort', 'Curlies beach club dinner'] },
        { day: 2, title: 'South Goa',       activities: ['Palolem & Patnem beach', 'Cotigao Wildlife Sanctuary', 'Old Goa churches UNESCO', 'Panaji Fontainhas walk'] },
        { day: 3, title: 'Water Sports',    activities: ['Parasailing at Baga (₹600)', 'Jet ski (₹700)', 'Dudhsagar Waterfall trip (₹500)', 'Night market Arpora Saturday'] },
        { day: 4, title: 'Return',          activities: ['Morning swim & pack', 'Mapusa Market cashews', 'Train back to Bangalore'] },
      ],
    },
    gold: {
      price: 21000,
      transport: 'Flight (Bangalore→Goa)',
      accommodation: 'Luxury Resort',
      dining: 'Fine Dining & Private Beach',
      transport_detail: 'IndiGo / Air India BLR→GOI — 1 hr · ₹2,500–4,000',
      accommodation_detail: 'W Goa (Vagator) / Alila Diwa (Majorda) — Suite ₹12,000–20,000/night',
      dining_detail: "Rock Pool at W Goa \u00b7 Marbela Beach at W \u00b7 Alila dining \u00b7 Chef's table",
      perks: ['Airport transfer', 'Infinity pool', 'Daily breakfast', 'Beach butler', 'Spa access ₹2,000 credit', 'Water sports package'],
      itinerary: [
        { day: 1, title: 'W Goa Check-In',  activities: ['Flight + transfer to W Goa', 'Welcome cocktails at Wet bar', 'Infinity pool afternoon', 'Rock Pool dinner with DJ'] },
        { day: 2, title: 'Premium Beach',   activities: ['Private beach morning', 'PADI scuba Intro dive', 'Chef-prepared beach picnic', 'Sunset yacht ₹3,500'] },
        { day: 3, title: 'Heritage & Spa',  activities: ['Private Old Goa tour with guide', 'Savoi Spice Plantation lunch', 'W Spa full day package', 'Live music dinner'] },
        { day: 4, title: 'VIP Exit',        activities: ['Morning yoga W lawn', 'Farewell brunch', 'Shopping Mapusa', 'Flight Bangalore'] },
      ],
    },
  },

  'bangalore__coorg': {
    from: 'Bangalore', to: 'Coorg',
    duration: '3 Days / 2 Nights', tag: 'Scenic',
    silver: {
      price: 4800,
      transport: 'KSRTC Airavat Bus (AC)',
      accommodation: 'Budget Homestay',
      dining: 'Coorg Cuisine Homestay Meals',
      transport_detail: 'KSRTC Airavat BLR→Madikeri — 5 hrs · ₹500–700 | Or private taxi ₹2,500',
      accommodation_detail: 'Coorg Wilderness Resort budget / Homestay Madikeri — ₹800–1,400/night (meals included)',
      dining_detail: "Rahu's Restaurant · Coorg cuisine (pandi curry, akki roti) · Coffee estates café",
      perks: ['Coffee estate walk included', 'Breakfast + dinner at homestay', 'Jungle trek guide help', 'Birdwatching morning session'],
      itinerary: [
        { day: 1, title: 'Coffee & Forests',   activities: ['Bus to Madikeri, homestay check-in', 'Coffee estate guided walk', 'Pandi curry & akki roti dinner', 'Firefly spotting evening'] },
        { day: 2, title: 'Waterfalls & Abbey', activities: ['Abbey Falls (10 km, ₹20)', 'Namdroling Monastery Golden Temple', 'Talacauvery source of Kaveri', 'Brahmagiri Wildlife Sanctuary walk'] },
        { day: 3, title: 'Iruppu & Return',    activities: ['Iruppu Waterfalls trek (40 km)', 'Local market spices & honey', 'Coffee & tea buying', 'Bus back Bangalore'] },
      ],
    },
    gold: {
      price: 13000,
      transport: 'Private AC Cab',
      accommodation: 'Luxury Plantation Estate',
      dining: 'Estate Fine Dining & Plantation Picnics',
      transport_detail: 'Private Toyota Fortuner BLR→Coorg — 5.5 hrs · ₹5,000 round trip',
      accommodation_detail: 'Evolve Back (Kabbe) / Orange County Coorg — Cottage ₹12,000–22,000/night',
      dining_detail: 'Evolve Back Spice kitchen · Plantation breakfast · Private waterfall picnic',
      perks: ['Coffee safari with planter', 'Private forest trek with naturalist', 'Plantation spa', 'All meals gourmet', 'Fireplace cottage', 'Nature photography guide'],
      itinerary: [
        { day: 1, title: 'Plantation Luxury',   activities: ['Private cab from Bangalore', 'Evolve Back check-in & plantation tour', 'Planter high tea welcome', 'Estate fine dining dinner'] },
        { day: 2, title: 'Nature & Wellness',   activities: ['Private naturalist forest walk 5 AM', 'Brahmagiri bird-watching', 'Plantation spa treatment', 'Gourmet estate dinner'] },
        { day: 3, title: 'Falls & Return',      activities: ['Abbey Falls private morning', 'Golden Temple Namdroling', 'Estate farewell breakfast', 'Private cab back Bangalore'] },
      ],
    },
  },

  'bangalore__mysore': {
    from: 'Bangalore', to: 'Mysore',
    duration: '2 Days / 1 Night', tag: 'Heritage',
    silver: {
      price: 3800,
      transport: 'Train / KSRTC Bus',
      accommodation: 'Budget Hotel near Palace',
      dining: 'Mysore Dosa & Local Cuisine',
      transport_detail: 'Shatabdi Express (12007) BLR→MYS — 2 hrs · ₹195 Chair Car | KSRTC ₹200',
      accommodation_detail: 'Zostel Mysore / Hotel Mayura — ₹600–1,000/night near Palace',
      dining_detail: "Hotel RRR (thali) · Vinayaka Mylari (dosa birthplace) · Mysore Pak shop Guru Sweets",
      perks: ['Palace night illumination info', 'Devaraja Market guide', 'Auto tour package ₹400', 'Mysore Pak souvenir'],
      itinerary: [
        { day: 1, title: 'Palace & Market',  activities: ['Train arrival, hotel check-in', 'Mysore Palace (₹200) day visit', 'Palace illumination Sunday 7–8 PM', 'Devaraja Market shopping', 'Hotel RRR thali dinner'] },
        { day: 2, title: 'Chamundi & Return', activities: ['Chamundi Hill temple (1,000 steps or ₹30 bus)', 'Brindavan Gardens fountain show (6:30 PM)', 'St Philomenas Church', 'Train back Bangalore'] },
      ],
    },
    gold: {
      price: 10500,
      transport: 'Private Cab (AC)',
      accommodation: 'Palace Hotel',
      dining: 'Royal Mysore Cuisine at Heritage Property',
      transport_detail: 'Private Innova BLR→MYS — 3 hrs · ₹3,500 round trip',
      accommodation_detail: 'Lalitha Mahal Palace Hotel / Radisson Blu Mysore — Suite ₹6,000–12,000/night',
      dining_detail: 'Lalitha Mahal banquet · Poppys Restaurant · Royal Mysore dining experience',
      perks: ['Private guide at Palace', 'Complimentary breakfast', 'Evening palace tour exclusive', 'Yoga garden morning', 'Mysore Pak workshop', 'Spa access'],
      itinerary: [
        { day: 1, title: 'Royal Mysore',     activities: ['Private cab from Bangalore', 'Lalitha Mahal Palace hotel check-in', 'Exclusive guide at Mysore Palace', 'Palace illumination private viewing', 'Royal dinner'] },
        { day: 2, title: 'Heritage & Return', activities: ['Sunrise yoga at palace garden', 'Chamundi Hill private puja', 'Mysore Pak master class', 'Brindavan Gardens exclusive', 'Private cab back'] },
      ],
    },
  },

  /* ── CHENNAI DEPARTURES ─────────────────────────────────────── */

  'chennai__ooty': {
    from: 'Chennai', to: 'Ooty',
    duration: '3 Days / 2 Nights', tag: 'Hills',
    silver: {
      price: 5200,
      transport: 'Train + Nilgiri Toy Train',
      accommodation: 'Budget Guesthouse',
      dining: 'Nilgiri Cuisine & Tea Garden Cafés',
      transport_detail: 'Nilgiri Express (12671) Chennai→Mettupalayam — 7 hrs, then Toy Train to Ooty — 4.5 hrs · ₹810 total',
      accommodation_detail: "King's Cliff Heritage (budget wing) / Hotel Reflections \u2014 \u20b9700\u20131,200/night",
      dining_detail: "Hotel Shinkows · Sidewalk Café · Chandan's Restaurant · Tea garden picnic",
      perks: ['Toy Train boarding help', 'Botanical Garden entry tip', 'Doddabetta Peak guide', 'Tea buying guide'],
      itinerary: [
        { day: 1, title: 'Arrival & Town',     activities: ['Toy Train arrival at Ooty station', 'Hotel check-in freshen up', 'Government Botanical Garden (₹30)', 'Ooty Lake boating (₹40)', 'Chandan restaurant dinner'] },
        { day: 2, title: 'Peak & Tea',         activities: ['Doddabetta Peak (2,637m, ₹5)', 'Tea Museum (₹30)', 'Tea estate walk & tasting', 'Rose Garden (₹30)', 'Murugan Idli Shop breakfast'] },
        { day: 3, title: 'Kodanad & Return',   activities: ['Kodanad Elephant Camp (30 km)', 'Pykara Falls & Lake', 'Souvenir — Ooty chocolates & tea', 'Train back to Chennai'] },
      ],
    },
    gold: {
      price: 14000,
      transport: 'Flight to Coimbatore + Private Cab',
      accommodation: 'Heritage Colonial Hotel',
      dining: 'Heritage Dining & Private Tea Estate',
      transport_detail: 'IndiGo MAA→CJB — 1 hr · ₹2,500 + Private cab CJB→Ooty 2.5 hrs · ₹2,800',
      accommodation_detail: 'Taj Savoy Ooty / Fernhills Royale Palace — Heritage Suite ₹8,000–16,000/night',
      dining_detail: 'Savoy dining room · Fernhills Palace kitchen · Private tea estate picnic',
      perks: ['Private Nilgiri naturalist guide', 'Tea estate exclusive access', 'Spa & heated pool', 'All meals', 'Toy Train private coach', 'Heritage walk historian'],
      itinerary: [
        { day: 1, title: 'Colonial Ooty',      activities: ['Flight to Coimbatore + private cab', 'Taj Savoy check-in heritage suite', 'Private Botanical Garden evening tour', 'Colonial dinner at Savoy'] },
        { day: 2, title: 'Tea & Peaks',        activities: ['Private Doddabetta sunrise tour', 'Exclusive tea estate walk & plucking', 'Picnic lunch in tea garden', 'Spa afternoon'] },
        { day: 3, title: 'Jungle & Return',    activities: ['Mudumalai National Park safari', 'Pykara private boat ride', 'Farewell breakfast', 'Private cab to Coimbatore flight'] },
      ],
    },
  },

  'chennai__pondicherry': {
    from: 'Chennai', to: 'Pondicherry',
    duration: '2 Days / 1 Night', tag: 'Beach',
    silver: {
      price: 3500,
      transport: 'SETC Bus / Train',
      accommodation: 'French Quarter Guesthouse',
      dining: 'Tamil & French Fusion Food',
      transport_detail: 'SETC / Parveen Travels bus CHN→Pondicherry — 3.5 hrs · ₹250–400 | Or Villupuram train + taxi',
      accommodation_detail: 'Surguru Hotel / Park Guest House — ₹700–1,200/night White Town',
      dining_detail: "Surguru Restaurant · Le Café (beachfront) · Café des Arts · Mahe Cafe (₹80 meals)",
      perks: ['French Quarter guided walk', 'Auroville day trip info', 'Beach promenade morning', 'Heritage map included'],
      itinerary: [
        { day: 1, title: 'French Quarter',   activities: ['Bus arrival, guesthouse check-in', 'French Quarter heritage walk (Rue Suffren)', 'Rock Beach sunset promenade', 'Le Café Pondicherry dinner', 'White Town evening cycling'] },
        { day: 2, title: 'Auroville & Beach', activities: ['Auroville Matrimandir visit (book ahead, ₹0)', 'Sri Aurobindo Ashram', 'Promenade Beach morning stroll', 'Pondicherry Museum', 'Bus back Chennai'] },
      ],
    },
    gold: {
      price: 9500,
      transport: 'Private AC Cab',
      accommodation: 'Boutique Heritage Hotel French Quarter',
      dining: 'Award-Winning French-Tamil Restaurants',
      transport_detail: 'Private Innova CHN→Pondicherry — 3.5 hrs · ₹3,000 round trip',
      accommodation_detail: 'Palais de Mahe / Villa Shanti — Boutique Suite ₹7,000–14,000/night',
      dining_detail: 'Palais de Mahe kitchen · Villa Shanti rooftop · Saveur at Palais',
      perks: ['Private heritage walk historian', 'Sunrise yoga at beach', 'Complimentary meals', 'Auroville VIP access', 'Cycling tour of White Town', 'Rooftop cocktails'],
      itinerary: [
        { day: 1, title: 'Boutique Pondicherry', activities: ['Private cab from Chennai', 'Palais de Mahe check-in', 'Private French Quarter walk with historian', 'Rooftop dinner White Town views'] },
        { day: 2, title: 'Auroville & Beach',    activities: ['Sunrise beach yoga', 'Auroville exclusive inner zone access', 'Sri Aurobindo Ashram meditation', 'Farewell brunch', 'Private cab Chennai'] },
      ],
    },
  },

  /* ── KOLKATA DEPARTURES ─────────────────────────────────────── */

  'kolkata__darjeeling': {
    from: 'Kolkata', to: 'Darjeeling',
    duration: '4 Days / 3 Nights', tag: 'Hills',
    silver: {
      price: 7200,
      transport: 'Train to NJP + Toy Train / Cab',
      accommodation: 'Budget Guesthouse',
      dining: 'Tibetan & Bengali Mountain Cuisine',
      transport_detail: 'Darjeeling Mail (12343) KOL→NJP — 8 hrs · ₹700, then Toy Train NJP→Darjeeling 4 hrs (₹665)',
      accommodation_detail: 'Zostel Darjeeling / Hotel Dekeling — ₹500–900/night near Mall Road',
      dining_detail: "Kunga Restaurant · Glenary's Bakery · Nathmulls tea tasting · Tibetan momos ₹70",
      perks: ['Tiger Hill sunrise trip', 'Tea estate walk included', 'Toy Train boarding help', 'Himalayan viewpoint map'],
      itinerary: [
        { day: 1, title: 'Mall Road & Views',    activities: ['Toy Train / jeep arrival', 'Hotel check-in', 'Mall Road stroll', 'Observatory Hill Mahakal Temple', 'Glenary\'s bakery tea'] },
        { day: 2, title: 'Tiger Hill Sunrise',   activities: ['Tiger Hill 4 AM (₹200, jeep ₹800)', 'Batasia Loop Toy Train loop', 'Ghoom Monastery', 'Tea estate Makaibari walk', 'Nathmulls tea shopping'] },
        { day: 3, title: 'Mirik Day Trip',       activities: ['Mirik Lake (70 km, jeep ₹300)', 'Orange orchards walk', 'Rock Garden Darjeeling', 'Japanese Peace Pagoda'] },
        { day: 4, title: 'Departure',            activities: ['Morning Himalayan view', 'Happy Valley Tea Estate', 'Chowrasta Mall', 'Train back to Kolkata'] },
      ],
    },
    gold: {
      price: 19500,
      transport: 'Flight to Bagdogra + Private Cab',
      accommodation: 'Heritage Plantation Bungalow',
      dining: 'Heritage Dining & Private Tea Estate',
      transport_detail: 'IndiGo CCU→IXB (Bagdogra) — 1 hr · ₹3,000 + Private cab to Darjeeling 2 hrs · ₹2,500',
      accommodation_detail: 'Glenburn Tea Estate (all-inclusive) / Elgin Darjeeling — Heritage Suite ₹12,000–25,000/night',
      dining_detail: "Glenburn Estate table d\u2019h\u00f4te \u00b7 Elgin dining room \u00b7 Private Himalayan picnic",
      perks: ['All meals gourmet', 'Tea estate exclusive access', 'Private naturalist guide', 'Tiger Hill VIP sunrise', 'Heritage walk', 'Spa & garden walks'],
      itinerary: [
        { day: 1, title: 'Tea Estate Arrival',   activities: ['Flight + private cab', 'Glenburn Tea Estate check-in', 'Welcome tea with estate planter', 'Sunset Himalayan view', 'Estate table dhote dinner'] },
        { day: 2, title: 'Tiger Hill & Estate',  activities: ['Private Tiger Hill 4 AM drive', 'Kanchenjunga sunrise view', 'Tea plucking private tour', 'Estate spa morning', 'Afternoon bird-watching'] },
        { day: 3, title: 'Monastery & Town',     activities: ['Private guide Ghoom & Yiga Choeling Monastery', 'Exclusive mall heritage walk', 'Tea tasting master class', 'Himalayan views dinner'] },
        { day: 4, title: 'Grand Return',         activities: ['Estate farewell breakfast', 'Private cab to Bagdogra', 'Flight back Kolkata'] },
      ],
    },
  },

  /* ── DELHI → AMRITSAR ────────────────────────────────────────── */

  'delhi__amritsar': {
    from: 'Delhi', to: 'Amritsar',
    duration: '3 Days / 2 Nights', tag: 'Spiritual',
    silver: {
      price: 6500,
      transport: 'Train (Shatabdi)',
      accommodation: 'Budget Guesthouse near Golden Temple',
      dining: 'Punjabi Street Food & Langar',
      transport_detail: 'Swarna Shatabdi (12029) DEL→ASR — 5.5 hrs · ₹825 Chair Car (includes breakfast)',
      accommodation_detail: 'Moustache Hostel Amritsar / Hotel Prakash — ₹600–1,000/night GT area',
      dining_detail: 'Golden Temple Langar (free) · Brothers Dhaba · Kesar Da Dhaba · Chole Bhature ₹80',
      perks: ['Golden Temple orientation', 'Wagah Border timing info', 'Free langar meal experience', 'Heritage walk map'],
      itinerary: [
        { day: 1, title: 'Golden Temple',      activities: ['Train arrival, guesthouse check-in', 'Golden Temple Harmandir Sahib darshan', 'Akali Takht & Jallianwala Bagh (₹0)', 'Langar community meal', 'Brothers Dhaba dinner'] },
        { day: 2, title: 'Wagah Border',       activities: ['Wagah Border Retreat Ceremony (6 PM)', 'Partition Museum (₹200)', 'Hall Bazaar shopping', 'Amritsari kulcha breakfast ₹80'] },
        { day: 3, title: 'Durgiana & Return', activities: ['Durgiana Temple morning', 'Ram Bagh garden', 'Souvenir phulkari shopping', 'Train back Delhi'] },
      ],
    },
    gold: {
      price: 16000,
      transport: 'Flight or AC Cab',
      accommodation: 'Heritage Hotel near Golden Temple',
      dining: 'Award-Winning Punjabi Fine Dining',
      transport_detail: 'IndiGo DEL→ATQ — 55 min · ₹3,000 | Or private Fortuner 5 hrs · ₹5,500',
      accommodation_detail: 'Taj Swarna Amritsar — Heritage Suite ₹8,000–14,000/night',
      dining_detail: 'Crystal Restaurant (oldest 1972) · Kesar Da Dhaba (since 1916) · Taj rooftop',
      perks: ['VIP Golden Temple darshan early morning', 'Private guide', 'Complimentary breakfast', 'Airport transfer', 'Heritage walk historian', 'Spa access'],
      itinerary: [
        { day: 1, title: 'Golden Temple VIP', activities: ['Flight + transfer to Taj Swarna', 'VIP early morning darshan Golden Temple', 'Private guide Jallianwala Bagh', 'Rooftop dinner with GT view'] },
        { day: 2, title: 'Border & Heritage', activities: ['Wagah Border VIP seating arrangement', 'Partition Museum guided tour', 'Heritage walk historian old city', 'Kesar Da Dhaba exclusive dinner'] },
        { day: 3, title: 'Culture & Return',  activities: ['Sunrise at Golden Temple', 'Spa morning', 'Premium phulkari shopping', 'Flight back Delhi'] },
      ],
    },
  },
}

/**
 * DESTINATION_KNOWLEDGE — used to generate realistic itineraries
 * for any route not in CURATED_ROUTES above.
 */
const DESTINATION_KNOWLEDGE = {
  goa:           { tag: 'Beach',     activities: ['Calangute & Baga beach', 'Old Goa UNESCO churches', 'Anjuna Flea Market', 'Dudhsagar Waterfall jeep trip', 'Palolem beach', 'Spice plantation tour', 'Water sports', 'Beach shack seafood', 'Panaji Latin Quarter walk', 'Sunset yacht cruise'] },
  manali:        { tag: 'Mountains', activities: ['Solang Valley snow activities', 'Hadimba Devi Temple', 'Old Manali village walk', 'Rohtang Pass (seasonal)', 'Paragliding at Solang', 'Beas Kund trek', 'Kasol day trip', 'Tibetan Monastery', 'Mall Road stroll', 'River rafting on Beas'] },
  varanasi:      { tag: 'Spiritual', activities: ['Ganga Aarti at Dashashwamedh Ghat', 'Sunrise boat ride on Ganga', 'Kashi Vishwanath Temple', 'Sarnath Buddhist ruins', 'Narrow lane heritage walk', 'Banarasi silk weaving visit', 'Ramnagar Fort', 'Manikarnika Ghat walk', 'Blue Lassi corner', 'Banaras Hindu University'] },
  jaipur:        { tag: 'Heritage',  activities: ['Amer Fort', 'Hawa Mahal', 'City Palace', 'Jantar Mantar UNESCO', 'Nahargarh Fort sunset', 'Johari Bazaar gems', 'Jaigarh Fort', 'Chokhi Dhani cultural evening', 'Bapu Bazaar shopping', 'Jal Mahal view'] },
  udaipur:       { tag: 'Royal',     activities: ['City Palace complex', 'Lake Pichola boat ride', 'Jag Mandir island', 'Saheliyon ki Bari garden', 'Fateh Sagar Lake sunset', 'Shilpgram crafts village', 'Kumbalgarh Fort day trip', 'Ambrai restaurant lakeside', 'Vintage car museum', 'Ranakpur Jain Temple'] },
  rishikesh:     { tag: 'Adventure', activities: ['White water rafting Ganga', 'Bungee jumping (₹3,550)', 'Ganga Aarti Triveni Ghat', 'Laxman & Ram Jhula', 'Beatles Ashram', 'Sunrise yoga session', 'Kunjapuri Devi trek', 'Neelkanth Mahadev temple hike', 'Kayaking course', 'Cliff jumping'] },
  shimla:        { tag: 'Hills',     activities: ['Mall Road stroll', 'Christ Church & The Ridge', 'Jakhu Temple hike', 'Kufri adventure park', 'Chail Palace', 'Kalka-Shimla Toy Train', 'Viceregal Lodge', 'Tara Devi Temple', 'State Museum', 'Chadwick Falls'] },
  darjeeling:    { tag: 'Hills',     activities: ['Tiger Hill sunrise', 'Batasia Loop Toy Train', 'Ghoom Monastery', 'Makaibari Tea Estate walk', 'Happy Valley Tea Estate', 'Observatory Hill', 'Mirik Lake day trip', 'Nathmulls tea tasting', 'Japanese Peace Pagoda', 'Rock Garden'] },
  amritsar:      { tag: 'Spiritual', activities: ['Golden Temple darshan', 'Wagah Border Retreat Ceremony', 'Jallianwala Bagh', 'Partition Museum', 'Langar community meal', 'Durgiana Temple', 'Hall Bazaar shopping', 'Amritsari kulcha breakfast', 'Ram Bagh garden', 'Gobindgarh Fort'] },
  agra:          { tag: 'Heritage',  activities: ['Taj Mahal sunrise entry', 'Agra Fort UNESCO', 'Fatehpur Sikri', 'Mehtab Bagh sunset Taj view', 'Itmad-ud-Daulah', 'Kinari Bazaar', 'Taj Museum', 'Mughal Kitchen cooking class', 'Petha sweets factory', 'Akbar Tomb Sikandra'] },
  mysore:        { tag: 'Heritage',  activities: ['Mysore Palace', 'Palace illumination Sunday', 'Chamundi Hill temple', 'Brindavan Gardens fountain show', 'Devaraja Market', 'Mysore Zoo', 'St Philomena\'s Church', 'Jaganmohan Palace art gallery', 'Mysore Pak workshop', 'Ranganathittu Bird Sanctuary'] },
  ooty:          { tag: 'Hills',     activities: ['Doddabetta Peak', 'Nilgiri Mountain Railway (Toy Train)', 'Botanical Garden', 'Tea Museum & estate walk', 'Ooty Lake boating', 'Mudumalai National Park', 'Pykara Falls', 'Rose Garden', 'Kodanad Elephant Camp', 'Wax World museum'] },
  munnar:        { tag: 'Hills',     activities: ['Tea estate walk', 'Eravikulam National Park (Nilgiri Tahr)', 'Mattupetty Dam & Indo-Swiss farm', 'Echo Point', 'Attukal Waterfalls', 'Anamudi Peak view', 'Kundaly Lake', 'Pothamedu Viewpoint', 'Rajamala wildlife', 'Tea Museum'] },
  coorg:         { tag: 'Scenic',    activities: ['Coffee estate walk', 'Abbey Falls', 'Namdroling Golden Temple', 'Talacauvery source', 'Brahmagiri Wildlife Sanctuary', 'Iruppu Waterfalls trek', 'Chiklihole Reservoir', 'Raja\'s Seat sunset', 'Kodagu cuisine', 'White water rafting Barapole'] },
  pondicherry:   { tag: 'Beach',     activities: ['French Quarter heritage walk', 'Auroville Matrimandir', 'Promenade Beach', 'Sri Aurobindo Ashram', 'Paradise Beach boat', 'Serenity Beach surfing', 'White Town cycling', 'Botanical Garden', 'Pondicherry Museum', 'Café des Arts'] },
  alleppey:      { tag: 'Backwaters', activities: ['Houseboat Alleppey Backwaters', 'Vembanad Lake sunset', 'Kumarakom Bird Sanctuary', 'Shikara ride', 'Toddy shop fish curry', 'Coir making workshop', 'Krishnapuram Palace', 'Ambalapuzha Temple', 'Marari Beach', 'Mangrove forest tour'] },
  kashmir:       { tag: 'Mountains', activities: ['Dal Lake Shikara ride', 'Mughal Gardens (Shalimar, Nishat, Chashme Shahi)', 'Gulmarg Gondola (Asia\'s highest)', 'Pahalgam Betaab Valley', 'Sonamarg glacier trek', 'Wular Lake', 'Shankaracharya Temple', 'Old City saffron market', 'Carpet weaving workshop', 'Zero Point Sonmarg'] },
  spiti:         { tag: 'Adventure', activities: ['Key Monastery (4,166m)', 'Kaza main bazaar', 'Chicham Bridge (Asia\'s highest village bridge)', 'Komic village (world\'s highest motorable road)', 'Pin Valley National Park', 'Tabo Monastery (AD 996)', 'Kunzum Pass', 'Chandratal Lake trek', 'Mud Village', 'Fossil site Langza'] },
  default:       { tag: 'Explore',   activities: ['Heritage monument visit', 'Local market exploration', 'Cultural food experience', 'Scenic viewpoint trek', 'Museum visit', 'Local craft workshop', 'Riverside/lakeside walk', 'Sunrise/sunset viewpoint', 'Temple/spiritual site', 'Local cuisine dinner'] },
}

module.exports = { CURATED_ROUTES, DESTINATION_KNOWLEDGE }
