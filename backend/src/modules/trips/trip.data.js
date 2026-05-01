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

/**
 * DESTINATION_STREET_FOOD — must-try street foods & local bites per place.
 *
 * Each entry: { emoji, name, description, where? }
 *   - `name`       short dish name
 *   - `description` 1-line "what is it" so non-locals understand
 *   - `where`      famous shop / locality / market (optional)
 *
 * Keys must match (or be substrings of) the keys in DESTINATION_KNOWLEDGE.
 * `default` is used when no destination key matches.
 */
const DESTINATION_STREET_FOOD = {
  goa: [
    { emoji: '🥖', name: 'Choris Pão',         description: 'Spicy Goan chorizo sausage stuffed inside crusty pão bread.', where: 'Mapusa Friday Market · Margao' },
    { emoji: '🍳', name: 'Ros Omelette',       description: 'Fluffy omelette drowned in spicy chickpea curry, served with pão.', where: 'Anand Stores (Mapusa) · roadside carts in Panjim' },
    { emoji: '🐟', name: 'Rava Fried Fish',    description: 'Mackerel or kingfish coated in semolina and pan-fried till crisp.', where: 'Beach shacks · local fish thali joints' },
    { emoji: '🥧', name: 'Goan Beef Cutlet Pão', description: 'Spiced minced-meat cutlet inside a soft bun — Goa\'s favourite snack.', where: 'Café Bhonsle · railway station stalls' },
    { emoji: '🍰', name: 'Bebinca',            description: 'Layered Indo-Portuguese dessert made with coconut milk and egg yolks.', where: 'Confeitaria 31 de Janeiro (Panjim)' },
    { emoji: '🍞', name: 'Sannas + Sorpotel',  description: 'Steamed coconut rice cakes paired with fiery pork sorpotel.', where: 'Catholic households · Sunday markets' },
    { emoji: '🍮', name: 'Serradura',          description: '"Sawdust pudding" — crushed Marie biscuits + whipped cream.', where: 'Bakeries across Panjim & Margao' },
  ],

  manali: [
    { emoji: '🥟', name: 'Sidu',               description: 'Steamed wheat-flour bun stuffed with poppy seeds or walnuts; eaten with ghee + dal.', where: 'Old Manali dhabas · Hadimba Temple area' },
    { emoji: '🍛', name: 'Chha Gosht',         description: 'Yogurt-marinated lamb curry — flagship Himachali dish.', where: 'Johnson\'s Café · Café 1947' },
    { emoji: '🍚', name: 'Tudkiya Bhath',      description: 'Pahadi pulao cooked with lentils, potatoes & whole spices.', where: 'Mall Road local restaurants' },
    { emoji: '🐟', name: 'Kullu Trout Tikka',  description: 'Fresh Beas-river trout marinated and grilled tandoor-style.', where: 'The Lazy Dog (Old Manali)' },
    { emoji: '🥞', name: 'Babru',              description: 'Black-gram-stuffed kachori, the Himachali cousin of kachori.', where: 'Manu Market street stalls' },
    { emoji: '🍲', name: 'Madra',              description: 'Chickpeas slow-cooked in yogurt gravy — temple/festival staple.', where: 'Local Himachali thali places' },
    { emoji: '☕', name: 'Siddu with butter tea', description: 'Hot siddu paired with salty Tibetan butter tea — perfect in snowfall.', where: 'Old Manali cafés near Manu Temple' },
  ],

  varanasi: [
    { emoji: '🥛', name: 'Banarasi Lassi',     description: 'Thick, malai-topped lassi served in clay kulhads.', where: 'Blue Lassi Shop · Pehelwan Lassi' },
    { emoji: '🥟', name: 'Kachori-Sabzi',      description: 'Crisp lentil-stuffed kachori with spicy aloo sabzi — the Banarasi breakfast.', where: 'Ram Bhandar (Thatheri Bazaar) · Kashi Chaat Bhandar' },
    { emoji: '🍅', name: 'Tamatar Chaat',      description: 'Tangy mashed-tomato chaat unique to Varanasi.', where: 'Deena Chaat Bhandar · Kashi Chaat Bhandar' },
    { emoji: '❄️', name: 'Malaiyo (winter only)', description: 'Saffron-infused milk foam, served only in winter mornings.', where: 'Lanes around Kashi Vishwanath · Chowk' },
    { emoji: '🍃', name: 'Banarasi Paan',      description: 'Famous magahi-leaf paan — a post-meal ritual.', where: 'Keshav Paan Bhandar · Godowlia Chowk' },
    { emoji: '🍢', name: 'Choora Matar',       description: 'Flattened-rice flakes cooked with green peas and ghee — winter special.', where: 'Vishwanath Gali street vendors' },
    { emoji: '🥘', name: 'Litti-Chokha',       description: 'Wheat balls stuffed with sattu, served with mashed brinjal-tomato.', where: 'Assi Ghat evening stalls' },
  ],

  jaipur: [
    { emoji: '🧅', name: 'Pyaaz Kachori',      description: 'Flaky kachori stuffed with spiced onions, drizzled with chutneys.', where: 'Rawat Mishthan Bhandar (Sindhi Camp)' },
    { emoji: '🌶️', name: 'Mirchi Bada',        description: 'Large green chilli stuffed with potato masala and deep-fried.', where: 'Samrat Restaurant · Sahu Chai Wala' },
    { emoji: '🍲', name: 'Dal Baati Churma',   description: 'Baked wheat dumplings + dal + sweet ghee-laced churma — the Rajasthani thali.', where: 'Chokhi Dhani · LMB Hotel' },
    { emoji: '🍯', name: 'Ghewar',             description: 'Honeycomb-textured disc-shaped sweet, esp. during Teej & Raksha Bandhan.', where: 'Laxmi Mishthan Bhandar (LMB) · Rawat' },
    { emoji: '🥛', name: 'Lassi at Lassiwala', description: 'Iconic kulhad lassi — accept no imitations on MI Road.', where: 'Lassiwala (since 1944), MI Road' },
    { emoji: '🍢', name: 'Mawa Kachori',       description: 'Sweet kachori stuffed with mawa, dipped in sugar syrup.', where: 'Rawat Mishthan Bhandar' },
    { emoji: '🍛', name: 'Rajasthani Thali',   description: 'Gatte ki sabzi, ker sangri, bajra roti, churma — the full state on a plate.', where: 'Spice Court · Handi Restaurant' },
  ],

  udaipur: [
    { emoji: '🍲', name: 'Dal Baati Churma',   description: 'Trio of baati, dal, and sweet churma — Mewar staple.', where: 'Natraj Dining Hall · Hari Garh' },
    { emoji: '🌿', name: 'Ker Sangri',         description: 'Desert berries + beans tempered with mustard oil and spices.', where: 'Ambrai Restaurant · Mewari thali joints' },
    { emoji: '🥟', name: 'Pyaaz Kachori',      description: 'Hot, spiced onion kachori — the universal Rajasthani snack.', where: 'Jagdish Marwari Bhojnalaya' },
    { emoji: '🍯', name: 'Ghevar',             description: 'Festive sweet disc soaked in syrup, topped with rabdi.', where: 'Sweet shops near Ghantaghar' },
    { emoji: '🥘', name: 'Gatte ki Sabzi',     description: 'Gram-flour dumplings simmered in spiced yogurt gravy.', where: 'Mewari thali at Natraj' },
    { emoji: '🍢', name: 'Mirchi Vada',        description: 'Mild green chilli stuffed with potato, deep-fried in besan batter.', where: 'Hathi Pol street stalls' },
    { emoji: '🍵', name: 'Masala Chai by Lake Pichola', description: 'Cardamom-laced chai with a lake view — pure Udaipur.', where: 'Jagdish Temple chowk vendors' },
  ],

  rishikesh: [
    { emoji: '🥔', name: 'Aloo Puri',          description: 'Fluffy puris with a tangy aloo sabzi — pilgrim breakfast.', where: 'Chotiwala (Swarg Ashram)' },
    { emoji: '🥟', name: 'Pahari Kachori',     description: 'Hill-style kachori with urad dal stuffing.', where: 'Triveni Ghat market' },
    { emoji: '🍛', name: 'Aloo ke Gutke',      description: 'Pan-fried potato cubes tossed with garlic and red chillies.', where: 'Garhwali eateries near Ram Jhula' },
    { emoji: '🍰', name: 'Ganga-side German Bakery treats', description: 'Hippie-trail brownies, apple strudel & banana cake.', where: 'Little Buddha Café · Ramana\'s Garden' },
    { emoji: '🍵', name: 'Adrak Chai',         description: 'Strong ginger chai — riverside ashram favourite.', where: 'Stalls near Lakshman Jhula' },
    { emoji: '🍯', name: 'Gulab Jamun',        description: 'Hot jamuns from temple sweet shops — pure ghee, no milk powder.', where: 'Bhandari Sweets, Tapovan' },
    { emoji: '🌿', name: 'Sattu Sharbat',      description: 'Roasted-gram drink with mint, lemon and salt — post-rafting refresher.', where: 'Roadside stalls before bridges' },
  ],

  shimla: [
    { emoji: '🥟', name: 'Sidu',               description: 'Yeasted steamed bun with poppy/walnut filling, eaten with ghee.', where: 'Indian Coffee House · local dhabas' },
    { emoji: '🍲', name: 'Chana Madra',        description: 'Chickpeas in spiced yogurt gravy — Himachal\'s signature.', where: 'Himachali Rasoi · Wake & Bake' },
    { emoji: '🐟', name: 'Trout Tikka',        description: 'Local Beas-river trout grilled on tandoor.', where: 'Café Sol · Devicos' },
    { emoji: '🥞', name: 'Babru',              description: 'Black-gram-stuffed flatbread, deep-fried Himachali kachori.', where: 'Lower Bazaar street vendors' },
    { emoji: '🍛', name: 'Dham (festive thali)', description: 'Multi-course Pahari feast — madra, kadhi, mash dal, mittha.', where: 'Hotel Combermere on weekends' },
    { emoji: '🍿', name: 'Bun Samosa',         description: 'Crisp samosa stuffed inside a bun bun — quick Mall-Road bite.', where: 'Mall Road tea stalls' },
    { emoji: '☕', name: 'Bun Tikki at Indian Coffee House', description: 'Iconic since the 1950s — bun, tikki & filter coffee.', where: 'Indian Coffee House, The Mall' },
  ],

  darjeeling: [
    { emoji: '🥟', name: 'Steamed Momos',      description: 'Pork or veg dumplings with fiery dalle-chilli chutney.', where: 'Kunga Restaurant · Hot Stimulating Café' },
    { emoji: '🍜', name: 'Thukpa',             description: 'Tibetan noodle-soup with vegetables/meat — perfect in the cold.', where: 'Glenary\'s · Lunar Restaurant' },
    { emoji: '🥬', name: 'Gundruk Soup',       description: 'Fermented leafy-green soup, sour and warming.', where: 'Nepali eateries near Chowrasta' },
    { emoji: '🍩', name: 'Sel Roti',           description: 'Crisp Nepali rice-flour ring doughnut — festival classic.', where: 'Local Nepali tea-shops' },
    { emoji: '🥩', name: 'Phagshapa',          description: 'Pork belly slow-cooked with radish and dried chillies.', where: 'Dekevas Restaurant · Sonam\'s Kitchen' },
    { emoji: '🥔', name: 'Aloo Dum',           description: 'Spicy baby-potato curry, often eaten with churpi cheese.', where: 'Chowrasta evening stalls' },
    { emoji: '☕', name: 'Darjeeling First-Flush Tea', description: 'Light, muscatel "champagne of teas" — taste at estate cafés.', where: 'Nathmulls · Sunset Lounge' },
  ],

  amritsar: [
    { emoji: '🫓', name: 'Amritsari Kulcha',   description: 'Crisp tandoor-baked kulcha stuffed with potato/paneer.', where: 'Kulcha Land · Monga Kulcha' },
    { emoji: '🍛', name: 'Chole Bhature',      description: 'Massive bhatura with spicy chickpea curry — Punjabi power-breakfast.', where: 'Kanha Sweets · Brothers Dhaba' },
    { emoji: '🥛', name: 'Sweet Lassi',        description: 'Thick lassi with malai cap, served in giant glasses.', where: 'Ahuja Lassi (since 1955)' },
    { emoji: '🌽', name: 'Sarson da Saag + Makki di Roti', description: 'Mustard-greens curry with corn-meal flatbread, dollops of butter.', where: 'Kesar da Dhaba (since 1916)' },
    { emoji: '🐟', name: 'Amritsari Fish',     description: 'Sole/singhara fish dunked in ajwain-besan batter and fried.', where: 'Makhan Fish & Chicken Corner' },
    { emoji: '🍮', name: 'Jalebi at Gurdas Ram', description: 'Saffron-yellow, crisp jalebis fried in pure desi ghee.', where: 'Gurdas Ram Jalebi Wala (since 1900s)' },
    { emoji: '🍲', name: 'Langar at Golden Temple', description: 'Free, simple, sacred kar-seva meal eaten with thousands of pilgrims.', where: 'Sri Harmandir Sahib langar hall' },
  ],

  agra: [
    { emoji: '🍬', name: 'Agra Petha',         description: 'Translucent ash-gourd candy in dry, kesari & paan flavours.', where: 'Panchhi Petha (Hari Parvat)' },
    { emoji: '🥟', name: 'Bedai + Jalebi',     description: 'Crisp dal-stuffed kachori with potato sabzi and hot jalebi.', where: 'Deviram Sweet Shop · GMB' },
    { emoji: '🍢', name: 'Mughlai Paratha',    description: 'Egg-and-keema-stuffed flaky paratha — Agra Fort bazaar staple.', where: 'Sadar Bazaar lanes' },
    { emoji: '🍖', name: 'Galouti Kebab',      description: 'Melt-in-mouth minced-mutton kebabs perfumed with Mughal spices.', where: 'Pinch of Spice · Esphahan (Oberoi)' },
    { emoji: '🍿', name: 'Dalmoth',            description: 'Spicy fried-lentil savoury mix — Agra\'s famous namkeen.', where: 'Panchhi Dalmoth shops' },
    { emoji: '🥗', name: 'Chaat at Deviram',   description: 'Old-school aloo-tikki and dahi-bhalla chaat near Sadar.', where: 'Deviram (Sadar Bazaar)' },
    { emoji: '🍞', name: 'Mughal Kitchen Biryani', description: 'Fragrant zafrani biryani recipe descended from royal kitchens.', where: 'Pind Balluchi · Esphahan' },
  ],

  mysore: [
    { emoji: '🍯', name: 'Mysore Pak',         description: 'Ghee-rich, crumbly gram-flour fudge — invented in the palace kitchens.', where: 'Guru Sweets (Devaraja Market)' },
    { emoji: '🌯', name: 'Mylari Dosa',        description: 'Soft, butter-laden dosa with a special chutney; small but legendary.', where: 'Mylari Dosa (Nazarbad) · Original Vinayaka Mylari' },
    { emoji: '🍚', name: 'Bisi Bele Bath',     description: 'Spicy rice-lentil-vegetable one-pot dish, served with khara boondi.', where: 'Hotel RRR · Vinayaka Mylari' },
    { emoji: '🍛', name: 'Idli-Vada-Sambar',   description: 'Fluffy idli, crisp medu vada, drowned in steaming sambar.', where: 'Hotel Original Vinayaka Mylari · Mahesh Prasad' },
    { emoji: '🥣', name: 'Rava Idli',          description: 'Semolina-cashew idli — a Mysore creation born in WWII.', where: 'MTR (since 1924)' },
    { emoji: '☕', name: 'Mysore Filter Coffee', description: 'Strong, frothy decoction served in steel davara-tumbler.', where: 'Mylari Coffee · Sapna Book House café' },
    { emoji: '🥬', name: 'Maddur Vada',        description: 'Crispy onion-rice-flour vada, train-station classic of Karnataka.', where: 'Stalls along Mysore-Bengaluru highway' },
  ],

  ooty: [
    { emoji: '🍪', name: 'Varkey',             description: 'Flaky, buttery layered biscuit unique to Ooty\'s bakeries.', where: 'King Star Bakery · Modern Stores' },
    { emoji: '🍫', name: 'Homemade Chocolates', description: 'Rum-raisin, mint, fudge — Ooty\'s souvenir of choice.', where: 'Modern Stores · Sugar Shack' },
    { emoji: '🥨', name: 'Pakkoda',            description: 'Crisp gram-flour fritters, hot off the wok in misty weather.', where: 'Ooty Bus Stand stalls' },
    { emoji: '🥞', name: 'Avalakki (Poha)',    description: 'Beaten-rice pilaf with peanuts and curry leaves — hill-station breakfast.', where: 'Local Iyengar tiffin houses' },
    { emoji: '☕', name: 'Nilgiri Tea + Filter Coffee', description: 'Estate-fresh Nilgiri tea or strong filter kaapi.', where: 'Tea Factory & Tea Museum café' },
    { emoji: '🍌', name: 'Pazham Pori',        description: 'Crispy banana fritters — Tamil-Kerala border favourite.', where: 'Charing Cross stalls' },
    { emoji: '🥒', name: 'Carrot Halwa',       description: 'Hot gajar halwa with cashews — winter Ooty must-try.', where: 'Hyderabad Biryani House · roadside stalls' },
  ],

  munnar: [
    { emoji: '🍛', name: 'Appam with Stew',    description: 'Lacy rice-coconut pancake with mild meat-and-veggie stew.', where: 'Saravana Bhavan · Sree Krishna' },
    { emoji: '🍌', name: 'Banana Chips',       description: 'Coconut-oil-fried Nendran banana wafers, hot off the kadhai.', where: 'Old Munnar town shops' },
    { emoji: '🐟', name: 'Karimeen Pollichathu', description: 'Pearl-spot fish marinated, wrapped in banana leaf, pan-roasted.', where: 'Rapsy Restaurant · Saravana' },
    { emoji: '🥥', name: 'Puttu + Kadala Curry', description: 'Steamed coconut-rice cylinders with black chickpea curry.', where: 'Local Kerala thali shops' },
    { emoji: '🍢', name: 'Idiyappam + Egg Curry', description: 'String-hoppers with spiced egg curry — proper Kerala breakfast.', where: 'SN Restaurant' },
    { emoji: '🌿', name: 'Ela Ada',            description: 'Steamed banana-leaf parcels of rice flour with jaggery & coconut.', where: 'Tea-shops along Mattupetty road' },
    { emoji: '☕', name: 'Cardamom Chai',      description: 'Strong tea infused with Munnar cardamom — drink it at the spice plantation.', where: 'Lockhart Tea Factory · plantation tours' },
  ],

  coorg: [
    { emoji: '🍖', name: 'Pandi Curry',        description: 'Coorg pork curry made with kachampuli vinegar — the regional flagship.', where: 'Raintree · Coorg Cuisine (Madikeri)' },
    { emoji: '🌾', name: 'Akki Roti',          description: 'Rice-flour flatbread cooked on banana leaf — paired with chutney pudi.', where: 'Local home-stays · Raintree' },
    { emoji: '🍚', name: 'Kadambuttu',         description: 'Steamed rice dumplings, eaten with pandi curry or coconut chutney.', where: 'Coorg traditional thali joints' },
    { emoji: '🌱', name: 'Bamboo Shoot Curry', description: 'Tender bamboo shoots cooked with spices — monsoon special.', where: 'Tata Coffee bungalow stays' },
    { emoji: '☕', name: 'Coorg Filter Coffee', description: 'Plantation-fresh decoction — the world\'s reason to love South Indian coffee.', where: 'Tata Coffee · Plantation Trails' },
    { emoji: '🍯', name: 'Wild Honey',         description: 'Forest-harvested honey from Coorg\'s rich biodiversity.', where: 'Madikeri Sunday Market' },
    { emoji: '🍲', name: 'Noolputtu (string hoppers)', description: 'Rice-noodle nests eaten with chicken or vegetable stew.', where: 'Home-stay kitchens' },
  ],

  pondicherry: [
    { emoji: '🥖', name: 'French Baguette + Croissant', description: 'Crusty baguettes & buttery croissants — French Quarter breakfast.', where: 'Baker Street (rue Bussy)' },
    { emoji: '🍳', name: 'Veechu Parotta',     description: 'Hand-tossed Tamil parotta paired with salna or egg curry.', where: 'Surguru · Hot Breads' },
    { emoji: '🍲', name: 'Pondichéry Bouillabaisse', description: 'Indo-French fish stew with saffron, fennel and Coromandel seafood.', where: 'Le Café (Promenade) · Villa Shanti' },
    { emoji: '🍰', name: 'Mille-Feuille',      description: 'Layered French pastry with vanilla cream — Auroville bakery favourite.', where: 'Café des Arts · Auroville Bakery' },
    { emoji: '🍛', name: 'Pondi-Style Biryani', description: 'Mild biryani with French herbs — fusion you can\'t get elsewhere.', where: 'Surguru · Appachi' },
    { emoji: '☕', name: 'Filter Kaapi',       description: 'Strong Tamil-style filter coffee in steel tumblers.', where: 'Surguru · Indian Coffee House' },
    { emoji: '🍫', name: 'Auroville Chocolates', description: 'Organic, hand-made chocolates from the international township.', where: 'Auroville Visitor Centre · Boutique d\'Auroville' },
  ],

  alleppey: [
    { emoji: '🐟', name: 'Karimeen Pollichathu', description: 'Pearl-spot fish wrapped in banana leaf, slow-cooked with masala.', where: 'Houseboat dining · Mushroom Restaurant' },
    { emoji: '🍛', name: 'Kappa with Meen Curry', description: 'Mashed tapioca eaten with red fish curry — Kuttanad classic.', where: 'Toddy shops (kallu shaapu)' },
    { emoji: '🥥', name: 'Appam + Chicken Stew', description: 'Lacy hoppers with mild coconut-milk stew — Syrian-Christian breakfast.', where: 'Cassia · The Yellow Submarine' },
    { emoji: '🥣', name: 'Avial',              description: 'Mixed-vegetable coconut-yogurt curry — vegetarian Kerala icon.', where: 'Local Kerala saadhya thali joints' },
    { emoji: '🍌', name: 'Banana Halwa',       description: 'Sticky jaggery-banana halwa with cashews and ghee.', where: 'Town sweet shops near boat jetty' },
    { emoji: '🌶️', name: 'Toddy + Fish Fry',   description: 'Fresh palm-toddy paired with karimeen fry at riverside shops.', where: 'Kallu shaap (toddy shops) along backwaters' },
    { emoji: '🥥', name: 'Puttu + Kadala',     description: 'Steamed coconut-rice with chickpea curry — Kerala breakfast staple.', where: 'Local home-stay kitchens' },
  ],

  kashmir: [
    { emoji: '🍛', name: 'Rogan Josh',         description: 'Slow-cooked aromatic lamb in red Kashmiri-chilli gravy.', where: 'Ahdoos · Mughal Darbar (Srinagar)' },
    { emoji: '🍲', name: 'Yakhni',             description: 'Yogurt-based mild lamb curry, fragrant with fennel & dry mint.', where: 'Wazwan houses · Café Liyaqat' },
    { emoji: '🍢', name: 'Goshtaba',           description: 'Pounded-mutton meatballs in white yogurt gravy — the king of Wazwan.', where: 'Trami feasts at weddings · Ahdoos' },
    { emoji: '☕', name: 'Kahwa',              description: 'Saffron-cardamom green tea with crushed almonds — winter ritual.', where: 'Nathu\'s · houseboat kitchens' },
    { emoji: '🍞', name: 'Sheermal + Bakarkhani', description: 'Saffron-tinted sweet flatbread & flaky layered bread for breakfast.', where: 'Old-city bakeries (Khanyar, Nowhatta)' },
    { emoji: '🍚', name: 'Modur Pulao',        description: 'Sweet saffron pulao with dry fruits — wedding favourite.', where: 'Wazwan thali at Mughal Darbar' },
    { emoji: '🍢', name: 'Tujji (skewers)',    description: 'Charcoal-grilled lamb skewers — Eidgah/Khayam street snack.', where: 'Khayam Chowk evening grills' },
  ],

  spiti: [
    { emoji: '🥟', name: 'Momo',               description: 'Steamed dumplings with mutton, yak or vegetable filling.', where: 'Kaza market · Café Sol' },
    { emoji: '🍜', name: 'Thukpa',             description: 'Hearty Tibetan noodle soup — fuel for high-altitude days.', where: 'Sol Café · Himalayan Café' },
    { emoji: '🥖', name: 'Tingmo',             description: 'Steamed Tibetan bread, soft and pillowy — pairs with stews.', where: 'Local home-stays in Langza/Komic' },
    { emoji: '☕', name: 'Po Cha (butter tea)', description: 'Salty yak-butter tea — keeps you warm at 4,000m.', where: 'Monastery kitchens · home-stays' },
    { emoji: '🧀', name: 'Yak Cheese (Chhurpi)', description: 'Hard, smoked yak cheese — chew it slowly for hours.', where: 'Kaza Sunday Market' },
    { emoji: '🍶', name: 'Chhang',             description: 'Fermented barley/millet beer — village celebrations only.', where: 'Local home-stay invitations' },
    { emoji: '🍊', name: 'Sea Buckthorn Juice', description: 'Tart, vitamin-C-loaded local berry juice — high-altitude superfood.', where: 'Kaza market · Spiti Ecosphere shop' },
  ],

  /* ── Major food capitals ─────────────────────────────────────── */

  delhi: [
    { emoji: '🥟', name: 'Chhole Bhature',     description: 'Fluffy bhatura with tangy chickpea curry — Delhi\'s breakfast crown.', where: 'Sita Ram Diwan Chand (Paharganj) · Kake di Hatti' },
    { emoji: '🌯', name: 'Paranthe Wali Galli', description: 'Stuffed parathas (rabri, paneer, mooli, cashew) deep-fried in pure ghee.', where: 'Gali Paranthe Wali, Chandni Chowk' },
    { emoji: '🍢', name: 'Daulat ki Chaat',    description: 'Saffron-laced milk-froth dessert, only sold in winter mornings.', where: 'Chandni Chowk lanes · Kinari Bazaar' },
    { emoji: '🥗', name: 'Aloo Tikki Chaat',   description: 'Crisp potato patty topped with chutneys, dahi and pomegranate.', where: 'Bishan Swaroop (Chandni Chowk) · UPSC Café' },
    { emoji: '🍖', name: 'Butter Chicken',     description: 'Tomato-cream gravy chicken — invented in 1948 by Moti Mahal.', where: 'Moti Mahal (Daryaganj) · Kake da Hotel' },
    { emoji: '🍗', name: 'Galouti Kebab',      description: 'Melt-in-mouth Awadhi mince kebabs — a Mughal capital classic.', where: 'Karim\'s (Jama Masjid) · Al Jawahar', tier: 'fine' },
    { emoji: '🍮', name: 'Kulfi Falooda',      description: 'Hand-churned malai kulfi with rose syrup, vermicelli and basil seeds.', where: 'Roshan Di Kulfi (Karol Bagh) · Kuremal Mohan Lal' },
    { emoji: '🍴', name: 'Modern Indian tasting menu', description: 'Refined regional Indian flavours by award-winning chefs.', where: 'Indian Accent (Lodhi) · Bukhara (ITC Maurya)', tier: 'fine', affiliatePartner: 'EazyDiner', affiliateUrl: 'https://www.eazydiner.com/delhi/restaurants/indian-accent' },
  ],

  mumbai: [
    { emoji: '🥪', name: 'Vada Pav',           description: 'Spicy potato fritter inside a soft pav with chutneys — Mumbai\'s street icon.', where: 'Ashok Vada Pav (Dadar) · Anand Stall (Mithibai)' },
    { emoji: '🥘', name: 'Pav Bhaji',          description: 'Buttery mashed-veg curry with toasted pavs.', where: 'Sardar Pav Bhaji (Tardeo) · Cannon Pav Bhaji (CST)' },
    { emoji: '🌯', name: 'Bhel Puri / Sev Puri', description: 'Tangy chaat made on demand at the beach.', where: 'Chowpatty Beach · Juhu Beach stalls' },
    { emoji: '🍢', name: 'Misal Pav',          description: 'Fiery sprouted-bean curry topped with farsan, served with pav.', where: 'Aaswad (Dadar) · Mamledar Misal (Thane)' },
    { emoji: '🍳', name: 'Bombay Sandwich',    description: 'Multi-layer veg sandwich with green chutney, butter and chaat masala.', where: 'Sandwich stalls outside Churchgate · Tibbs Frankie' },
    { emoji: '🍛', name: 'Bombay Duck Fry',    description: 'Iconic Koli (fisherman) bombil fish dipped in rava and pan-fried.', where: 'Trishna · Gajalee · Highway Gomantak' },
    { emoji: '🍰', name: 'Bun Maska + Irani Chai', description: 'Soft buttered bun with sweet milky tea — Parsi café staple.', where: 'Kyani & Co. · Britannia & Co. · Yazdani Bakery' },
    { emoji: '🍴', name: 'Parsi Tasting Menu', description: 'Berry pulao, dhansak, sali boti — refined Parsi cuisine.', where: 'SodaBottleOpenerWala · Britannia (Berry Pulao)', tier: 'fine', affiliatePartner: 'Zomato', affiliateUrl: 'https://www.zomato.com/mumbai/sodabottleopenerwala-1-bandra-kurla-complex' },
  ],

  bengaluru: [
    { emoji: '🌯', name: 'Masala Dosa',        description: 'Crisp dosa with potato masala & chutneys — Karnataka\'s pride.', where: 'CTR (Malleshwaram) · Vidyarthi Bhavan (Basavanagudi)' },
    { emoji: '🍚', name: 'Bisi Bele Bath',     description: 'Tangy rice-lentil-veg one-pot dish, served with khara boondi.', where: 'MTR (Lalbagh Road) · Brahmins Coffee Bar' },
    { emoji: '🥣', name: 'Rava Idli + Filter Coffee', description: 'Soft semolina idli with strong filter kaapi — invented at MTR.', where: 'MTR (since 1924) · Brahmins (Shankarpuram)' },
    { emoji: '🍢', name: 'Maddur Vada',        description: 'Crispy onion-rice-flour vada from Maddur — train-route classic.', where: 'Maddur Tiffanys (highway) · Vidyarthi Bhavan' },
    { emoji: '🍗', name: 'Donne Biryani',      description: 'Fragrant short-grain biryani served on a palm-leaf bowl (donne).', where: 'Empire Restaurant · Shivaji Military Hotel' },
    { emoji: '🍻', name: 'Microbrewery Pub Food', description: 'Craft beer with global small-plates — Bengaluru\'s pub culture.', where: 'Toit (Indiranagar) · Arbor Brewing · Byg Brewski', tier: 'fine' },
    { emoji: '🍝', name: 'Modern Indian tasting menu', description: 'New-Indian fine dining riffing on Karnataka roots.', where: 'Karavalli (Taj) · Farzi Café · Edible Archives', tier: 'fine' },
    { emoji: '🍰', name: 'Davangere Benne Dosa', description: 'Butter-soaked dosa from Davangere region.', where: 'Davanagere Benne Dose stalls (Jayanagar)' },
  ],

  kolkata: [
    { emoji: '🌯', name: 'Kathi Roll',         description: 'Egg-coated paratha rolled with kebabs/paneer — invented at Nizam\'s.', where: 'Nizam\'s (New Market) · Kusum Rolls (Park St)' },
    { emoji: '🥟', name: 'Puchka',             description: 'Bengali pani puri — tangy, spicy, addictive.', where: 'Vivekananda Park stalls · Russell Street' },
    { emoji: '🍢', name: 'Telebhaja',          description: 'Crisp evening fritters (begun, aloor, vegetable chops) — perfect for monsoon.', where: 'Kalika (College Street) · Mitra Café' },
    { emoji: '🐟', name: 'Macher Jhol / Kosha Mangsho', description: 'Bengali fish curry / slow-cooked dark mutton — soul food.', where: '6 Ballygunge Place · Bhojohori Manna' },
    { emoji: '🍮', name: 'Mishti Doi + Rosogolla', description: 'Caramelised sweet yogurt and spongy syrup-soaked sweets.', where: 'KC Das · Balaram Mullick · Nakur Nandy' },
    { emoji: '☕', name: 'Coffee at Indian Coffee House', description: 'Old-world adda over coffee at Kolkata\'s heritage café (since 1942).', where: 'Indian Coffee House, College Street' },
    { emoji: '🍴', name: 'Bengali Thali',      description: 'Multi-course Bengali platter — luchi, shukto, bhaja, fish, mishti.', where: 'Oh! Calcutta · 6 Ballygunge Place', tier: 'fine' },
    { emoji: '🍞', name: 'Kati Tandoori + Mughlai Paratha', description: 'Egg-stuffed flaky paratha — Mughal-Bengali fusion.', where: 'Anadi Cabin (Esplanade)' },
  ],

  chennai: [
    { emoji: '🌯', name: 'Madras Idli + Sambar', description: 'Pillowy idlis with classic Tamil sambar and 3 chutneys.', where: 'Murugan Idli Shop · Saravana Bhavan' },
    { emoji: '🍞', name: 'Madras Filter Coffee', description: 'Strong, frothy decoction in steel davara — the city\'s morning ritual.', where: 'Sri Krishna Sweets · Saravana Bhavan · Murugan' },
    { emoji: '🍳', name: 'Pongal',             description: 'Creamy rice-and-mung-dal porridge with black-pepper-cashew tempering.', where: 'Murugan Idli Shop · Karpagambal Mess (Mylapore)' },
    { emoji: '🐟', name: 'Chettinad Fish Fry', description: 'Aromatic peppery fish fry — Chettiar speciality.', where: 'Anjappar Chettinad · Karaikudi Restaurant' },
    { emoji: '🍗', name: 'Chicken 65',         description: 'Spicy deep-fried chicken bites — invented in 1965 at Buhari Hotel.', where: 'Buhari (Mount Road) · Star Biryani' },
    { emoji: '🍝', name: 'Veechu Parotta + Salna', description: 'Hand-tossed Tamil parotta with spicy mutton/veg salna.', where: 'Thalapakatti · Konar Kadai · Hot Breads' },
    { emoji: '🍴', name: 'Banana-leaf Saadhya', description: 'Multi-course Tamil/Kerala vegetarian feast served on banana leaf.', where: 'Rayar\'s Mess · Kalyana Bhavan', tier: 'fine' },
    { emoji: '🍡', name: 'Jigarthanda',        description: 'Cooling milk-almond-pinwheel-ice-cream drink from Madurai.', where: 'Famous Jigarthanda outlets · Madurai food lanes' },
  ],

  hyderabad: [
    { emoji: '🍚', name: 'Hyderabadi Biryani', description: 'Dum-cooked basmati with marinated mutton/chicken — the gold standard.', where: 'Paradise (Secunderabad) · Bawarchi · Shadab' },
    { emoji: '🍲', name: 'Haleem (Ramzan only)', description: 'Slow-cooked wheat, lentil & meat porridge — Hyderabad\'s Ramzan icon.', where: 'Pista House · Sarvi · Madina (during Ramzan)' },
    { emoji: '☕', name: 'Irani Chai + Osmania Biscuit', description: 'Sweet milky chai with the city\'s buttery, slightly-salty biscuit.', where: 'Nimrah Café · Niloufer Café · Subhan Bakery' },
    { emoji: '🍢', name: 'Mirchi Bajji',       description: 'Stuffed green-chilli fritter — perfect with chai on a rainy evening.', where: 'Ram Ki Bandi (Kacheguda) · Ramappa\'s' },
    { emoji: '🥧', name: 'Lukhmi',             description: 'Crisp Hyderabadi mince-stuffed savoury pastry — wedding starter.', where: 'Sarvi · Pista House' },
    { emoji: '🍮', name: 'Qubani ka Meetha',   description: 'Stewed apricot dessert with malai or vanilla ice-cream.', where: 'Shadab · Café Bahar' },
    { emoji: '🍰', name: 'Double-ka-Meetha',   description: 'Hyderabadi bread pudding soaked in saffron-milk.', where: 'Hotel Shadab · Café Bahar' },
    { emoji: '🍴', name: 'Nizami fine dining',  description: 'Royal Nizami cuisine — kacchi biryani, baghara baingan, sheermal.', where: 'Adaa (Taj Falaknuma) · Dum Pukht (ITC)', tier: 'fine' },
  ],

  lucknow: [
    { emoji: '🍖', name: 'Tunday Kebab',       description: 'Famously soft galouti kebabs with 100+ spices — since 1905.', where: 'Tunday Kababi (Aminabad / Chowk)' },
    { emoji: '🍢', name: 'Galouti Kebab',      description: 'Melt-in-mouth mince kebabs invented for the toothless Nawab.', where: 'Tunday Kababi · Dastarkhwan' },
    { emoji: '🍚', name: 'Lucknowi Biryani',   description: 'Fragrant, milder dum biryani with whole spices and saffron.', where: 'Idris Biryani · Dastarkhwan · Wahid Biryani' },
    { emoji: '🍞', name: 'Sheermal + Nihari',  description: 'Saffron flatbread with slow-cooked spiced meat stew — heritage breakfast.', where: 'Raheem\'s Nihari (Akbari Gate)' },
    { emoji: '🥬', name: 'Basket Chaat',       description: 'A crispy edible basket overflowing with chaat goodies — Lucknow original.', where: 'Royal Café (Hazratganj) · Shukla Chaat House' },
    { emoji: '🍮', name: 'Makkhan Malai',      description: 'Featherlight saffron-cardamom milk foam — winter mornings only.', where: 'Old Lucknow chowk lanes' },
    { emoji: '🍴', name: 'Awadhi tasting menu', description: 'Royal Awadhi cuisine — dum-pukht, galouti, sheermal, kulfi.', where: 'Oudhyana (Taj) · Dastarkhwan', tier: 'fine' },
    { emoji: '🍵', name: 'Thandai',            description: 'Cooling milk-almond-fennel drink — Holi & summer favourite.', where: 'Aminabad street vendors' },
  ],

  pune: [
    { emoji: '🥟', name: 'Misal Pav',          description: 'Spicy sprouted-moth curry with farsan and pav — Pune\'s fiery breakfast.', where: 'Bedekar Misal · Shree Upahar Gruha · Katakir-kar' },
    { emoji: '🥪', name: 'Vada Pav',           description: 'Spiced potato fritter inside a soft bun — Maharashtra\'s favourite snack.', where: 'JJ Garden Vada Pav · Garden Vada Pav (Camp)' },
    { emoji: '🌮', name: 'Sabudana Vada',      description: 'Crispy tapioca-pearl fritters with peanut and green-chilli — fasting food.', where: 'Joshi Wadewale · Shree Upahar' },
    { emoji: '🥧', name: 'Kothimbir Vadi',     description: 'Steamed coriander fritters, then pan-fried till crisp.', where: 'Shree Datta Snacks · Vaishali (FC Road)' },
    { emoji: '🍞', name: 'Bun Maska + Chai',   description: 'Buttered bun with milky tea — Pune\'s Irani-café morning.', where: 'Kayani Bakery · Vohuman Café · Café Goodluck' },
    { emoji: '🍰', name: 'Mastani',            description: 'Thick milkshake-meets-ice-cream — Pune\'s signature dessert.', where: 'Sujata Mastani · Gujjar Mastani' },
    { emoji: '🥖', name: 'Shrewsbury Biscuits', description: 'Crumbly buttery biscuits — Kayani Bakery\'s 70-year-old specialty.', where: 'Kayani Bakery (East Street)' },
    { emoji: '🍴', name: 'Maharashtrian thali',  description: 'Multi-course Marathi feast — bharli wangi, modak, puran poli.', where: 'Sujata Mastani · Janseva Bhuvan · Shabree', tier: 'fine' },
  ],

  ahmedabad: [
    { emoji: '🍰', name: 'Dhokla',             description: 'Steamed, fluffy gram-flour cake with mustard tempering.', where: 'Das\'s Khaman · Gopi Dining Hall' },
    { emoji: '🌾', name: 'Fafda + Jalebi',     description: 'Crisp gram-flour strips with hot syrupy jalebis — Sunday breakfast.', where: 'Chandravilas · Dhirubhai Fafda Jalebi' },
    { emoji: '🍢', name: 'Khaman',             description: 'Soft, spongy yellow dhokla cousin — sweeter and fluffier.', where: 'Das\'s Khaman House (Khamasa)' },
    { emoji: '🍛', name: 'Gujarati Thali',     description: 'Sweet-tangy unlimited thali — undhiyu, kadhi, dal, rotli.', where: 'Agashiye (House of MG) · Gordhan Thal · Vishalla', tier: 'fine' },
    { emoji: '🥙', name: 'Khakhra + Theplas',  description: 'Crisp roasted flatbreads in flavours — methi, jeera, masala.', where: 'Ratnaprabha · Manek Chowk evening market' },
    { emoji: '🍦', name: 'Kulfi Falooda',      description: 'Cardamom-saffron kulfi with falooda noodles and rose.', where: 'Asharfi Kulfi · Manek Chowk Night Market' },
    { emoji: '🌮', name: 'Manek Chowk Sandwich', description: 'Late-night veg sandwich + cheese-loaded chaat at the iconic night market.', where: 'Manek Chowk (only 8 PM – 1 AM)' },
    { emoji: '🥥', name: 'Undhiyu',            description: 'Slow-cooked mixed-vegetable winter speciality with muthias.', where: 'Vishalla · Tomato\'s · Agashiye (winter only)' },
  ],

  indore: [
    { emoji: '🥣', name: 'Poha-Jalebi',        description: 'Spiced beaten-rice with hot jalebi — Indore\'s breakfast religion.', where: 'Joshi Dahi Bada House · 56 Dukan poha stalls' },
    { emoji: '🌃', name: 'Sarafa Night Bazaar', description: 'Open-air street-food bazaar that springs up nightly (10 PM – 2 AM).', where: 'Sarafa Bazaar (jewellers\' market by day)' },
    { emoji: '🥟', name: 'Bhutte Ka Kees',     description: 'Grated-corn cooked with milk, mustard seeds and spices — Indori original.', where: 'Sarafa stalls · 56 Dukan' },
    { emoji: '🥗', name: 'Dahi Vada',          description: 'Lentil dumplings in sweet-spiced yogurt with tamarind chutney.', where: 'Joshi Dahi Bada House (since 1962)' },
    { emoji: '🍢', name: 'Garadu',             description: 'Deep-fried yam tossed with red-chilli, lime and chaat masala — winter classic.', where: 'Sarafa night market · 56 Dukan' },
    { emoji: '🥯', name: 'Khopra Patties',     description: 'Coconut-stuffed potato patty topped with chutneys.', where: 'Vijay Chaat House (56 Dukan)' },
    { emoji: '🍰', name: 'Mawa Bati',          description: 'Sugar-syrup-soaked stuffed dumplings with mawa filling — Malwa sweet.', where: 'Vijay Chaat House · Sarafa shops' },
    { emoji: '🍦', name: 'Shikanji (Indori-style)', description: 'Thick saffron-malai cardamom drink, almost a milkshake — unique to Indore.', where: 'Madhuram (56 Dukan)' },
  ],

  /* ── Tier-2 / regional gems ──────────────────────────────────── */

  kochi: [
    { emoji: '🐟', name: 'Fish Moilee',        description: 'Mild coconut-milk fish curry — Kerala-Christian heritage classic.', where: 'Salt N Pepper · Fort House · Kashi Art Café' },
    { emoji: '🥩', name: 'Beef Ularthiyathu',  description: 'Slow-roasted beef with coconut slivers and curry leaves — Kerala soul food.', where: 'Rahmathullah Hotel (Mattancherry) · Kayees Biryani' },
    { emoji: '🦐', name: 'Karimeen + Prawn Roast', description: 'Backwater pearl-spot or prawns roasted in spicy red masala.', where: 'Fort Cochin shacks · Cassia · Brunton Boatyard', tier: 'fine' },
    { emoji: '🥥', name: 'Puttu + Kadala Curry', description: 'Steamed coconut-rice cylinders with black chickpea curry.', where: 'Pai Brothers · Kalavara · roadside tea-shops' },
    { emoji: '🍚', name: 'Kerala Sadhya',      description: 'Banana-leaf vegetarian feast with 20+ items — Onam-style.', where: 'Dwaraka Hotel · Sree Krishna Inn', tier: 'fine' },
    { emoji: '🍞', name: 'Appam + Egg Roast',  description: 'Lacy rice pancakes with peppery egg curry — perfect Kerala breakfast.', where: 'Kayees · Pai Brothers' },
    { emoji: '☕', name: 'Kayees Biryani',     description: 'Mattancherry-style mutton biryani — wrapped in banana leaf, slow-dum.', where: 'Kayees Biryani (Kayikka\'s, Mattancherry)' },
    { emoji: '🍰', name: 'Banana Halwa',       description: 'Sticky jaggery-banana halwa with cashews — old Kochi sweet.', where: 'Kalathiparambil sweet shops' },
  ],

  bhopal: [
    { emoji: '🍚', name: 'Bhopali Biryani',    description: 'Subtle Nawabi-style biryani with whole spices — milder than Hyderabadi.', where: 'Filfora · Jameel Hotel (Ibrahimpura)' },
    { emoji: '🥣', name: 'Poha (Bhopali)',     description: 'Beaten-rice with sev, peanuts and tangy chutney — Madhya Pradesh staple.', where: 'New Inder Coffee House · Hira Sweets' },
    { emoji: '🍖', name: 'Bhopali Gosht Korma', description: 'Slow-cooked Mughlai mutton in saffron-yogurt gravy.', where: 'Jameel Hotel · Manohar Dairy & Restaurant', tier: 'fine' },
    { emoji: '🍵', name: 'Sulemani Chai',      description: 'Black tea steeped with cardamom and lemon — old-Bhopal Iranian-influenced.', where: 'Chatori Galli (Old City)' },
    { emoji: '🥧', name: 'Bafla',              description: 'Wheat dumplings boiled then deep-fried in ghee, dipped in dal.', where: 'Manohar Dairy · home-style restaurants' },
    { emoji: '🍢', name: 'Mawa Bati',          description: 'Khoya-stuffed wheat-flour dumplings dunked in syrup.', where: 'Hira Sweets · Bittoo Sweets' },
    { emoji: '🥘', name: 'Chatori Galli food walk', description: 'Old-city street with paya, kebabs, biryani, jalebi all in one lane.', where: 'Chatori Galli, Ibrahimpura' },
    { emoji: '🍢', name: 'Seekh Kebab + Tikka', description: 'Charcoal-grilled marinated mince and chicken at old-city carts.', where: 'Filfora · Bhopal Kebabs' },
  ],

  surat: [
    { emoji: '🍯', name: 'Surti Ghari',        description: 'Round ghee-soaked sweet stuffed with khoya and pistachios — invented in Surat.', where: 'Chandravilas (Chowk Bazaar) · Surati Ghari Suresh' },
    { emoji: '🥣', name: 'Locho',              description: 'Steamed gram-flour dish with crunchy sev, butter and lime — uniquely Surti.', where: 'Hari Lal Locho · Jaani Locho House' },
    { emoji: '🍰', name: 'Khaman + Sev',       description: 'Soft fluffy yellow steamed cake topped with crispy sev.', where: 'Jani Farsan Mart · Tushar Khaman' },
    { emoji: '🥥', name: 'Undhiyu',            description: 'Slow-cooked mixed-vegetable winter speciality with muthias.', where: 'Sanjivani (Adajan) · home-style joints (winter only)' },
    { emoji: '🌭', name: 'Surti Khichu',       description: 'Steamed rice-flour dough with chilli oil and red-chilli powder.', where: 'Khichu carts in Adajan · Athwa Lines' },
    { emoji: '🥖', name: 'Bhakharwadi',        description: 'Spicy spiral-rolled snack of gram and red chillies — Surti tea-time.', where: 'Jani Farsan · Surati Sundae' },
    { emoji: '🍔', name: 'Surti Bhusu',        description: 'Spicy puffed-rice mix with sev, peanuts and fresh garlic.', where: 'Local farsan shops across Surat' },
    { emoji: '🌃', name: 'Khaupiya Surat night market', description: 'Late-night Surti street food bazaar with limpiya, ghari and live tava.', where: 'Bhagal · Chowk Bazaar (after 9 PM)' },
  ],

  nagpur: [
    { emoji: '🍛', name: 'Saoji Mutton Curry', description: 'Fiery jet-black mutton curry of the Saoji community — small lanes only.', where: 'Saoji Bhojnalaya (Itwari) · Rambhau Saoji' },
    { emoji: '🥣', name: 'Tarri Poha',         description: 'Beaten-rice topped with spicy chickpea-tarri gravy — Nagpur staple.', where: 'Ram Poha (Sitabuldi) · Sai Krupa' },
    { emoji: '🥧', name: 'Patodi',             description: 'Steamed gram-flour rolls in tangy yogurt-tarri — Vidarbha original.', where: 'Saoji eateries · Haldiram\'s Nagpur' },
    { emoji: '🍢', name: 'Bhaji Tarri',        description: 'Kanda bhaji served in spicy chickpea tarri — winter rains favourite.', where: 'Sitabuldi street stalls' },
    { emoji: '🌶️', name: 'Saoji Chicken',      description: 'Smoky red chicken curry — fiery oil-floating signature of Nagpuri Saoji food.', where: 'Saoji Bhojnalaya · Vidarbha Saoji' },
    { emoji: '🍞', name: 'Pitla Bhakri',       description: 'Spicy gram-flour curry with millet flatbread — rural Vidarbha staple.', where: 'Khichdi Tat House · home-style dhabas' },
    { emoji: '🍮', name: 'Anarsa',             description: 'Sweet rice-jaggery cookie covered in poppy seeds — Diwali special.', where: 'Haldiram\'s · Bobby Sweets' },
    { emoji: '🍴', name: 'Vidarbha thali',      description: 'Multi-course Saoji feast — savji rassa, patodi, varan-bhaat.', where: 'Saoji Vyankatesh · Saoji Bhojnalaya', tier: 'fine' },
  ],

  patna: [
    { emoji: '🥖', name: 'Litti Chokha',       description: 'Sattu-stuffed wheat balls with mashed brinjal-tomato chokha — Bihar\'s soul food.', where: 'Bihari Litti Chokha (Boring Road) · Maa Sharda' },
    { emoji: '🥣', name: 'Sattu Sharbat',      description: 'Roasted-gram drink with mint, lemon and salt — summer essential.', where: 'Patna roadside stalls · Gandhi Maidan' },
    { emoji: '🍮', name: 'Khaja',              description: 'Crisp layered sweet pastry from Silao — soaked in syrup.', where: 'Khaja shops near Mahabodhi · Silao' },
    { emoji: '🥬', name: 'Pitthor',            description: 'Spiced gram-flour cakes simmered in mustard-tomato gravy.', where: 'Bihari home kitchens · select Patna restaurants' },
    { emoji: '🍞', name: 'Tilkut',             description: 'Dry sesame-jaggery sweet from Gaya — Sankranti and winter speciality.', where: 'Gaya tilkut shops · Patna sweet stalls' },
    { emoji: '🍯', name: 'Lai',                description: 'Roasted-rice ball coated in jaggery syrup — festival sweet.', where: 'Sweet shops in Maner · Dak Bungalow' },
    { emoji: '🍢', name: 'Champaran Mutton (Ahuna)', description: 'Mutton slow-cooked in clay pot, sealed with dough — Bihari iconic dish.', where: 'Hotel Maurya Lok · Champaran Meat House', tier: 'fine' },
    { emoji: '🥯', name: 'Dal-Pitthi',         description: 'Boiled wheat dumplings in spicy lentil — Bihari winter comfort.', where: 'Boring Road · Patna home-style joints' },
  ],

  guwahati: [
    { emoji: '🐟', name: 'Masor Tenga',        description: 'Tangy Assamese fish curry with lemon and tomato — light and summery.', where: 'Paradise (Silpukhuri) · Khorikaa' },
    { emoji: '🍚', name: 'Pitha',              description: 'Sweet rice-flour cakes (til, narikol, ghila) — Bihu festival staple.', where: 'Local Assamese kitchens · Khorikaa' },
    { emoji: '🥘', name: 'Khar',               description: 'Alkaline curry made with raw papaya, banana stem and mustard — uniquely Assamese.', where: 'Heritage Khorikaa · Paradise' },
    { emoji: '🦆', name: 'Duck with Pumpkin',  description: 'Slow-cooked duck with white-pumpkin and traditional spices.', where: 'Khorikaa · Latasil Pukhu food fest' },
    { emoji: '🌶️', name: 'Bhoot Jolokia Pork', description: 'Pork chunks with the world\'s hottest chilli — Naga-Assamese fusion.', where: 'NaakhBhog · Trishna' },
    { emoji: '🍡', name: 'Aloo Pitika',        description: 'Mashed potato with mustard oil, raw onion and coriander.', where: 'Assamese thali joints · Paradise' },
    { emoji: '🍴', name: 'Assamese Thali',     description: 'Banana-leaf feast — bhaat, dal, masor jhol, pitika, fish, pithas.', where: 'Khorikaa · Heritage Khorikaa', tier: 'fine' },
    { emoji: '🍵', name: 'Lal Sah (red tea)',  description: 'Strong, lightly-spiced Assamese black tea without milk.', where: 'Tocklai tea estates · local tea-shops' },
  ],

  kanyakumari: [
    { emoji: '🦞', name: 'Coastal Crab Curry', description: 'Fresh-caught crab simmered in coconut-and-pepper-heavy gravy.', where: 'Annapoorna · Hotel Saravana' },
    { emoji: '🐟', name: 'Fish Tawa Fry',      description: 'Whole pomfret/seer rubbed with red chilli and lime, pan-seared.', where: 'Beach shacks · Sangam Hotel' },
    { emoji: '🌯', name: 'Kothu Parotta',      description: 'Shredded parotta tossed with egg, mutton or veg — Tamil street icon.', where: 'Beach Road dhabas after sunset' },
    { emoji: '🍚', name: 'Banana-leaf Meals',  description: 'South Indian unlimited thali — sambar, rasam, kuzhambu, payasam.', where: 'Hotel Saravana · Annapoorna' },
    { emoji: '🍤', name: 'Nethili Fry',        description: 'Crispy anchovy fish fry with curry leaves and red chilli.', where: 'Beach Road open-air joints' },
    { emoji: '☕', name: 'Filter Coffee',      description: 'Strong davara-tumbler coffee — start your sunrise here.', where: 'Hotel Sankar · roadside thattus' },
    { emoji: '🥥', name: 'Coconut Water',      description: 'Tender coconut from local groves — chilled by sea breeze.', where: 'Beach front near Vivekananda Memorial' },
    { emoji: '🍰', name: 'Pazham Pori',        description: 'Crispy ripe-banana fritters — perfect 4 PM snack.', where: 'Tea-stalls along Cape Road' },
  ],

  puri: [
    { emoji: '🛕', name: 'Mahaprasad (56 bhog)', description: 'Sacred temple food — 56-dish offering cooked in earthen pots over wood fire.', where: 'Ananda Bazaar inside Jagannath Temple complex' },
    { emoji: '🍚', name: 'Pakhala Bhata',      description: 'Fermented-rice in water with curd and tempering — Odia summer special.', where: 'Local Odia eateries · Roopali Hotel' },
    { emoji: '🍮', name: 'Chhena Poda',        description: '"Burnt cottage cheese" — caramelised baked cheesecake of Odisha.', where: 'Bikalananda Kar (Salepur) · Puri sweet shops' },
    { emoji: '🥧', name: 'Dalma',              description: 'Lentil-vegetable stew tempered with panch-phoran spice mix.', where: 'Wildgrass · Mauli Restaurant' },
    { emoji: '🍢', name: 'Kanika',             description: 'Sweet saffron rice with cashews and raisins — temple offering.', where: 'Odia thali joints · Puri sweet houses' },
    { emoji: '🌊', name: 'Beach Chowmein + Crab', description: 'Tossed Indo-Chinese noodles + spicy crab — beach evening rituals.', where: 'Puri beach shacks (Marine Drive)' },
    { emoji: '🍞', name: 'Khaja',              description: 'Crisp layered sweet pastry — Puri\'s temple-side staple.', where: 'Khaja Bhandar lanes near Singhadwar' },
    { emoji: '🍴', name: 'Odia Saadhi',        description: 'Multi-course banana-leaf Odia feast at heritage homes.', where: 'Wildgrass · Heritage Hotel Puri', tier: 'fine' },
  ],

  gangtok: [
    { emoji: '🥟', name: 'Sikkimese Momo',     description: 'Pork or veg dumplings with fiery dalle-chilli (Sikkim chilli) chutney.', where: 'Taste of Tibet (MG Marg) · Roll House' },
    { emoji: '🍜', name: 'Thukpa',             description: 'Hearty Tibetan-Sikkimese noodle soup — vegetable, chicken or pork.', where: 'Taste of Tibet · The Coffee Shop' },
    { emoji: '🥬', name: 'Sinki Soup',         description: 'Fermented radish-tap-root soup — sour, warming, monsoon staple.', where: 'Local Sikkimese homes · Hungry Jack' },
    { emoji: '🥘', name: 'Phagshapa',          description: 'Strips of pork fat boiled with radish and dried chillies.', where: 'Roll House · Café Live & Loud' },
    { emoji: '🍶', name: 'Tongba (millet beer)', description: 'Hot fermented-millet drink sipped through bamboo straw — Sikkimese ritual.', where: 'Local Newari/Limbu kitchens' },
    { emoji: '🍞', name: 'Sael Roti',          description: 'Crisp Nepali-Sikkimese rice-flour ring doughnut.', where: 'MG Marg morning tea-shops' },
    { emoji: '🌾', name: 'Gundruk Curry',      description: 'Fermented mustard-leaf curry — earthy, deeply umami.', where: 'Sikkimese family restaurants · Hungry Jack' },
    { emoji: '🍴', name: 'Sikkimese Thali',    description: 'Multi-course feast — phagshapa, gundruk, dal-bhat, sael roti.', where: 'The Coffee Shop · Café Fiction', tier: 'fine' },
  ],

  jodhpur: [
    { emoji: '🌶️', name: 'Mirchi Vada',        description: 'Massive green chilli stuffed with potato masala, deep-fried in besan — Jodhpur original.', where: 'Janta Sweet Home · Shahi Samosa' },
    { emoji: '🥧', name: 'Mawa Kachori',       description: 'Sweet kachori stuffed with khoya, dipped in saffron syrup.', where: 'Janta Sweet Home (Nai Sarak) · Mishrilal' },
    { emoji: '🥛', name: 'Makhaniya Lassi',    description: 'Thick saffron-malai lassi crowned with butter — 100+ years old recipe.', where: 'Mishrilal Hotel (since 1927)' },
    { emoji: '🍢', name: 'Pyaaz Kachori',      description: 'Onion-stuffed kachori, hot with green-tamarind chutney.', where: 'Janta Sweet Home · Shahi Samosa' },
    { emoji: '🍛', name: 'Dal Bati Churma',    description: 'Wheat dumplings + dal + ghee-laced churma — Marwari-Mehrangarh classic.', where: 'On the Rocks · Indique (Pal Haveli)', tier: 'fine' },
    { emoji: '🌾', name: 'Ker Sangri',         description: 'Desert berries + beans tempered with mustard oil — quintessential Marwari.', where: 'Indique · Mehran Terrace · Heritage thali joints' },
    { emoji: '🍯', name: 'Ghevar',             description: 'Honeycomb-textured disc-shaped sweet, esp. during Teej.', where: 'Janta Sweet · Mahaveer Sweets' },
    { emoji: '🍴', name: 'Jodhpuri Royal Thali', description: 'Multi-course Rathore-Marwari feast at heritage rooftops.', where: 'On the Rocks · Hanwant Mahal Resto', tier: 'fine' },
  ],

  mangalore: [
    { emoji: '🥞', name: 'Neer Dosa',          description: 'Lacy, water-thin rice pancakes paired with chicken sukka or chutney.', where: 'Hotel Narayana · Giri Manja\'s' },
    { emoji: '🍗', name: 'Kori Rotti',         description: 'Wafer-thin rice roti drenched in spicy red chicken curry — Bunt classic.', where: 'Hotel Janatha Deluxe · Machali (Bejai)' },
    { emoji: '🐟', name: 'Anjal (King Fish) Fry', description: 'Coastal kingfish coated in rava, pan-seared in coconut oil.', where: 'Giri Manja\'s · Machali · Pabbas' },
    { emoji: '🦐', name: 'Prawn Sukka',        description: 'Dry-roasted prawn masala with toasted coconut.', where: 'Hotel Janatha Deluxe · Narayana' },
    { emoji: '🌯', name: 'Ghee Roast (Chicken)', description: 'Mangalore signature dry-spicy chicken roasted in ghee — born in Kundapur.', where: 'Shetty Lunch Home · Pabbas' },
    { emoji: '🍦', name: 'Gadbad Ice Cream',   description: 'Iconic layered ice-cream-jelly-fruit-nuts mix — invented at Pabbas in 1980s.', where: 'Ideal Ice Cream · Pabbas' },
    { emoji: '🍰', name: 'Mangalore Buns',     description: 'Sweet banana-flavoured deep-fried buns — coastal Karnataka tea-time.', where: 'Hotel Woodlands · Café Coffee Day mangalorean joints' },
    { emoji: '🍴', name: 'Mangalorean Seafood Platter', description: 'Multi-course seafood platter — pomfret, anjal, prawns, crab.', where: 'Machali · Onyx Air Lounge', tier: 'fine' },
  ],

  vadodara: [
    { emoji: '🥣', name: 'Sev Usal',           description: 'Spicy moth-bean curry topped with crunchy sev — Baroda breakfast.', where: 'Mahakali Sev Usal (since 1956) · Jagdish Farsan' },
    { emoji: '🌭', name: 'Lilo Chevdo',        description: 'Fresh green chivda made with crushed peas and coriander — winter only.', where: 'Jagdish Farsan · Pyramid Café' },
    { emoji: '🥖', name: 'Bhakharwadi',        description: 'Spicy spiral-rolled snack — Vadodara perfected its own version.', where: 'Jagdish Farsan · Tushar Farsan' },
    { emoji: '🍰', name: 'Khaman + Fafda',     description: 'Soft yellow steamed cake with crispy fafda — Gujarati Sunday.', where: 'Jagdish Farsan · Mahakali Sev Usal' },
    { emoji: '🥞', name: 'Khichu',             description: 'Steamed rice-flour dough drizzled with chilli oil and chaat masala.', where: 'Khichu carts in Sayajigunj · Karelibaug' },
    { emoji: '🍢', name: 'Sev Khamani',        description: 'Crumbled khaman tempered with sev and pomegranate — uniquely Surat-Baroda.', where: 'Sev Khamani Centre · Aarambh' },
    { emoji: '🍯', name: 'Mavo Penda',         description: 'Khoya-based saffron-cardamom mithai — Baroda speciality.', where: 'Bhagat Tarachand · Jagdish Sweets' },
    { emoji: '🍴', name: 'Gujarati Thali',     description: 'Sweet-tangy unlimited thali — undhiyu, kadhi, dal, rotli, basundi.', where: 'Mandap Restaurant · Sankalp', tier: 'fine' },
  ],

  madurai: [
    { emoji: '🍦', name: 'Jigarthanda',        description: '"Jigar thanda" — almond-pinwheel-milk drink with kulfi & basil seeds. Born in Madurai.', where: 'Famous Jigarthanda (East Veli St) · Murugan Idli Shop' },
    { emoji: '🐐', name: 'Mutton Sukka',       description: 'Black-pepper-roasted mutton with curry leaves — Madurai Chettinad classic.', where: 'Konar Kadai (Simakkal) · Amma Mess' },
    { emoji: '🌯', name: 'Kothu Parotta',      description: 'Shredded parotta tossed on tava with mince, eggs and salna.', where: 'Sri Sabarees · Konar Kadai' },
    { emoji: '🍚', name: 'Paruppu Urundai Kuzhambu', description: 'Steamed lentil dumplings in tangy tamarind curry — Madurai homestyle.', where: 'Murugan Idli Shop · home-style mess' },
    { emoji: '🌶️', name: 'Idli Bajji',         description: 'Sliced idlis dipped in spiced gram-flour batter and deep-fried.', where: 'Roadside tiffin stalls (Periyar Bus Stand)' },
    { emoji: '🥘', name: 'Chicken Chettinad',  description: 'Aromatic black-pepper, cinnamon and stone-flower spiced gravy.', where: 'Anjappar · Karaikudi Chettinad', tier: 'fine' },
    { emoji: '🍗', name: 'Madurai Idli + Sambar Vadai', description: 'Soft idlis with thick Madurai-style sambar drowning a vada.', where: 'Murugan Idli Shop (since 1965)' },
    { emoji: '🍰', name: 'Parotta + Salna',    description: 'Layered Tamil parotta with spicy salna gravy — late-night essential.', where: 'East Masi Street stalls · Konar Kadai' },
  ],

  shillong: [
    { emoji: '🍚', name: 'Jadoh',              description: 'Khasi rice-and-pork (or chicken) one-pot dish with turmeric and ginger.', where: 'Trattoria · Jadoh Stall (Police Bazaar)' },
    { emoji: '🥩', name: 'Doh-Khlieh',         description: 'Pork salad with onion, ginger and chilli — Khasi traditional.', where: 'Jadoh Stall · Café Shillong' },
    { emoji: '🌶️', name: 'Tungrymbai',        description: 'Fermented soybean stew with pork — funky, smoky, deeply local.', where: 'Authentic Khasi homes · Trattoria' },
    { emoji: '🥖', name: 'Pukhlein',           description: 'Crispy fried rice-flour-and-jaggery sweet bread — perfect with tea.', where: 'Bazaar carts in Iewduh · Police Bazaar' },
    { emoji: '🍡', name: 'Pumaloi',            description: 'Steamed rice-flour cake — pristine white, slightly sweet.', where: 'Local Khasi kitchens · Trattoria' },
    { emoji: '🍢', name: 'Ja Stem',            description: 'Khasi rice cooked with jaggery, eaten during festivals.', where: 'Cherrapunji homestays · Mawlynnong' },
    { emoji: '☕', name: 'Sha Saw (red tea)',  description: 'Khasi sweetened black tea — drink it endlessly in cool weather.', where: 'Indian Coffee House · roadside thias' },
    { emoji: '🍴', name: 'Khasi Tasting Menu', description: 'Curated Khasi feast at heritage cafés — jadoh, doh-jem, tungrymbai.', where: 'Trattoria · Café Shillong Heritage', tier: 'fine' },
  ],

  bikaner: [
    { emoji: '🌶️', name: 'Bikaneri Bhujia',    description: 'Crispy spicy gram-flour noodles — Bikaner\'s signature export since 1877.', where: 'Haldiram\'s Bhujiawala (since 1937) · Bhikharam Chandmal' },
    { emoji: '🥧', name: 'Bikaneri Kachori',   description: 'Hot, flaky kachori stuffed with onion or moong dal — fried in pure ghee.', where: 'Chottu Motu Joshi (since 1937)' },
    { emoji: '🍯', name: 'Rasgulla (Bikaneri)', description: 'Soft, fluffy chenna balls in syrup — Bikaner version is whiter and lighter.', where: 'Chajjuram Bansilal · Chottu Motu Joshi' },
    { emoji: '🍮', name: 'Ghevar',             description: 'Honeycomb-disc sweet topped with rabdi — Teej and Raksha Bandhan special.', where: 'Bhikharam Chandmal · Haldiram\'s' },
    { emoji: '🍞', name: 'Pyaaz Kachori',      description: 'Spicy onion-stuffed flaky kachori — Marwari Sunday breakfast.', where: 'Chajjuram Bansilal · roadside outlets' },
    { emoji: '🍢', name: 'Mirchi Bada',        description: 'Stuffed green chilli deep-fried in besan — perfect winter snack.', where: 'Lalji Hotel · home-style halwais' },
    { emoji: '🥘', name: 'Junglee Maas',       description: 'Royal Rajputi mutton with red Mathania chillies — minimal masala, max flavour.', where: 'Laxmi Niwas Palace · Junagarh Heritage', tier: 'fine' },
    { emoji: '🍴', name: 'Bikaneri Marwari Thali', description: 'Multi-course thali — gatte, ker sangri, dal-bati, churma, ghevar.', where: 'Vrindavan Garden · Heritage Resort', tier: 'fine' },
  ],

  trivandrum: [
    { emoji: '🍚', name: 'Kerala Sadya',       description: 'Banana-leaf vegetarian feast with 24+ items — Onam-style.', where: 'Villa Maya · Hotel Saaras Pavithram', tier: 'fine' },
    { emoji: '🥩', name: 'Beef Fry',           description: 'Slow-fried beef chunks with coconut slivers and pepper — Kerala-Christian classic.', where: 'Azad Restaurant · Aryaas' },
    { emoji: '🐟', name: 'Karimeen Pollichathu', description: 'Pearl-spot fish in banana leaf — Kuttanad-Trivandrum favourite.', where: 'Villa Maya · Cassia (Vivanta)' },
    { emoji: '🥥', name: 'Puttu + Kadala Curry', description: 'Steamed coconut-rice cylinders with spiced black chickpea curry.', where: 'Aryaas · Hotel Maveli (Indian Coffee House)' },
    { emoji: '🍞', name: 'Appam + Stew',       description: 'Lacy rice pancakes with mild coconut-milk meat stew.', where: 'Saaras Pavithram · Hotel Aryaas' },
    { emoji: '☕', name: 'Indian Coffee House (KSEB)', description: 'Iconic spiral-tower café — masala dosa, chicken biryani, parippu vada.', where: 'Indian Coffee House (Thampanoor) — heritage building' },
    { emoji: '🍌', name: 'Banana Chips + Halwa', description: 'Coconut-oil-fried Nendran banana chips and jaggery banana halwa.', where: 'Chalai Bazaar · Hotel Saravana' },
    { emoji: '🍢', name: 'Parippu Vada + Chai', description: 'Crisp lentil fritters with strong tea — Trivandrum tea-shop staple.', where: 'Roadside chai stalls across MG Road' },
  ],

  /* -------------------- North-East capitals + gaps -------------------- */

  aizawl: [
    { emoji: '🐖', name: 'Bawl Sa Bai',     description: 'Boiled pork with bamboo shoot, mustard greens and ginger — heart of Mizo cuisine.', where: "David's Kitchen (Chanmari) · Curry Pot" },
    { emoji: '🥬', name: 'Bai',             description: 'Boiled vegetables (mustard greens, pumpkin, papaya) with rice powder, soda and pork.', where: 'Local Mizo eateries near Dawrpui Bazaar' },
    { emoji: '🍖', name: 'Vawksa Rep',      description: 'Smoked pork — slow-cooked with bamboo shoot or tomato chutney.', where: 'Sumkuma · Spice Bowl' },
    { emoji: '🍚', name: 'Sanpiau',         description: "Aizawl breakfast staple — rice porridge topped with spring onion, fish flakes and pepper.", where: 'Roadside Sanpiau stalls in Bara Bazar' },
    { emoji: '🌶️', name: 'Misa Mach Poora', description: 'Grilled prawns marinated in mustard oil and chillies — Assamese-Mizo crossover.', where: 'Hill Pastry · roadside skewer joints' },
    { emoji: '🍰', name: 'Koat Pitha',      description: 'Crispy banana-rice fritters — best with hot Mizo tea.', where: 'Bara Bazar tea stalls · local Mizo bakeries' },
    { emoji: '🥟', name: 'Chhangban',       description: 'Sticky rice cake wrapped in banana leaf — special-occasion food.', where: 'Mizo home-kitchens · Treat Restaurant' },
    { emoji: '🍴', name: 'Mizo Heritage Thali', description: 'Multi-dish platter — bai, sa-um (pork curry), rice, mustard greens, koat pitha.', where: "Curry Pot · David's Kitchen (Chanmari)", tier: 'fine' },
  ],

  imphal: [
    { emoji: '🐟', name: 'Eromba',           description: 'Fermented-fish + boiled-vegetable mash with chilli — Manipuri signature.', where: "Luxmi Kitchen · Lalitha's" },
    { emoji: '🍚', name: 'Chak-Hao Kheer',  description: "Black-rice pudding with cardamom and milk — Manipur's royal sweet.", where: 'Classic Hotel · Manipur Bhawan canteen' },
    { emoji: '🍲', name: 'Kangshoi',         description: 'Light vegetable stew with ginger and seasonal greens.', where: 'Chaphu Restaurant · Manipuri thali joints' },
    { emoji: '🌶️', name: 'Singju',          description: 'Manipuri salad — shredded banana flower, lotus stem, herbs and red chilli.', where: "Khwairamband Bazaar (Ima Market) · Mother's Market stalls" },
    { emoji: '🐡', name: 'Nga Atoiba Thongba', description: 'Fish curry with bamboo shoots and ngari — pungent, deeply Manipuri.', where: 'Luxmi Kitchen · Shija Restaurant' },
    { emoji: '🍵', name: 'Manipuri Black Tea', description: 'Black tea brewed with bay leaf and cardamom — sip after dinner.', where: 'Imphal tea-shops near Kangla Fort' },
    { emoji: '🍰', name: 'Tan Ngang',       description: 'Crispy fried sweet wheat-flour bread — childhood-festival favourite.', where: 'Khwairamband Bazaar sweet stalls' },
    { emoji: '🍴', name: 'Chak-Naki Set Meal', description: 'Manipuri thali — rice, eromba, kangshoi, ngari side, salad, chak-hao kheer.', where: 'Luxmi Kitchen · Classic Grande', tier: 'fine' },
  ],

  kohima: [
    { emoji: '🐖', name: 'Smoked Pork with Akhuni', description: 'Smoked pork cooked with fermented soybean — quintessential Naga.', where: 'Dream Café · Ozone Cafe' },
    { emoji: '🌶️', name: 'Bhoot Jolokia Pork', description: "Pork with the world's hottest ghost chilli — handle with respect.", where: 'Naga Kitchen · Kohima Local Bites' },
    { emoji: '🍗', name: 'Galho',           description: 'Naga khichdi — rice with smoked meat, leafy greens and dry chilli.', where: 'Dream Café · Olive Garden Hotel' },
    { emoji: '🐔', name: 'Naga Chicken Curry', description: 'Free-range chicken with raja-mircha and bamboo shoot.', where: 'Ozone Cafe · Bamboo Bistro' },
    { emoji: '🍚', name: 'Bamboo-Shoot Rice', description: 'Steamed rice cooked inside bamboo with herbs and pork.', where: 'Hornbill Festival stalls · local home-kitchens' },
    { emoji: '🍵', name: 'Zutho',           description: 'Naga rice beer — milky, slightly tart, traditional welcome drink.', where: 'Hornbill Festival · Kohima village brews' },
    { emoji: '🥟', name: 'Aikibeya',        description: 'Steamed rice-flour cakes with pork filling — comfort snack.', where: 'Local Naga home-kitchens · Kohima Local Bites' },
    { emoji: '🍴', name: 'Naga Heritage Thali', description: 'Multi-dish platter — smoked meat, akhuni curry, rice, anishi (yam-leaf), chutneys.', where: 'Dream Café · Olive Garden', tier: 'fine' },
  ],

  agartala: [
    { emoji: '🐟', name: 'Mui Borok',        description: 'Tripuri fermented-fish (Berma) dish with green chilli and herbs.', where: 'Tripura Bhawan canteen · Curry Club' },
    { emoji: '🍚', name: 'Wahan Mosdeng',   description: 'Dry pork with green chilli, garlic and coriander — Tripuri tribal.', where: 'Curry Club · Hotel Polo Towers' },
    { emoji: '🍲', name: 'Chakhwi',         description: 'Bamboo-shoot stew with vegetables and pork — earthy, no spice masking.', where: 'Local Tripuri kitchens · Café Akashganga' },
    { emoji: '🌿', name: 'Gudok',           description: 'Mixed-veg stew with Berma — pungent, oil-free, deeply local.', where: 'Tripura Bhawan canteen · Café Akashganga' },
    { emoji: '🍰', name: 'Awandru',          description: 'Spicy chutney with chillies, fish-paste and herbs — eaten with rice.', where: 'Battala Market · Tripuri eateries' },
    { emoji: '🍵', name: 'Cha Kapi',        description: 'Tripura tea brewed strong with rice flakes — hill-region special.', where: 'Local tea stalls along MG Road' },
    { emoji: '🍴', name: 'Tripuri Thali',    description: 'Banana-leaf platter — rice, Mui Borok, chakhwi, awandru, dessert.', where: 'Curry Club · Hotel Polo Towers', tier: 'fine' },
  ],

  itanagar: [
    { emoji: '🐟', name: 'Pika Pila',        description: 'Fermented bamboo-shoot pickle with pork fat and king chilli.', where: 'Local Apatani kitchens · Hornbill Restaurant' },
    { emoji: '🍚', name: 'Apong Rice',       description: 'Fragrant red rice steamed with herbs — pairs with smoked meat.', where: 'Donyi Polo Café · tribal home-stays' },
    { emoji: '🍲', name: 'Thukpa',           description: 'Tibetan-style noodle soup with chicken/yak — popular near Tawang.', where: 'Tibetan kitchens (Doimukh) · Itanagar bus-stand cafes' },
    { emoji: '🥟', name: 'Smoky Pork Momos', description: 'Steamed dumplings with smoked pork or chicken — markets staple.', where: 'Itanagar bus-stand momo points' },
    { emoji: '🥩', name: 'Ngyi Pyak',        description: 'Banana-leaf-wrapped fish steamed with herbs — Adi tribe specialty.', where: 'Adi tribal eateries · home-stays' },
    { emoji: '🌶️', name: 'Smoked Pork Stew', description: 'Slow-cooked smoked pork with bamboo and king chilli.', where: 'Hornbill Restaurant · Donyi Polo Café' },
    { emoji: '🍵', name: 'Apong (rice beer)', description: 'Locally-brewed rice beer — Adi/Apatani celebration drink.', where: 'Tribal home-stays · Ziro festival outlets' },
    { emoji: '🍴', name: 'Arunachal Tribal Thali', description: 'Seven-dish platter with smoked meat, fermented sides, red rice.', where: 'Hornbill Restaurant · Donyi Polo Café', tier: 'fine' },
  ],

  /* -------------------- Other commonly-searched cities -------------------- */

  dehradun: [
    { emoji: '🍰', name: 'Bal Mithai',       description: 'Brown chocolate-like khoa fudge coated with white sugar pearls — Kumaoni icon.', where: 'Kumaon Sweets (Rajpur Road) · Ellora Bakery' },
    { emoji: '🥥', name: 'Singori',          description: 'Cone-shaped khoa sweet wrapped in malu leaf — Almora-origin pahadi sweet.', where: 'Standard Sweets · Kumaon Sweets (Paltan Bazaar)' },
    { emoji: '🥔', name: 'Aloo ke Gutke',    description: 'Spiced potatoes with red chilli and jakhya seeds — Garhwali classic.', where: 'Kumaon Restaurant · GMVN canteen (Rispana Pul)' },
    { emoji: '🥘', name: 'Kaapa',            description: 'Spinach curry thickened with rice flour — Garhwali everyday food.', where: 'GMVN canteen · Kumaon Restaurant' },
    { emoji: '🌿', name: 'Bhang ki Chutney', description: 'Hemp-seed chutney with red chilli and lemon — pahadi staple.', where: 'Local thali joints near Paltan Bazaar' },
    { emoji: '🥟', name: 'Tibetan Market Momos', description: 'Tibetan-style steamed dumplings — Dehradun has the best in the plains.', where: 'Paltan Bazaar Tibetan Market · Big Bite' },
    { emoji: '🌺', name: 'Buransh Sharbat',  description: 'Rhododendron-flower drink — found only in Himalayan towns.', where: 'Pahadi cafés along Mussoorie Road' },
    { emoji: '🍴', name: 'Garhwali Thali',   description: 'Mandua roti, kaapa, jhangora kheer, gahat dal, gutke — pahadi feast.', where: 'Kumaon Restaurant · Doon Café (Hotel Madhuban)', tier: 'fine' },
  ],

  tirupati: [
    { emoji: '🛕', name: 'Tirupati Laddu',    description: 'GI-tagged temple prasadam — ghee, gram flour, cashews and raisins.', where: 'Tirumala Temple complex (TTD counter)' },
    { emoji: '🍚', name: 'Pulihora',          description: 'Tamarind rice with curry leaves and peanuts — temple-meal staple.', where: 'TTD canteens · Sri Padmavathi Veg Palace' },
    { emoji: '🥟', name: 'Vada with Sambar',  description: 'Crispy lentil donut with hot sambar — perfect for darshan mornings.', where: 'Sri Krishna Tiffins · Maya Tiffin Center' },
    { emoji: '🍮', name: 'Pongal',            description: 'Rice + moong dal porridge with ghee, pepper and cashew.', where: 'Maya Tiffin · Sri Padmavathi Veg Palace' },
    { emoji: '🍰', name: 'Andhra Mysore Pak', description: 'Ghee-rich gram-flour fudge — softer and denser than the Karnataka version.', where: 'Sri Krishna Sweets · Andhra Sweets' },
    { emoji: '☕', name: 'Filter Coffee',     description: 'Strong davara-tumbler coffee — start the long darshan queue with this.', where: 'TTD devasthanam canteens · local tiffin centres' },
    { emoji: '🍴', name: 'Andhra Banana-leaf Meals', description: 'Banana-leaf thali — gongura pachadi, pulusu, papad, ghee rice.', where: 'Minerva Grand · Bhimas Deluxe Restaurant', tier: 'fine' },
  ],

  visakhapatnam: [
    { emoji: '🦞', name: 'Coastal Prawn Curry', description: 'Fresh prawns simmered in red-chilli + coconut gravy.', where: 'Aaharam · Sri Sairam Parlour (RK Beach)' },
    { emoji: '🐟', name: 'Pulasa Pulusu',     description: 'Hilsa-relative cooked in tamarind gravy — Andhra delicacy (Aug–Oct).', where: 'Sea Inn · Aaharam' },
    { emoji: '🌶️', name: 'Andhra Chicken 65', description: 'Fiery red-chilli + curry-leaf-tossed chicken — a Vizag invention.', where: 'Tycoon Restaurant · Bay Bridge Restaurant' },
    { emoji: '🍚', name: 'Andhra Meals',      description: 'Banana-leaf unlimited thali — gongura, sambar, papad, ghee rice.', where: 'Aaharam · Spicy Venue' },
    { emoji: '🥯', name: 'Bobbatlu',          description: 'Sweet stuffed flatbread with chana dal jaggery — festival food.', where: 'Pulla Reddy Sweets · Almond House' },
    { emoji: '🌯', name: 'Bongulo Chicken',   description: 'Chicken cooked inside bamboo over wood-fire — Araku Valley specialty.', where: 'Highway dhabas to Araku · Araku tribal cafés' },
    { emoji: '☕', name: 'Filter Coffee',     description: 'Strong davara-tumbler coffee — RK Beach mornings.', where: 'Sai Ram (RK Beach) · Tycoon Coffee' },
    { emoji: '🍴', name: 'Vizag Seafood Tasting', description: 'Multi-course platter — prawn fry, fish curry, crab masala, biryani.', where: 'Sea Inn (RK Beach) · Bay Bridge', tier: 'fine' },
  ],

  bhubaneswar: [
    { emoji: '🛕', name: 'Dahibara Aludum',   description: 'Soaked lentil dumplings in spiced curd + spicy potato curry — Cuttack origin.', where: 'Raghu Dahibara (Saheed Nagar) · Bidyut Dahibara' },
    { emoji: '🍰', name: 'Chhena Poda',       description: '"Burnt cottage cheese" — caramelised baked cheesecake of Odisha.', where: 'Bikalananda Kar (Salepur) · Pahala roadside (NH-16)' },
    { emoji: '🥟', name: 'Pakhala Bhata',     description: 'Fermented-rice in water with curd, mango chutney and tempering.', where: 'Hare Krishna · Wildgrass Restaurant' },
    { emoji: '🍲', name: 'Dalma',             description: 'Lentils + vegetables tempered with panch-phoran — Odia staple.', where: 'Wildgrass · Mauli Restaurant' },
    { emoji: '🍮', name: 'Rasagola (Odisha)', description: 'Soft, syrup-soaked cottage-cheese balls — GI-tag of Odisha.', where: 'Pahala roadside (NH-16) · Bikalananda Kar' },
    { emoji: '🐟', name: 'Macha Besara',      description: 'Fish in mustard gravy with green chilli — Odia signature.', where: 'Wildgrass · Dalma Restaurant' },
    { emoji: '🥘', name: 'Mutton Kasha',      description: 'Slow-cooked dry mutton with caramelised onions — Sunday treat.', where: 'Tamarind Restaurant · Dalma' },
    { emoji: '🍴', name: 'Odia Heritage Thali', description: 'Banana-leaf platter — pakhala, dalma, machha besara, chhena poda.', where: 'Wildgrass · Tamarind Restaurant', tier: 'fine' },
  ],

  /* -------------------- Top-100 destination coverage -------------------- */

  srinagar: [
    { emoji: '🍛', name: 'Rogan Josh',           description: 'Slow-cooked lamb in red Kashmiri-chilli + yogurt gravy — the icon of Kashmiri Wazwan.', where: 'Ahdoos (Residency Road) · Mughal Darbar' },
    { emoji: '🥬', name: 'Haakh Saag',           description: 'Collard-greens cooked in mustard oil and asafoetida — Kashmiri Pandit staple.', where: 'Krishna Vaishno Dhaba · Pandit kitchens' },
    { emoji: '🍖', name: 'Tabakh Maaz',          description: 'Twice-cooked lamb ribs — boiled, then fried in ghee until crisp.', where: 'Mughal Darbar · Ahdoos' },
    { emoji: '🥖', name: 'Kashmiri Bakery',      description: 'Sesame-topped kulchas and lavasa breads from old-city bakeries — pair with Noon chai.', where: 'Bohri Kadal bakeries · Lal Chowk' },
    { emoji: '🍵', name: 'Kahwa',                description: 'Saffron-cardamom-almond green tea — sip after every meal.', where: 'Ahdoos · houseboat kitchens (Dal Lake)' },
    { emoji: '🍡', name: 'Phirni',               description: 'Slow-cooked rice pudding in clay kulhads with rose water and almonds.', where: 'Mughal Darbar · old-city sweet shops' },
    { emoji: '🌭', name: 'Harissa',              description: 'Winter-only mutton-rice-fennel paste — deeply spiced, eaten with girda bread.', where: 'Ali Mohammad (Aali Kadal) · winter pop-ups' },
    { emoji: '🍴', name: 'Wazwan Tasting',       description: '36-course royal Kashmiri feast — gushtaba, rista, tabakh maaz, served on traami.', where: 'Ahdoos (advance booking) · Mughal Darbar', tier: 'fine' },
  ],

  leh: [
    { emoji: '🥟', name: 'Mok Mok (Momos)',      description: 'Steamed Ladakhi dumplings with mutton or yak filling.', where: "Lala's Café · Tibetan Kitchen (Old Leh)" },
    { emoji: '🍜', name: 'Thukpa',               description: 'Hand-pulled Ladakhi noodles in spiced mutton/yak broth.', where: 'Tibetan Kitchen · Bon Appetit' },
    { emoji: '🥣', name: 'Skyu',                 description: 'Stew of disc-shaped wheat dough with root vegetables and meat.', where: 'Local Ladakhi homestays · Lehling Restaurant' },
    { emoji: '🥨', name: 'Khambir + Apricot Jam', description: 'Whole-wheat Ladakhi bread baked in tandoor — with house-made apricot jam.', where: "Old Leh bakeries (Polo Ground) · Lala's Café" },
    { emoji: '🍵', name: 'Butter Tea',           description: 'Yak-butter and salt churned into black tea — high-altitude warmer.', where: 'Tibetan Kitchen · monasteries (Hemis, Thiksey)' },
    { emoji: '🍰', name: 'Apricot Cake',         description: 'Locally-grown Ladakhi apricots baked into sponge — Leh bakery favourite.', where: 'Bon Appetit · Wonderland Café' },
    { emoji: '🐂', name: 'Yak Cheese + Honey',   description: 'Hand-aged yak cheese with raw mountain honey — Leh market specialty.', where: 'Leh Main Bazaar shops' },
    { emoji: '🍴', name: 'Ladakhi Tasting Menu', description: '5-course set — momos, thukpa, skyu, khambir, butter-tea, apricot cake.', where: 'Tibetan Kitchen · Bon Appetit', tier: 'fine' },
  ],

  jaisalmer: [
    { emoji: '🌶️', name: 'Ker Sangri',          description: 'Desert berries + dried beans tossed with chilli and mustard oil — Marwari classic.', where: 'Trio Restaurant · Saffron (Nachna Haveli)' },
    { emoji: '🥘', name: 'Gatte ki Sabzi',       description: 'Gram-flour dumplings simmered in spiced curd gravy.', where: "Trio · Desert Boy's Dhaani" },
    { emoji: '🍞', name: 'Bajra Roti + Lasun ki Chutney', description: 'Pearl-millet flatbread with garlic-red-chilli chutney — desert food.', where: "Desert Boy's Dhaani · Suryagarh sandbar dinners" },
    { emoji: '🍠', name: 'Daal Baati Churma',    description: 'Wheat-baati dipped in ghee with panchmel daal and sweet-spiced churma.', where: 'Trio Restaurant · Chandni Chowk' },
    { emoji: '🍰', name: 'Ghotua Laddu',         description: "Soft besan-and-ghee fudge laddu — Jaisalmer's signature mithai.", where: 'Dhanraj Bhatia Mishtanna Bhandar' },
    { emoji: '🥛', name: 'Makhaniya Lassi',      description: 'Saffron-spiced thick lassi served in clay kulhads.', where: 'Bhang Lassi shop (Gopa Chowk) · Mishrilal' },
    { emoji: '🍵', name: 'Patwon ki Haveli Chai', description: 'Strong cardamom chai with the haveli backdrop.', where: 'Patwon ki Haveli alley tea-stalls' },
    { emoji: '🍴', name: 'Sand-dune Royal Thali', description: 'Multi-dish Marwari platter served at sunset on the dunes.', where: 'Suryagarh Jaisalmer · Serai Camp', tier: 'fine' },
  ],

  haridwar: [
    { emoji: '🛕', name: 'Mathura ke Pede',      description: 'Soft khoa pedas — temple-prasad staple, eat fresh from the bhattis.', where: 'Mohanji Sweets (Bara Bazaar) · Hari Ji Sweets' },
    { emoji: '🥘', name: 'Aloo Puri + Sabji',    description: 'Crisp puris with potato-tomato sabji — pilgrim breakfast staple.', where: 'Chotiwala (Har Ki Pauri) · Big Ben Restaurant' },
    { emoji: '🍰', name: 'Kachori + Jalebi',     description: 'Spicy moong-dal kachori with hot crisp-syrupy jalebi.', where: 'Mohanji Sweets · Lala Chai near Har Ki Pauri' },
    { emoji: '🍶', name: 'Devbhoomi Lassi',      description: 'Thick sweet/saffron lassi in mitti kulhads — post-Ganga aarti tradition.', where: 'Bhola Dhaba · Madhuban Sweets' },
    { emoji: '🍡', name: 'Bal Mithai + Singori', description: 'Kumaoni khoa sweets — chocolate-like fudge and malu-leaf parcels.', where: 'Pahadi Bhojnalaya · Standard Sweets' },
    { emoji: '🥟', name: 'Ram Bhog Thali',       description: 'Pure-veg satvik thali — kadhi, aloo dum, puri, kheer (no onion-garlic).', where: 'Chotiwala · Hoshiyar Puri' },
    { emoji: '🍵', name: 'Chai + Bhajia',        description: 'Ginger chai with hot besan-onion fritters near the Mansa Devi rope-way.', where: 'Mansa Devi rope-way base · Har Ki Pauri stalls' },
    { emoji: '🍴', name: 'Pahadi Heritage Thali', description: 'Garhwali platter — mandua roti, kaapa, gahat dal, jhangora kheer.', where: 'Aaroma Restaurant · Hotel Suvidha Deluxe', tier: 'fine' },
  ],

  nainital: [
    { emoji: '🍰', name: 'Bal Mithai',           description: 'Brown khoa fudge coated with white sugar pearls — Almora classic, perfected in Nainital.', where: "Sakley's · Standard Sweets (Mall Road)" },
    { emoji: '🥥', name: 'Singori',              description: 'Cone-shaped khoa sweet wrapped in malu leaf.', where: 'Standard Sweets · Nainital Sweets' },
    { emoji: '🥔', name: 'Aloo ke Gutke',        description: 'Spiced potatoes with red chilli and jakhya seeds — Kumaoni staple.', where: 'Sonam Tibetan (Mall Road) · Machaan Restaurant' },
    { emoji: '🥘', name: 'Bhatt ki Churkani',    description: 'Black-soybean curry thickened with rice-flour — winter Kumaoni warmer.', where: 'Machaan · KMVN cafeteria' },
    { emoji: '🥟', name: 'Tibetan Momos',        description: 'Steamed pork/chicken momos with fiery red chutney — best at sunset.', where: 'Sonam Tibetan · Bhotia Market' },
    { emoji: '🌺', name: 'Buransh Sharbat',      description: 'Rhododendron-flower drink — Himalayan summer tonic.', where: 'Pahadi cafés along Tallital lake' },
    { emoji: '☕', name: "Sakley's Café Bakes",   description: 'Heritage 1944 café — pastries, pies and woodfire pizzas with lake views.', where: "Sakley's (Mall Road, Tallital end)" },
    { emoji: '🍴', name: 'Kumaoni Heritage Thali', description: 'Mandua roti, gahat dal, kaapa, bhang chutney, jhangora kheer.', where: 'Machaan Restaurant · KMVN Sukhatal', tier: 'fine' },
  ],

  chandigarh: [
    { emoji: '🍛', name: 'Chole Bhature',        description: 'Punjabi spiced chickpeas with puffed bhatura — Sec-17 institution.', where: 'Sindhi Sweets (Sec-17) · Pal Dhaba (Sec-28)' },
    { emoji: '🍢', name: 'Tandoori Chicken',     description: 'Yogurt-marinated chicken cooked in clay tandoor — Chandigarh classic.', where: 'Pal Dhaba · Mehfil Restaurant' },
    { emoji: '🥗', name: 'Sarson da Saag + Makki di Roti', description: 'Mustard-greens curry with maize roti and white butter — Punjab signature.', where: 'Pal Dhaba (winters) · Bhoj Vegetarian' },
    { emoji: '🥘', name: 'Amritsari Kulcha',     description: 'Stuffed potato/onion kulcha — crisp tandoor-baked, eaten with chole.', where: 'Sindhi Sweets · Garg Chaat Bhandar' },
    { emoji: '🥟', name: 'Aloo Tikki Burger',    description: 'Crisp potato patty in pav with green and tamarind chutney — Sec-22 street.', where: 'Sec-22 chaat lane · Garg Chaat' },
    { emoji: '🍮', name: 'Pinni',                description: 'Wheat-flour-and-ghee winter laddu with almonds — Punjabi household sweet.', where: 'Sindhi Sweets · Bishan Sweets (Sec-22)' },
    { emoji: '🍦', name: 'Lassi (Sweet/Salty)',  description: 'Thick yogurt drink with butter and rabri — Punjab summer ritual.', where: 'Sindhi Sweets · 17C Lassi shop' },
    { emoji: '🍴', name: 'Punjabi Royal Thali',  description: 'Multi-dish platter — saag, butter chicken, dal makhani, kulcha, kheer.', where: 'Bhoj Vegetarian (Sec-9) · Mehfil', tier: 'fine' },
  ],

  lonavala: [
    { emoji: '🍬', name: 'Maganlal Chikki',      description: "Peanut-and-jaggery brittle — Lonavala's signature gift, since 1948.", where: 'Maganlal Chikki (Main Bazaar) · National Chikki' },
    { emoji: '🌽', name: 'Bhutta at Tiger Point', description: 'Fire-roasted corn with lime-chilli salt — monsoon classic.', where: 'Tiger Point viewpoint · Khandala Ghat stalls' },
    { emoji: '🥟', name: 'Vada Pav',             description: "Mumbai's burger — spicy potato fritter in pav with green chutney.", where: 'Lonavala station vada-pav stalls' },
    { emoji: '🌶️', name: 'Misal Pav',           description: 'Spicy sprouts curry topped with farsan, served with pav and lemon.', where: "Ramkrishna Hotel · Cooper's Fudge" },
    { emoji: '🍫', name: "Cooper's Fudge",       description: 'Heritage 1929 walnut-and-chocolate fudge factory.', where: "Cooper's Fudge (Main Bazaar)" },
    { emoji: '🥘', name: 'Maharashtrian Thali',  description: 'Pithla-bhakri, varan-bhaat, batata-bhaji, koshimbir — village-style.', where: 'Hotel Saaj · Rama Krishna' },
    { emoji: '☕', name: 'Bun Maska + Cutting Chai', description: 'Soft bun with butter and strong masala chai — Khandala Ghat ritual.', where: 'Lonavala station Irani cafés · Khandala viewpoint' },
    { emoji: '🍴', name: 'Maharashtrian Royal Thali', description: 'Multi-dish platter — solkadhi, vada, bhaji, modak, puran poli.', where: 'Hotel Chandralok · Saaj by the Lake', tier: 'fine' },
  ],

  coimbatore: [
    { emoji: '🍛', name: 'Kongu Nadu Kari Dosai', description: 'Mutton-curry-stuffed dosa — Coimbatore-region signature.', where: 'Annapoorna Gowrishankar · Hot Chips' },
    { emoji: '🍜', name: 'Kambu Koozh',          description: 'Pearl-millet porridge with raw onion and pickle — village-cool drink.', where: 'Tiffanys (RS Puram) · roadside Kongu kitchens' },
    { emoji: '🥘', name: 'Arisi Paruppu Sadham', description: 'Rice-and-dal one-pot with sesame-oil tempering — Kongu staple.', where: 'Annapoorna · Sree Annapoorna' },
    { emoji: '🍪', name: 'Atho (Burma noodles)', description: 'Burmese-Tamil street noodles with crispy onion and chilli oil.', where: 'Edaikkad Atho stall (Town Hall) · Burma Bazaar' },
    { emoji: '🍡', name: 'A2B Mysore Pak',       description: 'Ghee-rich gram-flour fudge — Adyar Ananda Bhavan perfected the soft version.', where: 'Adyar Ananda Bhavan · Sree Krishna Sweets' },
    { emoji: '☕', name: 'Coimbatore Filter Coffee', description: 'Strong south-Indian decoction with frothed milk — start your morning.', where: 'Hot Chips · Junior Kuppanna' },
    { emoji: '🍱', name: 'Kongu Mutton Briyani', description: 'Seeraga-samba-rice biryani with country mutton — earthy, mildly spiced.', where: 'Junior Kuppanna · Ponnusamy Hotel' },
    { emoji: '🍴', name: 'Kongu Heritage Meals', description: 'Banana-leaf platter — kari dosai, mutton chukka, paruppu sadham, kheer.', where: 'Junior Kuppanna · Hotel Saravana Bhavan', tier: 'fine' },
  ],

  rameswaram: [
    { emoji: '🐟', name: 'Fresh Catch Fish Curry', description: "Day's catch (vanjaram, seer) cooked in tamarind-coconut gravy.", where: 'Hotel Saravana · Devi Mess' },
    { emoji: '🦀', name: 'Crab Roast',           description: 'Local crab tossed with pepper, curry-leaves and shallots.', where: 'Hotel Tamilnadu · beach-side mess kitchens' },
    { emoji: '🛕', name: 'Annadanam',            description: 'Free temple meal — sambar rice, curd rice, payasam at Ramanathaswamy Temple.', where: 'Ramanathaswamy Temple complex (12.30 PM)' },
    { emoji: '🍚', name: 'Banana-leaf Meals',    description: 'Unlimited South Indian thali — sambar, rasam, kuzhambu, payasam.', where: 'Devi Mess · Ariya Bhavan' },
    { emoji: '🥯', name: 'Idli Podi + Filter Coffee', description: 'Steamed rice cakes with sesame-chilli powder and ghee.', where: 'Hotel Sri Saravanan · Pankajam Mess' },
    { emoji: '☕', name: 'Tender Coconut',       description: 'Drink straight from the shell along Agni Theertham beach.', where: 'Beach front near Pamban bridge' },
    { emoji: '🍰', name: 'Pal Payasam',          description: 'Slow-cooked rice-and-jaggery milk pudding — temple festival sweet.', where: 'Devi Mess · sweet stalls near Agnitheertham' },
    { emoji: '🍴', name: 'Pamban Coastal Tasting', description: 'Multi-course seafood platter — fish curry, prawn fry, crab, rice.', where: 'Hotel Tamilnadu (TTDC) · Daiwik Hotel', tier: 'fine' },
  ],

  pushkar: [
    { emoji: '🥯', name: 'Malpua + Rabri',       description: 'Crisp wheat-flour pancakes drenched in syrup, topped with thick rabri.', where: 'Sarvodaya Mishtan Bhandar · Sri Ganga Sweets' },
    { emoji: '🍶', name: 'Pushkar Lassi',        description: 'Thick saffron lassi — one of the most photographed drinks in Rajasthan.', where: 'Sai Baba Haveli rooftop · Funky Monkey Café' },
    { emoji: '🥘', name: 'Daal Baati Churma',    description: 'Wheat baati with panchmel daal and sweet ghee-soaked churma.', where: 'Honey & Spice · Sunset Café' },
    { emoji: '🌶️', name: 'Ker Sangri',          description: 'Desert berries + dried beans tossed with chilli and mustard oil.', where: 'Honey & Spice · Out of the Blue' },
    { emoji: '🍞', name: 'Kachori + Aloo Sabji', description: 'Crisp moong-dal kachori with potato curry — Brahma Mandir lane snack.', where: 'Brahma Mandir lane stalls · Sarvodaya' },
    { emoji: '🥨', name: 'Israeli Falafel Café', description: "Falafel wraps and shakshuka — Pushkar's Israeli backpacker influence.", where: 'Out of the Blue · Sixth Sense' },
    { emoji: '☕', name: 'Sunset Café Cold Coffee', description: 'Frothy cold coffee overlooking Pushkar Lake at golden hour.', where: 'Sunset Café · Funky Monkey rooftop' },
    { emoji: '🍴', name: 'Sattvic Heritage Thali', description: 'No-onion-garlic platter — gatte, ker sangri, baati, churma, kheer.', where: 'Honey & Spice · Pushkar Bagh', tier: 'fine' },
  ],

  dharamshala: [
    { emoji: '🥟', name: 'Tibetan Momos',         description: 'Steamed/pan-fried dumplings with chicken/mutton/cheese — McLeodganj specialty.', where: "Lhamo's Croissant · Tibet Kitchen · Norling Kitchen" },
    { emoji: '🍜', name: 'Thenthuk',              description: 'Hand-torn Tibetan noodles in mutton or vegetable broth.', where: 'Tibet Kitchen · Carpe Diem · Snow Lion' },
    { emoji: '🍵', name: 'Butter Tea',            description: 'Yak-butter and salt churned with black tea — monastic warmer.', where: 'Tsuglagkhang Complex café · Norling' },
    { emoji: '🍞', name: 'Tingmo + Chilli Chicken', description: 'Steamed Tibetan bread with spicy Indo-Chinese chilli chicken.', where: 'Tibet Kitchen · Lung Ta' },
    { emoji: '🍱', name: 'Gyathuk Ngopa',         description: 'Stir-fried Tibetan flat noodles with vegetables and meat.', where: 'Lung Ta · Snow Lion' },
    { emoji: '🥗', name: 'Madra (Himachali)',     description: 'Yogurt-based chickpea curry with whole spices — Kangra valley dish.', where: 'Hotel Bhagsu · local Himachali kitchens' },
    { emoji: '☕', name: 'Moonpeak Espresso',     description: 'Heritage McLeodganj café — momo + cappuccino + Tibetan-style cake.', where: 'Moonpeak (Temple Road)' },
    { emoji: '🍴', name: 'Tibetan + Himachali Tasting', description: 'Multi-course set — momos, thukpa, madra, cham-cham, butter-tea.', where: 'Norling Restaurant · Tibet Kitchen', tier: 'fine' },
  ],

  mahabaleshwar: [
    { emoji: '🍓', name: 'Strawberry with Cream', description: 'Hand-picked Mapro strawberries served with fresh cream — town signature.', where: "Mapro Garden · Mala's Fruit Products" },
    { emoji: '🍫', name: 'Mapro Fudge',           description: 'Heritage 1959 strawberry-and-walnut fudge — buy at the source.', where: 'Mapro Garden (Panchgani Road)' },
    { emoji: '🥟', name: 'Vada Pav',              description: 'Maharashtrian potato burger with green chutney and fried green chilli.', where: 'Hill-station vada-pav stalls (Bus Stand)' },
    { emoji: '🌶️', name: 'Misal Pav',            description: 'Spicy sprouts curry topped with farsan, served with pav.', where: 'Mapro Garden Misal counter · Hotel Royal Garden' },
    { emoji: '🌽', name: 'Bhutta (corn)',         description: 'Fire-roasted corn with lime-chilli salt — viewpoint must-eat.', where: "Wilson Point sunset stalls · Arthur's Seat" },
    { emoji: '🥛', name: 'Mapro Milkshakes',      description: 'Strawberry, mulberry and rose milkshakes blended with farm fruit.', where: "Mapro Garden milkshake bar · Mala's" },
    { emoji: '🍦', name: 'Strawberry Ice-cream',  description: 'Locally-made fresh strawberry ice-cream with chunks of fruit.', where: 'Mapro Garden · Imperial Bakery' },
    { emoji: '🍴', name: 'Maharashtrian Heritage Thali', description: 'Pithla-bhakri, varan-bhaat, batata-bhaji, koshimbir, modak.', where: 'Hotel Royal Garden · Saaj by the Lake', tier: 'fine' },
  ],

  wayanad: [
    { emoji: '🐟', name: 'Karimeen Pollichathu',  description: 'Pearl-spot fish marinated and steamed inside banana leaf — Kerala backwater classic.', where: 'Vythiri Resort · 1980 The Theme Restaurant' },
    { emoji: '🍌', name: 'Pazham Pori',           description: 'Crisp ripe-banana fritters — perfect 4 PM tea-time snack.', where: 'Roadside chai shops along Banasura Sagar Road' },
    { emoji: '🌶️', name: 'Beef Ularthiyathu',     description: 'Slow-roasted beef with coconut, curry-leaf and pepper — Malayali fire-food.', where: '1980 The Theme · Onepic Restaurant' },
    { emoji: '🥥', name: 'Puttu + Kadala Curry',  description: 'Steamed coconut-rice cylinders with spiced black-chickpea curry.', where: 'Pearl Tree Hotel · local thattukadas' },
    { emoji: '🍵', name: 'Wayanad Spice Tea',     description: 'Cardamom-clove-pepper tea — straight from the spice plantations.', where: 'Spice plantation cafés (Pookode) · Ente Veedu' },
    { emoji: '🌿', name: 'Tribal Bamboo Rice',    description: 'Rare wild bamboo rice cooked with coconut milk — Kuruma tribe specialty.', where: 'Vythiri Village · Tribal home-stays' },
    { emoji: '☕', name: 'Plantation Filter Coffee', description: 'Estate-grown Wayanad coffee with frothy milk — refreshing in the cool hills.', where: 'Tea & Coffee Museum café · Spice Park' },
    { emoji: '🍴', name: 'Wayanad Heritage Sadya', description: 'Banana-leaf 24-dish vegetarian feast with payasam.', where: 'Vythiri Village · 1980 The Theme', tier: 'fine' },
  ],

  hampi: [
    { emoji: '🍛', name: 'Karnataka Veg Thali',   description: 'Banana-leaf meal with bisi-bele-bath, holige and palya — temple-town staple.', where: 'Mango Tree Restaurant · Hotel Mayura Bhuvaneshwari' },
    { emoji: '🥯', name: 'Holige (Obbattu)',      description: 'Sweet stuffed flatbread with chana-dal jaggery — festival-food classic.', where: 'Local sweet stalls (Hampi Bazaar) · Mango Tree' },
    { emoji: '🍚', name: 'Bisi Bele Bath',        description: 'Spicy rice-lentil-vegetable one-pot with khara boondi.', where: 'Mango Tree · Hotel Mayura' },
    { emoji: '🥟', name: 'Mysore Bonda',          description: 'Crisp deep-fried lentil dumplings with coconut chutney.', where: 'Hampi Bazaar tiffin stalls · Riverside Café' },
    { emoji: '☕', name: 'Mango Tree Filter Coffee', description: 'Strong davara-tumbler coffee with Tungabhadra-river breeze.', where: 'Mango Tree (boulder backdrop) · Laughing Buddha Café' },
    { emoji: '🍞', name: 'Backpacker Bowls',      description: 'Hummus bowls and falafel wraps — Virupapur Gaddi backpacker scene.', where: 'Laughing Buddha · Goan Corner (across river)' },
    { emoji: '🍰', name: 'Dharwad Peda',          description: 'Soft caramelised milk-fudge — North Karnataka classic, found in Hampi sweet shops.', where: 'Babusinghs Pedha (Hospet) · Hampi Bazaar' },
    { emoji: '🍴', name: 'Vijayanagara Royal Thali', description: 'Multi-course traditional Karnataka platter — bisi-bele-bath, holige, palya, payasam.', where: 'Evolve Back Kamalapura Palace · Hyatt Place Hampi', tier: 'fine' },
  ],

  ayodhya: [
    { emoji: '🛕', name: 'Ram Bhog Prasad',       description: 'Sweet boondi and panjiri offered at the Ram Mandir — sattvic, no onion-garlic.', where: 'Ram Janmabhoomi temple complex (prasad counters)' },
    { emoji: '🥘', name: 'Aloo Puri + Sabji',     description: 'Crisp puris with aloo-tomato sabji — pilgrim breakfast staple.', where: 'Hotel Ramprastha · Krishna Bhog Bhandar' },
    { emoji: '🍰', name: 'Khurchan + Peda',       description: 'Soft milk-cream rolls and khoa pedas — Ayodhya old-city sweet shops.', where: 'Mihir Sweets · Hari Sweets (Naya Ghat)' },
    { emoji: '🥟', name: 'Kachori + Jalebi',      description: 'Spicy moong-dal kachori with hot crisp-syrupy jalebi.', where: 'Naya Ghat lane stalls · Mihir Sweets' },
    { emoji: '🍡', name: 'Awadhi Galouti Kebab',  description: 'Lucknow-region soft minced kebabs (non-veg restaurants only).', where: 'Awadh Restaurant · Hotel The Ramayan' },
    { emoji: '🍵', name: 'Tulsi Chai',            description: 'Holy basil-flavoured tea — sip after Ram-Lalla aarti.', where: 'Naya Ghat tea-shops · Hanumangarhi base' },
    { emoji: '🍶', name: 'Saryu Ki Lassi',        description: 'Thick saffron lassi served in clay kulhads after the morning aarti.', where: 'Naya Ghat lassi shops · Hotel Ramprastha' },
    { emoji: '🍴', name: 'Sattvic Heritage Thali', description: 'Pure-veg multi-dish platter — kadhi, baingan bharta, puri, kheer.', where: 'Hotel Ramprastha · The Ramayan Resort', tier: 'fine' },
  ],

  default: [
    { emoji: '🥪', name: 'Local street snacks', description: 'Try the most popular street-food stalls clustered near markets and bus stands.' },
    { emoji: '🥘', name: 'Regional thali',     description: 'Order an unlimited regional thali to taste 8–12 dishes in one go.' },
    { emoji: '🍵', name: 'Local chai',         description: 'Stop at a busy chai stall — cardamom or ginger as per local tradition.' },
    { emoji: '🍛', name: 'Signature curry',    description: 'Ask the homestay host what the "must-try local non-veg/veg curry" is.' },
    { emoji: '🍮', name: 'Regional sweet',     description: 'Every Indian region has a unique mithai — pick one freshly fried.' },
  ],
}

/**
 * Spelling variants and satellite cities that should resolve to an existing
 * curated entry. Keys are normalised (lowercase, no spaces or hyphens).
 *
 * This is the single place to extend coverage without duplicating data — e.g.
 * "Bangalore" and "Bengaluru" both look up the same `bengaluru` rows.
 */
const CITY_ALIASES = {
  // Official renames / spelling variants
  bangalore:           'bengaluru',
  mysuru:              'mysore',
  puducherry:          'pondicherry',
  vizag:               'visakhapatnam',
  kashi:               'varanasi',
  prayagraj:           'varanasi',
  allahabad:           'varanasi',
  thiruvananthapuram:  'trivandrum',
  alappuzha:           'alleppey',
  // NCR / metro neighbourhoods
  noida:               'delhi',
  gurgaon:             'delhi',
  gurugram:            'delhi',
  faridabad:           'delhi',
  ghaziabad:           'delhi',
  // Goa beaches (all share Goan cuisine)
  panaji:              'goa',
  panjim:              'goa',
  calangute:           'goa',
  baga:                'goa',
  anjuna:              'goa',
  palolem:             'goa',
  vagator:             'goa',
  candolim:            'goa',
  // Kashmir circuit
  gulmarg:             'srinagar',
  sonamarg:            'srinagar',
  pahalgam:            'srinagar',
  vaishnodevi:         'srinagar',
  jammu:               'srinagar',
  // Ladakh
  pangong:             'leh',
  pangonglake:         'leh',
  nubra:               'leh',
  nubravalley:         'leh',
  // Uttarakhand
  kedarnath:           'haridwar',
  badrinath:           'haridwar',
  jimcorbett:          'nainital',
  corbett:             'nainital',
  mussoorie:           'dehradun',
  valleyofflowers:     'haridwar',
  // Himachal
  mcleodganj:          'dharamshala',
  triund:              'dharamshala',
  // Meghalaya
  cherrapunji:         'shillong',
  sohra:               'shillong',
  // Odisha
  konark:              'puri',
  // Assam
  kaziranga:           'guwahati',
  // Kerala satellites
  thekkady:            'munnar',
  varkala:             'trivandrum',
  kovalam:             'trivandrum',
  // Karnataka
  gokarna:             'mangalore',
  // Tamil Nadu
  mahabalipuram:       'chennai',
  mamallapuram:        'chennai',
  // Maharashtra
  shirdi:              'pune',
  nashik:              'pune',
  aurangabad:          'pune',
  // North Bengal
  siliguri:            'darjeeling',
  // UP pilgrim circuit
  mathura:             'varanasi',
  vrindavan:           'varanasi',
  // Bihar / Jharkhand
  bodhgaya:            'patna',
  nalanda:             'patna',
  ranchi:              'patna',
  // Chhattisgarh
  raipur:              'bhopal',
  // Gujarat
  bhuj:                'ahmedabad',
  kutch:               'ahmedabad',
  rannofkutch:         'ahmedabad',
  dwarka:              'ahmedabad',
  somnath:             'ahmedabad',
  // Rajasthan
  mountabu:            'udaipur',
  ranthambore:         'jaipur',
}

const { closestMatch } = require('../../lib/strings')

/**
 * Resolve a destination name to a known city key.
 *
 * Order of preference is carefully chosen so common edge-cases all behave:
 *   1) Exact slug match.
 *   2) Alias map (Bangalore → Bengaluru, McLeodganj → Dharamshala, etc.).
 *   3) **Tight** fuzzy match (edit distance ≤ 1) — runs BEFORE substring so
 *      "Visakapatnam" (1-char typo) maps to visakhapatnam, not to the
 *      coincidental "patna" substring inside it.
 *   4) Longest key that is a substring of the input ("new-delhi" → delhi).
 *   5) Longest key that the input is a substring of ("del" → delhi).
 *   6) Looser fuzzy fallback (edit distance ≤ 2-3, length-aware) for the
 *      bigger typos like "haidrabad" → hyderabad.
 */
function matchCityKey(cityName) {
  // Normalise: lowercase, strip whitespace AND hyphens so slugs like
  // "new-delhi", "mcleod-ganj", "rann-of-kutch" all collapse cleanly.
  const key = String(cityName || '').toLowerCase().trim().replace(/[\s-]+/g, '')
  if (!key) return null
  const keys = Object.keys(DESTINATION_STREET_FOOD).filter((k) => k !== 'default')

  if (keys.includes(key)) return key

  const aliased = CITY_ALIASES[key]
  if (aliased && (keys.includes(aliased) || aliased === 'default')) return aliased

  const aliasKeys = Object.keys(CITY_ALIASES)
  const candidates = [...keys, ...aliasKeys]

  // 3) Tight fuzzy match — must come BEFORE substring so 1-char typos in
  //    long names don't get hijacked by short substrings.
  const fuzzy = closestMatch(key, candidates)
  if (fuzzy && fuzzy.distance <= 1) {
    const resolved = CITY_ALIASES[fuzzy.match] || fuzzy.match
    if (keys.includes(resolved)) return resolved
  }

  // 4-5) Substring fallbacks (longest-first so "visakhapatnam" beats "patna").
  const byLen = [...keys].sort((a, b) => b.length - a.length)
  for (const k of byLen) {
    if (key.includes(k)) return k
  }
  for (const k of byLen) {
    if (k.includes(key)) return k
  }

  // 6) Looser fuzzy fallback for bigger typos.
  if (fuzzy) {
    const resolved = CITY_ALIASES[fuzzy.match] || fuzzy.match
    if (keys.includes(resolved)) return resolved
  }
  return null
}

/** Build a Google Maps deep-link from a "where" string, scoped to the city. */
function buildMapsUrl(where, cityLabel) {
  const w = String(where || '').trim()
  if (!w) return null
  const dot = w.indexOf('·')
  const first = (dot >= 0 ? w.slice(0, dot) : w).trim() || w
  const q = `${first} ${cityLabel || ''}`.trim()
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

/**
 * Allow only safe, fully-qualified http(s) URLs as `affiliateUrl`.
 * Rejects javascript:, data:, relative paths, and malformed inputs so a
 * misconfigured data entry can never inject anything dangerous client-side.
 */
function safeAffiliateUrl(raw) {
  if (!raw || typeof raw !== 'string') return null
  const s = raw.trim()
  if (s.length < 8 || s.length > 1024) return null
  try {
    const u = new URL(s)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    if (!u.hostname || u.hostname.includes(' ')) return null
    return u.toString()
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/*  In-memory TTL cache so DB hits are sub-millisecond                 */
/* ------------------------------------------------------------------ */
const SF_CACHE = new Map()           // key -> { items, exp }
const SF_INDEX_CACHE = { value: null, exp: 0 }
const SF_TTL_MS = 5 * 60 * 1000      // 5 min

function _now() { return Date.now() }
function _cacheKey(citySlug, tier) { return `${citySlug || 'default'}|${tier}` }

/** Drop all cached lookups (e.g. after a content edit). */
function clearStreetFoodCache() {
  SF_CACHE.clear()
  SF_INDEX_CACHE.value = null
  SF_INDEX_CACHE.exp = 0
}

/* ------------------------------------------------------------------ */
/*  Synchronous fallback — purely from the in-memory JS map            */
/* ------------------------------------------------------------------ */
function getDestinationStreetFoodSync(to, opts = {}) {
  const { tier = 'all', augment = true } = opts
  const matchedKey = matchCityKey(to)
  const list = matchedKey
    ? DESTINATION_STREET_FOOD[matchedKey]
    : DESTINATION_STREET_FOOD.default
  const cityLabel = matchedKey ? matchedKey : (to || '')

  const out = (list || []).map((item) => {
    const t = item.tier === 'fine' ? 'fine' : 'street'
    if (!augment) return { ...item, tier: t }
    return {
      ...item,
      tier: t,
      mapsUrl: item.mapsUrl || buildMapsUrl(item.where, cityLabel),
      affiliateUrl: safeAffiliateUrl(item.affiliateUrl) || null,
      affiliatePartner: item.affiliatePartner || null,
    }
  })
  if (tier === 'street' || tier === 'fine') return out.filter((i) => i.tier === tier)
  return out
}

/* ------------------------------------------------------------------ */
/*  Async (DB-backed) lookup — falls back to in-memory map on failure  */
/* ------------------------------------------------------------------ */
/**
 * Lookup street-food list for a destination name. Reads from `street_food_items`
 * with a 5-minute in-memory TTL cache. Falls back to the JS map if the DB
 * query fails (so the feature is resilient even if the DB is unreachable).
 *
 * @param {string} to                 destination city/place
 * @param {object} [opts]
 * @param {'all'|'street'|'fine'} [opts.tier='all']
 * @returns {Promise<Array>}
 */
async function getDestinationStreetFood(to, opts = {}) {
  const tier = opts.tier === 'street' || opts.tier === 'fine' ? opts.tier : 'all'

  // Resolve the canonical city slug from the JS map's known keys.
  const matchedKey = matchCityKey(to) || 'default'
  const cacheKey = _cacheKey(matchedKey, tier)
  const cached = SF_CACHE.get(cacheKey)
  if (cached && cached.exp > _now()) return cached.items

  // Lazy require to avoid a require cycle (repo -> db -> trip.data).
  let dbItems = null
  try {
    const repo = require('./streetFood.repo')
    dbItems = await repo.getByCitySlug(matchedKey, { tier, limit: 100 })
    if ((!dbItems || dbItems.length === 0) && matchedKey !== 'default') {
      // City has no rows yet — fall back to default.
      dbItems = await repo.getByCitySlug('default', { tier, limit: 100 })
    }
  } catch {
    dbItems = null
  }

  let items
  if (dbItems && dbItems.length > 0) {
    // DB rows already include all augmented fields (mapsUrl/affiliateUrl/tier
    // are stored). Just normalize the affiliate URL through the validator
    // one more time as a safety net.
    items = dbItems.map((it) => ({
      ...it,
      affiliateUrl: safeAffiliateUrl(it.affiliateUrl) || null,
    }))
  } else {
    items = getDestinationStreetFoodSync(to, { tier, augment: true })
  }

  SF_CACHE.set(cacheKey, { items, exp: _now() + SF_TTL_MS })
  return items
}

/**
 * Aggregated street-food index (admin/analytics helper) — DB-backed.
 * @returns {Promise<{cities:number,total:number,byCity:Array<{city:string,count:number,street:number,fine:number}>}>}
 */
async function streetFoodIndex() {
  if (SF_INDEX_CACHE.value && SF_INDEX_CACHE.exp > _now()) return SF_INDEX_CACHE.value
  let result
  try {
    const repo = require('./streetFood.repo')
    result = await repo.index()
  } catch {
    result = null
  }
  if (!result || result.total === 0) {
    // Fallback: compute from the in-memory map.
    const byCity = []
    let total = 0
    for (const [k, v] of Object.entries(DESTINATION_STREET_FOOD)) {
      if (k === 'default' || !Array.isArray(v)) continue
      const fine = v.filter((i) => i.tier === 'fine').length
      const street = v.length - fine
      byCity.push({ city: k, count: v.length, street, fine })
      total += v.length
    }
    byCity.sort((a, b) => b.count - a.count)
    result = { cities: byCity.length, total, byCity }
  }
  SF_INDEX_CACHE.value = result
  SF_INDEX_CACHE.exp = _now() + SF_TTL_MS
  return result
}

module.exports = {
  CURATED_ROUTES,
  DESTINATION_KNOWLEDGE,
  DESTINATION_STREET_FOOD,
  getDestinationStreetFood,           // async, DB-backed (with JS-map fallback)
  getDestinationStreetFoodSync,       // sync, JS-map only — for emergencies
  streetFoodIndex,                    // async
  clearStreetFoodCache,
  buildMapsUrl,
  safeAffiliateUrl,
  matchCityKey,
}
