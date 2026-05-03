'use strict'

/**
 * Place-aware shopping suggestions.
 *
 * Strategy (cheap → smart):
 *   1. Curated map of (place) → famous shopping markets, malls, streets and
 *      craft hubs. Always returns something instantly for the most-searched
 *      destinations, even offline / without any 3rd-party API.
 *   2. Optional live enrichment via OpenStreetMap's Overpass API — free,
 *      no key required, so we don't need a paid Google Places billing
 *      account. We pull `shop=mall`, `shop=department_store`, `amenity=
 *      marketplace` and major bazaars near the destination's coordinates.
 *   3. Every spot is decorated with click-through URLs that open Google
 *      Maps search ("Best matches Indian travellers expect"), Google
 *      web search, and the venue's OSM page when we have an OSM id.
 *
 * Output is cached in-memory by `placeKey` for ~1 hour so repeat visits
 * to the same comparison page don't re-hit Overpass.
 *
 * NOTE on "Google data": Google Places API is gated behind paid billing,
 * so we use the free-and-open OSM dataset for live coverage and Google
 * Maps SEARCH urls for click-through (no API key needed for that). The
 * user opens the result in real Google Maps — they get Google's data,
 * just on demand instead of via a server-side API call.
 */

const env = require('../../config/env')

/* ────────────────────────────────────────────────────────────────── *
 * 1. Curated shopping for the most-searched Indian destinations       *
 * ────────────────────────────────────────────────────────────────── */

/**
 * Each spot has:
 *   name        – display name
 *   type        – 'market' | 'mall' | 'street' | 'bazaar' | 'craft' | 'boutique'
 *   area        – neighbourhood / locality
 *   description – 1-line "why go here" for travellers
 *   knownFor    – array of standout items (chips in the UI)
 *   priceRange  – 'budget' | 'mid' | 'luxury'
 *
 * Markets are deliberately well-known so a Google Maps search resolves
 * cleanly to a real place (rather than ambiguous results).
 */
const CURATED = {
  delhi: {
    region: 'Delhi NCR',
    spots: [
      { name: 'Chandni Chowk',        type: 'bazaar', area: 'Old Delhi',     description: 'Iconic Mughal-era market lane — wholesale electronics, bridal fabrics, paranthas.', knownFor: ['Wedding lehengas', 'Kinari Bazaar', 'Paranthe Wali Gali'], priceRange: 'budget' },
      { name: 'Sarojini Nagar Market',type: 'street', area: 'South Delhi',   description: 'Export-surplus haven for trend-led fashion at street prices.', knownFor: ['Tops ₹150', 'Denim', 'Accessories'], priceRange: 'budget' },
      { name: 'Khan Market',          type: 'street', area: 'Central Delhi', description: 'Boutique books, designer labels and coffeeshops favoured by diplomats.', knownFor: ['Indie brands', 'Bookshops', 'Cafes'], priceRange: 'luxury' },
      { name: 'Dilli Haat',           type: 'craft',  area: 'INA',           description: 'Government-run handicraft village — every Indian state, one campus.', knownFor: ['Pashmina', 'Block prints', 'Brassware'], priceRange: 'mid' },
      { name: 'Janpath Market',       type: 'street', area: 'Connaught Place', description: 'Tibetan & Rajasthani trinkets along the Janpath strip.', knownFor: ['Silver jewellery', 'Boho dresses', 'Souvenirs'], priceRange: 'budget' },
      { name: 'Select Citywalk',      type: 'mall',   area: 'Saket',         description: 'Premium mall with luxury Indian designers, Zara, Sephora and a multiplex.', knownFor: ['FabIndia', 'Designer wear', 'Food court'], priceRange: 'luxury' },
      { name: 'DLF Promenade',        type: 'mall',   area: 'Vasant Kunj',   description: 'Compact luxury mall — international labels, fine dining.', knownFor: ['Luxury watches', 'Tom Ford', 'Cinepolis'], priceRange: 'luxury' },
    ],
  },
  mumbai: {
    region: 'Mumbai',
    spots: [
      { name: 'Colaba Causeway',      type: 'street', area: 'South Mumbai',  description: 'Open-air bazaar on a heritage strip — bags, posters, junk jewellery.', knownFor: ['Leather bags', 'Antique brass', 'Vintage posters'], priceRange: 'budget' },
      { name: 'Linking Road',         type: 'street', area: 'Bandra West',   description: 'Bandra fashion mile — footwear, knock-off bags and Bollywood-cool fits.', knownFor: ['Junk jewellery', 'Footwear', 'Cropped tops'], priceRange: 'budget' },
      { name: 'Chor Bazaar',          type: 'bazaar', area: 'Mutton Street', description: 'The legendary "thieves\u2019 market" — vintage Bollywood, gramophones, brass.', knownFor: ['Antique cameras', 'Bollywood posters', 'Gramophones'], priceRange: 'mid' },
      { name: 'Crawford Market',      type: 'market', area: 'Fort',          description: 'Heritage covered market for fruit, exotic produce, imported snacks.', knownFor: ['Imported chocolate', 'Cheese', 'Fresh seafood'], priceRange: 'mid' },
      { name: 'High Street Phoenix',  type: 'mall',   area: 'Lower Parel',   description: 'Mumbai\u2019s flagship luxury mall — international labels, restaurants, cinema.', knownFor: ['Apple', 'H&M', 'Hamleys'], priceRange: 'luxury' },
      { name: 'Palladium',            type: 'mall',   area: 'Lower Parel',   description: 'High-luxury wing of Phoenix — Jimmy Choo, Burberry, Gucci.', knownFor: ['Designer luxury', 'Ralph Lauren'], priceRange: 'luxury' },
      { name: 'Hill Road',            type: 'street', area: 'Bandra West',   description: 'Quirky Catholic-quarter strip — alt fashion, indie cafés, vintage.', knownFor: ['Hippie tops', 'Sneakers', 'Pop-art prints'], priceRange: 'budget' },
    ],
  },
  bengaluru: {
    region: 'Bengaluru',
    spots: [
      { name: 'Commercial Street',    type: 'street', area: 'Shivajinagar',  description: 'Dense bargaining strip — saris, footwear, costume jewellery.', knownFor: ['Sarees', 'Junk jewellery', 'Footwear'], priceRange: 'budget' },
      { name: 'Brigade Road',         type: 'street', area: 'MG Road',       description: 'Pedestrian boulevard with global brands and street fashion.', knownFor: ['Levi\u2019s', 'Local boutiques', 'Cafés'], priceRange: 'mid' },
      { name: 'Chickpet',             type: 'bazaar', area: 'KR Market',     description: 'Wholesale silk + textile lanes loved by sari shoppers.', knownFor: ['Silk sarees', 'Banarasi', 'Dress materials'], priceRange: 'mid' },
      { name: 'UB City',              type: 'mall',   area: 'Vittal Mallya Rd', description: 'Glass-tower luxury — Louis Vuitton, Burberry, fine dining.', knownFor: ['Luxury labels', 'Fine dining'], priceRange: 'luxury' },
      { name: 'Phoenix Marketcity',   type: 'mall',   area: 'Whitefield',    description: 'Massive east-Bengaluru mall with everything mid-to-premium.', knownFor: ['Marks & Spencer', 'Zara', 'PVR'], priceRange: 'mid' },
      { name: 'Cauvery Emporium',     type: 'craft',  area: 'MG Road',       description: 'Karnataka government emporium — sandalwood, silk, Channapatna toys.', knownFor: ['Mysore silk', 'Sandalwood', 'Channapatna toys'], priceRange: 'mid' },
    ],
  },
  jaipur: {
    region: 'Rajasthan / Jaipur',
    spots: [
      { name: 'Johari Bazaar',        type: 'bazaar', area: 'Old City',      description: 'Heritage jewellers\u2019 lane — kundan, meenakari, lac bangles.', knownFor: ['Kundan jewellery', 'Lac bangles', 'Gemstones'], priceRange: 'mid' },
      { name: 'Bapu Bazaar',          type: 'bazaar', area: 'Pink City',     description: 'Iconic strip for Rajasthani textiles, mojaris and block prints.', knownFor: ['Block-print fabric', 'Mojari shoes', 'Rajasthani razai'], priceRange: 'budget' },
      { name: 'Tripolia Bazaar',      type: 'bazaar', area: 'Old City',      description: 'Brass, lacquer bangles, ironmongery — best for souvenirs.', knownFor: ['Brassware', 'Lac bangles', 'Iron handicrafts'], priceRange: 'budget' },
      { name: 'Anokhi',               type: 'boutique', area: 'C-Scheme',    description: 'Premium block-print label that put hand-printed cotton on the world stage.', knownFor: ['Block-print kurtas', 'Quilts', 'Home linen'], priceRange: 'luxury' },
      { name: 'Rajasthali Emporium',  type: 'craft',  area: 'MI Road',       description: 'Government emporium — vetted prices on every Rajasthani craft.', knownFor: ['Carpets', 'Blue pottery', 'Miniature paintings'], priceRange: 'mid' },
      { name: 'World Trade Park',     type: 'mall',   area: 'Malviya Nagar', description: 'Modern luxury mall — Zara, Westside, gaming arcade.', knownFor: ['Zara', 'Lifestyle', 'Cinema'], priceRange: 'mid' },
    ],
  },
  goa: {
    region: 'Goa',
    spots: [
      { name: 'Anjuna Flea Market',   type: 'market', area: 'Anjuna',        description: 'Wednesday hippie flea — boho dresses, drums, Tibetan jewellery.', knownFor: ['Boho dresses', 'Hippie jewellery', 'Tibetan crafts'], priceRange: 'budget' },
      { name: 'Mapusa Friday Market', type: 'market', area: 'Mapusa',        description: 'Local Friday bazaar — Goan chouriço, feni, pickles, spices.', knownFor: ['Goan chouriço', 'Feni', 'Spices'], priceRange: 'budget' },
      { name: 'Saturday Night Market',type: 'market', area: 'Arpora',        description: 'Largest weekend night-market — live music, stalls, food trucks.', knownFor: ['Beachwear', 'Crafts', 'Live music'], priceRange: 'mid' },
      { name: 'Calangute Market Square', type: 'street', area: 'Calangute', description: 'Tourist-friendly strip for sarongs, swimwear and souvenirs.', knownFor: ['Sarongs', 'Swimwear', 'Souvenirs'], priceRange: 'budget' },
      { name: 'Panjim Latin Quarter', type: 'boutique', area: 'Fontainhas',  description: 'Portuguese-era lanes with quirky boutiques and Goan ceramics.', knownFor: ['Azulejo tiles', 'Goan pottery', 'Indie boutiques'], priceRange: 'mid' },
    ],
  },
  kolkata: {
    region: 'Kolkata',
    spots: [
      { name: 'New Market',           type: 'bazaar', area: 'Esplanade',     description: 'Sprawling 19th-century market — sarees, leather, sweets, plum cake.', knownFor: ['Sarees', 'Nahoum\u2019s plum cake', 'Leather'], priceRange: 'budget' },
      { name: 'Gariahat Market',      type: 'street', area: 'Gariahat',      description: 'Saree central — taant, jamdani, dhakai cotton at honest prices.', knownFor: ['Bengali sarees', 'Cotton', 'Brassware'], priceRange: 'budget' },
      { name: 'Park Street',          type: 'street', area: 'Park Street',   description: 'Anglo-Indian colonial strip — bookshops, music stores, wine.', knownFor: ['Oxford Bookstore', 'Cafés', 'Imported chocolates'], priceRange: 'mid' },
      { name: 'College Street',       type: 'street', area: 'College Street', description: 'Asia\u2019s largest second-hand book bazaar.', knownFor: ['Second-hand books', 'Coffee House', 'Stationery'], priceRange: 'budget' },
      { name: 'South City Mall',      type: 'mall',   area: 'Prince Anwar Shah Rd', description: 'Family flagship mall — international brands, food court.', knownFor: ['Marks & Spencer', 'Hamleys', 'Big Bazaar'], priceRange: 'mid' },
    ],
  },
  chennai: {
    region: 'Chennai',
    spots: [
      { name: 'T Nagar (Pondy Bazaar)', type: 'bazaar', area: 'T Nagar',     description: 'India\u2019s busiest shopping district — Kanchipuram silks, gold, electronics.', knownFor: ['Kanchipuram silk', 'Gold', 'Saravana Stores'], priceRange: 'mid' },
      { name: 'Express Avenue',       type: 'mall',   area: 'Royapettah',    description: 'Premium central mall — international labels, fine dining.', knownFor: ['Marks & Spencer', 'Sephora', 'Cinema'], priceRange: 'luxury' },
      { name: 'Phoenix Marketcity',   type: 'mall',   area: 'Velachery',     description: 'Massive south-Chennai mall with everything mid-to-premium.', knownFor: ['Zara', 'Lifestyle', 'PVR'], priceRange: 'mid' },
      { name: 'Burma Bazaar',         type: 'bazaar', area: 'George Town',   description: 'Imported electronics, watches and chocolates from Myanmar.', knownFor: ['Imported electronics', 'Watches', 'Foreign chocolates'], priceRange: 'budget' },
      { name: 'Kalakshetra Foundation', type: 'craft', area: 'Thiruvanmiyur', description: 'Heritage Bharatanatyam campus shop — handloom, sarees, books.', knownFor: ['Kalamkari', 'Kanchipuram', 'Crafts'], priceRange: 'mid' },
    ],
  },
  hyderabad: {
    region: 'Hyderabad',
    spots: [
      { name: 'Laad Bazaar',          type: 'bazaar', area: 'Charminar',     description: 'Historic bangle bazaar wrapped around Charminar — lac & glass bangles.', knownFor: ['Lac bangles', 'Pearls', 'Bridal jewellery'], priceRange: 'budget' },
      { name: 'Jubilee Hills',        type: 'street', area: 'Jubilee Hills', description: 'Luxury & boutique strip with celebrity stylists and home stores.', knownFor: ['Designer boutiques', 'Home decor', 'Pearls'], priceRange: 'luxury' },
      { name: 'Hyderabad Pearls',     type: 'craft',  area: 'Begum Bazaar',  description: 'The pearl capital of India — generations-old pearl wholesalers.', knownFor: ['Pearls', 'Pearl strings', 'Hyderabadi sets'], priceRange: 'mid' },
      { name: 'Inorbit Mall',         type: 'mall',   area: 'Madhapur',      description: 'Hi-tech city mall — international labels & food court.', knownFor: ['Zara', 'Marks & Spencer', 'PVR'], priceRange: 'mid' },
      { name: 'GVK One',              type: 'mall',   area: 'Banjara Hills', description: 'Compact luxury mall in upscale Banjara Hills.', knownFor: ['Luxury labels', 'Cinepolis', 'Dining'], priceRange: 'luxury' },
    ],
  },
  pune: {
    region: 'Pune',
    spots: [
      { name: 'Laxmi Road',           type: 'bazaar', area: 'Sadashiv Peth', description: 'Maharashtrian saree bazaar — Paithani, Nauvari, traditional gold.', knownFor: ['Paithani sarees', 'Nauvari', 'Gold'], priceRange: 'mid' },
      { name: 'Tulsi Baug',           type: 'bazaar', area: 'Budhwar Peth',  description: 'Traditional copper, brass and devotional shopping district.', knownFor: ['Copperware', 'Brass utensils', 'Puja items'], priceRange: 'budget' },
      { name: 'Phoenix Marketcity',   type: 'mall',   area: 'Viman Nagar',   description: 'Pune\u2019s largest mall with international labels.', knownFor: ['Zara', 'H&M', 'Hamleys'], priceRange: 'mid' },
      { name: 'Koregaon Park',        type: 'street', area: 'Koregaon Park', description: 'Bohemian boutique strip near the Osho Ashram.', knownFor: ['Indie boutiques', 'Cafés', 'Yoga gear'], priceRange: 'mid' },
      { name: 'FC Road',              type: 'street', area: 'Fergusson College Rd', description: 'College-crowd shopping — affordable fashion, footwear, food.', knownFor: ['Trend tees', 'Footwear', 'Street food'], priceRange: 'budget' },
    ],
  },
  varanasi: {
    region: 'Uttar Pradesh / Varanasi',
    spots: [
      { name: 'Vishwanath Gali',      type: 'bazaar', area: 'Old City',      description: 'Maze of lanes near Kashi Vishwanath — silk, brass, beads, sweets.', knownFor: ['Banarasi silk', 'Rudraksh', 'Brassware'], priceRange: 'mid' },
      { name: 'Thatheri Bazaar',      type: 'bazaar', area: 'Thatheri Bazar', description: 'Brass and copperware market that\u2019s been alive for centuries.', knownFor: ['Brass lamps', 'Copper utensils', 'Bells'], priceRange: 'budget' },
      { name: 'Godowlia Market',      type: 'street', area: 'Godowlia',      description: 'Tourist-friendly strip near Dashashwamedh Ghat — silk, sarees, beads.', knownFor: ['Banarasi sarees', 'Religious items', 'Souvenirs'], priceRange: 'mid' },
      { name: 'Banaras Hindu University Crafts', type: 'craft', area: 'BHU', description: 'Student-run handlooms and traditional weaver collectives nearby.', knownFor: ['Handloom silk', 'Wooden toys', 'Books'], priceRange: 'mid' },
    ],
  },
  agra: {
    region: 'Uttar Pradesh / Agra',
    spots: [
      { name: 'Sadar Bazaar',         type: 'bazaar', area: 'Sadar',         description: 'Cantonment-era bazaar — leather, marble inlay, sweets.', knownFor: ['Leather shoes', 'Marble inlay', 'Petha'], priceRange: 'budget' },
      { name: 'Kinari Bazaar',        type: 'bazaar', area: 'Old City',      description: 'Wedding-shopping warren — zardozi, embroidery, lehengas.', knownFor: ['Zardozi work', 'Wedding lehengas', 'Trims'], priceRange: 'mid' },
      { name: 'Subhash Bazaar',       type: 'bazaar', area: 'Subhash Bazar', description: 'Best for genuine Mughal-era marble inlay (pietra dura) work.', knownFor: ['Marble inlay', 'Souvenirs', 'Handicrafts'], priceRange: 'mid' },
      { name: 'TDI Mall',             type: 'mall',   area: 'Sanjay Place',  description: 'Compact modern mall — handy for AC shopping after sightseeing.', knownFor: ['Big Bazaar', 'Pantaloons', 'Cinema'], priceRange: 'mid' },
    ],
  },
  udaipur: {
    region: 'Rajasthan / Udaipur',
    spots: [
      { name: 'Hathi Pol Bazaar',     type: 'bazaar', area: 'Old City',      description: 'Pichwai paintings, miniatures, jutis right by the City Palace gate.', knownFor: ['Pichwai art', 'Jutis', 'Miniatures'], priceRange: 'mid' },
      { name: 'Bada Bazaar',          type: 'bazaar', area: 'Hathi Pol',     description: 'Silver, brass and traditional Rajasthani textile heart of the city.', knownFor: ['Silver jewellery', 'Brass', 'Textiles'], priceRange: 'mid' },
      { name: 'Shilpgram',            type: 'craft',  area: 'Havala Village', description: 'Open-air rural craft village showcasing tribal art live.', knownFor: ['Tribal art', 'Pottery', 'Wood carving'], priceRange: 'mid' },
      { name: 'Sadhna Emporium',      type: 'craft',  area: 'Old City',      description: 'Women-led NGO emporium — block-printed cottons supporting artisans.', knownFor: ['Block prints', 'Patchwork', 'Cushion covers'], priceRange: 'mid' },
    ],
  },
  jaisalmer: {
    region: 'Rajasthan / Jaisalmer',
    spots: [
      { name: 'Sadar Bazaar',         type: 'bazaar', area: 'Old City',      description: 'Inside the golden fort — embroidery, mirror-work, camel-leather.', knownFor: ['Mirror-work', 'Camel leather', 'Patchwork'], priceRange: 'mid' },
      { name: 'Bhatia Bazaar',        type: 'bazaar', area: 'Old City',      description: 'Antique stones, silver and Rajasthani tribal jewellery.', knownFor: ['Silver jewellery', 'Antiques', 'Stones'], priceRange: 'mid' },
      { name: 'Manak Chowk',          type: 'bazaar', area: 'Manak Chowk',   description: 'Patola sarees, ralli quilts and pure Jaisalmer woollens.', knownFor: ['Patola', 'Ralli quilts', 'Wool shawls'], priceRange: 'mid' },
    ],
  },
  manali: {
    region: 'Himachal / Manali',
    spots: [
      { name: 'Mall Road',            type: 'street', area: 'Mall Road',     description: 'Cobbled hill-station strip — Kullu shawls, pashmina, woollens.', knownFor: ['Kullu shawls', 'Pashmina', 'Tibetan crafts'], priceRange: 'mid' },
      { name: 'Old Manali Market',    type: 'street', area: 'Old Manali',    description: 'Hippie strip — boho fits, dream-catchers, leather.', knownFor: ['Boho dresses', 'Leather bags', 'Hookah'], priceRange: 'budget' },
      { name: 'Tibetan Market',       type: 'craft',  area: 'NAC, Mall Road', description: 'Tibetan refugee traders\u2014 thangka paintings, prayer wheels, jewellery.', knownFor: ['Thangka', 'Prayer wheels', 'Turquoise jewellery'], priceRange: 'mid' },
      { name: 'Bhuttico Showroom',    type: 'boutique', area: 'Mall Road',   description: 'Cooperative known for genuine Kullu handloom shawls.', knownFor: ['Kullu shawls', 'Handloom', 'Caps'], priceRange: 'mid' },
    ],
  },
  shimla: {
    region: 'Himachal / Shimla',
    spots: [
      { name: 'The Mall',             type: 'street', area: 'Mall Road',     description: 'British-era pedestrian mall — wood carvings, woollens, books.', knownFor: ['Pashmina', 'Woollen caps', 'Books'], priceRange: 'mid' },
      { name: 'Lakkar Bazaar',        type: 'bazaar', area: 'Lakkar Bazaar', description: 'Wooden handicrafts, walking sticks, snowflake souvenirs.', knownFor: ['Wood carving', 'Walking sticks', 'Caps'], priceRange: 'budget' },
      { name: 'Lower Bazaar',         type: 'bazaar', area: 'Lower Bazaar',  description: 'Local-priced lane below the Mall — apples, pickles, spices.', knownFor: ['Himachali pickles', 'Apples', 'Honey'], priceRange: 'budget' },
      { name: 'Tibetan Market',       type: 'craft',  area: 'The Ridge',     description: 'Tibetan refugee stalls — singing bowls, prayer flags, silver.', knownFor: ['Prayer flags', 'Singing bowls', 'Turquoise'], priceRange: 'mid' },
    ],
  },
  darjeeling: {
    region: 'West Bengal / Darjeeling',
    spots: [
      { name: 'Chowk Bazaar',         type: 'bazaar', area: 'Chowk Bazaar',  description: 'Locals\u2019 market — orthodox black tea, woollens, momos.', knownFor: ['Darjeeling tea', 'Yak wool shawls', 'Momos'], priceRange: 'budget' },
      { name: 'Mall Road',            type: 'street', area: 'Chowrasta',     description: 'Iconic ridge promenade — woollens, books, tea-rooms.', knownFor: ['Books', 'Wool sweaters', 'Tea'], priceRange: 'mid' },
      { name: 'Nathmulls Tea',        type: 'boutique', area: 'Laden La Rd', description: 'The most respected single-estate tea boutique in town.', knownFor: ['First flush', 'Second flush', 'Estate teas'], priceRange: 'luxury' },
      { name: 'Tibetan Refugee Self-Help Centre', type: 'craft', area: 'Lebong', description: 'Hand-loomed carpets and silver from a 1950s Tibetan settlement.', knownFor: ['Tibetan carpets', 'Silver', 'Wood-block prints'], priceRange: 'mid' },
    ],
  },
  kochi: {
    region: 'Kerala / Kochi',
    spots: [
      { name: 'Jew Town',             type: 'bazaar', area: 'Mattancherry',  description: 'Heritage spice & antique street that ends at the Paradesi Synagogue.', knownFor: ['Antiques', 'Cardamom & cloves', 'Brassware'], priceRange: 'mid' },
      { name: 'Broadway Market',      type: 'street', area: 'Ernakulam',     description: 'Fast-paced city bazaar — sarees, gold, spices, banana chips.', knownFor: ['Kerala sarees', 'Banana chips', 'Spices'], priceRange: 'budget' },
      { name: 'LuLu Mall',            type: 'mall',   area: 'Edappally',     description: 'India\u2019s biggest mall — international labels and a hyper-market.', knownFor: ['LuLu Hypermarket', 'Marks & Spencer', 'PVR'], priceRange: 'mid' },
      { name: 'Cherai Beach Market',  type: 'street', area: 'Cherai',        description: 'Beachside stalls for coconut crafts, conch shells, sarongs.', knownFor: ['Conch shells', 'Sarongs', 'Coconut crafts'], priceRange: 'budget' },
    ],
  },
  amritsar: {
    region: 'Punjab / Amritsar',
    spots: [
      { name: 'Hall Bazaar',          type: 'bazaar', area: 'Town Hall',     description: 'Heart of city shopping — phulkari, jutties, parathas.', knownFor: ['Phulkari', 'Jutties', 'Punjabi suits'], priceRange: 'mid' },
      { name: 'Katra Jaimal Singh',   type: 'bazaar', area: 'Katra Jaimal',  description: 'Heritage saree & wedding-wear lane near the Golden Temple.', knownFor: ['Wedding suits', 'Sarees', 'Gold'], priceRange: 'mid' },
      { name: 'Guru Bazaar',          type: 'bazaar', area: 'Old City',      description: 'Punjab\u2019s biggest gold & jewellery market — wholesale prices.', knownFor: ['Gold jewellery', 'Bangles', 'Kundan'], priceRange: 'luxury' },
      { name: 'Lawrence Road',        type: 'street', area: 'Lawrence Road', description: 'Modern fashion strip — branded outlets and patisseries.', knownFor: ['Punjabi shoes', 'Brand outlets', 'Sweets'], priceRange: 'mid' },
    ],
  },
  rishikesh: {
    region: 'Uttarakhand / Rishikesh',
    spots: [
      { name: 'Laxman Jhula Market',  type: 'street', area: 'Laxman Jhula',  description: 'Backpacker strip across the river — yoga gear, rudraksh, crystals.', knownFor: ['Yoga gear', 'Rudraksh malas', 'Crystals'], priceRange: 'budget' },
      { name: 'Ram Jhula Market',     type: 'street', area: 'Ram Jhula',     description: 'Spiritual & ayurveda shopping — books, malas, naturals.', knownFor: ['Ayurveda oils', 'Spiritual books', 'Tea'], priceRange: 'budget' },
      { name: 'Triveni Ghat Market',  type: 'street', area: 'Triveni Ghat',  description: 'Aarti-side stalls — incense, brass diyas, religious cassettes.', knownFor: ['Incense', 'Diyas', 'Devotional CDs'], priceRange: 'budget' },
    ],
  },
  pushkar: {
    region: 'Rajasthan / Pushkar',
    spots: [
      { name: 'Sadar Bazaar',         type: 'bazaar', area: 'Old City',      description: 'Bohemian strip near Pushkar Lake — gypsy fashion, silver, leather.', knownFor: ['Gypsy dresses', 'Silver jewellery', 'Tribal'], priceRange: 'budget' },
      { name: 'Brahma Mandir Lane',   type: 'bazaar', area: 'Brahma Temple', description: 'Devotional & souvenir lane — rudraksh, brass, miniature paintings.', knownFor: ['Rudraksh', 'Miniatures', 'Religious items'], priceRange: 'budget' },
    ],
  },
  jodhpur: {
    region: 'Rajasthan / Jodhpur',
    spots: [
      { name: 'Sardar Market',        type: 'bazaar', area: 'Clock Tower',   description: 'Iconic clock-tower bazaar — bandhani, leather mojaris, spices.', knownFor: ['Bandhani', 'Mojari', 'Mathania chillies'], priceRange: 'mid' },
      { name: 'Nai Sarak',            type: 'bazaar', area: 'Nai Sarak',     description: 'Saree & textile street with old-school Marwari shops.', knownFor: ['Sarees', 'Suits', 'Bedsheets'], priceRange: 'mid' },
      { name: 'Mochi Bazaar',         type: 'bazaar', area: 'Mochi Bazaar',  description: 'Cobblers\u2019 lane for traditional Jodhpuri jutis & leather.', knownFor: ['Mojari', 'Leather bags', 'Belts'], priceRange: 'budget' },
    ],
  },
  mysore: {
    region: 'Karnataka / Mysuru',
    spots: [
      { name: 'Devaraja Market',      type: 'bazaar', area: 'Devaraja',      description: 'Heritage colonial market — flowers, sandalwood oil, agarbatti.', knownFor: ['Sandalwood oil', 'Agarbatti', 'Flowers'], priceRange: 'budget' },
      { name: 'Cauvery Emporium',     type: 'craft',  area: 'Sayyaji Rao Rd', description: 'Karnataka government emporium for genuine Mysore silk.', knownFor: ['Mysore silk', 'Sandalwood', 'Bidri'], priceRange: 'mid' },
      { name: 'Sayyaji Rao Road',     type: 'street', area: 'City Centre',   description: 'Long shopping spine — silk, jewellery, sweets, juices.', knownFor: ['Mysore silk', 'Mysore Pak', 'Gold'], priceRange: 'mid' },
    ],
  },
  ahmedabad: {
    region: 'Gujarat / Ahmedabad',
    spots: [
      { name: 'Law Garden Market',    type: 'street', area: 'Law Garden',    description: 'Evening street market — Gujarati mirror-work, chaniya cholis.', knownFor: ['Mirror-work', 'Chaniya choli', 'Mojari'], priceRange: 'mid' },
      { name: 'Manek Chowk',          type: 'bazaar', area: 'Old City',      description: 'Day-time gold + spice bazaar that turns into a food street at night.', knownFor: ['Gold jewellery', 'Spices', 'Street food'], priceRange: 'mid' },
      { name: 'Rani no Hajiro',       type: 'bazaar', area: 'Old City',      description: 'Bandhani heaven — generations of Khatri family weavers.', knownFor: ['Bandhani', 'Patola', 'Block-print'], priceRange: 'mid' },
      { name: 'Calico Museum Shop',   type: 'craft',  area: 'Shahibaug',     description: 'Curated heritage textiles next to the famous Calico Museum.', knownFor: ['Block-print', 'Gujarati embroidery', 'Books'], priceRange: 'luxury' },
    ],
  },
  lucknow: {
    region: 'Uttar Pradesh / Lucknow',
    spots: [
      { name: 'Aminabad',             type: 'bazaar', area: 'Aminabad',      description: 'Heritage Mughal-era bazaar for chikankari, ittar, kebabs.', knownFor: ['Chikankari kurtis', 'Ittar', 'Kebab spots'], priceRange: 'mid' },
      { name: 'Hazratganj',           type: 'street', area: 'Hazratganj',    description: 'Colonial-era pedestrian boulevard — modern + traditional mix.', knownFor: ['Chikan boutiques', 'Books', 'Cafes'], priceRange: 'mid' },
      { name: 'Chowk',                type: 'bazaar', area: 'Old City',      description: 'Ittar & zardozi heart — perfumers since the Nawabi era.', knownFor: ['Ittar (oud, rose)', 'Zardozi work', 'Sweets'], priceRange: 'mid' },
    ],
  },
}

/* ────────────────────────────────────────────────────────────────── *
 * 2. Helpers — keying, links, generic fallbacks                       *
 * ────────────────────────────────────────────────────────────────── */

function normaliseKey(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim()
}

function pickCurated(place) {
  const key = normaliseKey(place)
  if (!key) return null
  // Exact match first.
  if (CURATED[key]) return { key, ...CURATED[key] }
  // Then "ends with / contains" so "new delhi" finds "delhi", "south goa" → "goa".
  for (const k of Object.keys(CURATED)) {
    if (key.includes(k) || k.includes(key)) return { key: k, ...CURATED[k] }
  }
  return null
}

/** Build the click-through URL set for a single shopping spot. */
function buildLinks(name, place) {
  const q = encodeURIComponent(`${name} ${place}`.trim())
  return {
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${q}`,
    googleSearch: `https://www.google.com/search?q=${q}`,
    osm: `https://www.openstreetmap.org/search?query=${q}`,
  }
}

/** Build provider-level "search all shopping in {place}" URLs. */
function buildPlaceLinks(place) {
  const q = encodeURIComponent(`shopping in ${place}`)
  const m = encodeURIComponent(`shopping markets ${place}`)
  return {
    googleMaps:  `https://www.google.com/maps/search/?api=1&query=${m}`,
    googleSearch:`https://www.google.com/search?q=${q}`,
    osm:         `https://www.openstreetmap.org/search?query=${m}`,
  }
}

/**
 * Generic fallbacks for places we haven't curated. Always renders a
 * useful list because the click-through is just a Google Maps search.
 */
function genericSpots(place) {
  return [
    { name: `Main Market`,             type: 'market', area: `${place} city centre`, description: `Central market lane in ${place} for daily essentials, textiles and souvenirs.`,                       knownFor: ['Local fashion', 'Daily essentials', 'Spices'], priceRange: 'budget' },
    { name: `Local Bazaar`,            type: 'bazaar', area: `Old ${place}`,         description: `The traditional bazaar of ${place} — best for handicrafts, fabrics and street food.`,                  knownFor: ['Handicrafts', 'Spices', 'Souvenirs'], priceRange: 'budget' },
    { name: `Modern Shopping Mall`,    type: 'mall',   area: `New ${place}`,         description: `An air-conditioned mall in ${place} for international labels and a quick lunch.`,                       knownFor: ['Branded fashion', 'Food court', 'Cinema'],     priceRange: 'mid' },
    { name: `Handicraft & Craft Shop`, type: 'craft',  area: place,                  description: `Pick up regional handicrafts, paintings and traditional textiles unique to the ${place} region.`,        knownFor: ['Paintings', 'Textiles', 'Handicrafts'],         priceRange: 'mid' },
    { name: `Boutique Street`,         type: 'street', area: place,                  description: `Walk the boutique strip near the city centre for indie designers and concept stores.`,                  knownFor: ['Indie boutiques', 'Cafés', 'Lifestyle'],        priceRange: 'mid' },
  ]
}

/* ────────────────────────────────────────────────────────────────── *
 * 3. Optional live enrichment via OpenStreetMap Overpass              *
 * ────────────────────────────────────────────────────────────────── */

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter'
const OVERPASS_TIMEOUT_MS = 6000

async function geocodeNominatim(place) {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')
    url.searchParams.set('q', `${place}, India`)
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 4000)
    const res = await fetch(url, {
      headers: { 'User-Agent': 'JourneyMate/1.0 (shopping-suggester)' },
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (!res.ok) return null
    const json = await res.json()
    const hit = Array.isArray(json) && json[0]
    if (!hit?.lat || !hit?.lon) return null
    return { lat: Number(hit.lat), lon: Number(hit.lon), display: hit.display_name }
  } catch {
    return null
  }
}

function osmTypeToShoppingType(tags) {
  const t = tags || {}
  if (t.amenity === 'marketplace') return 'market'
  if (t.shop === 'mall') return 'mall'
  if (t.shop === 'department_store') return 'mall'
  if (t.shop === 'supermarket') return 'mall'
  if (t.shop === 'craft' || t.shop === 'art' || t.shop === 'antiques') return 'craft'
  if (t.shop === 'clothes' || t.shop === 'boutique') return 'boutique'
  if (t.tourism === 'gallery') return 'craft'
  return 'street'
}

/**
 * Best-effort: query Overpass for shopping POIs near the place. Returns
 * `[]` on any error — the caller falls through to curated/generic.
 */
async function fetchOverpassNearby(place) {
  const geo = await geocodeNominatim(place)
  if (!geo) return []
  const radius = 5000 // 5 km
  const q = `[out:json][timeout:5];
(
  node(around:${radius},${geo.lat},${geo.lon})["amenity"="marketplace"];
  node(around:${radius},${geo.lat},${geo.lon})["shop"="mall"];
  node(around:${radius},${geo.lat},${geo.lon})["shop"="department_store"];
  node(around:${radius},${geo.lat},${geo.lon})["shop"="craft"];
  node(around:${radius},${geo.lat},${geo.lon})["shop"="art"];
  node(around:${radius},${geo.lat},${geo.lon})["shop"="antiques"];
  way (around:${radius},${geo.lat},${geo.lon})["amenity"="marketplace"];
  way (around:${radius},${geo.lat},${geo.lon})["shop"="mall"];
  way (around:${radius},${geo.lat},${geo.lon})["shop"="department_store"];
);
out tags center 30;`
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), OVERPASS_TIMEOUT_MS)
    const res = await fetch(OVERPASS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(q),
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (!res.ok) return []
    const json = await res.json()
    const els = Array.isArray(json?.elements) ? json.elements : []
    return els
      .map((el) => {
        const tags = el.tags || {}
        const name = tags.name || tags['name:en']
        if (!name) return null
        const type = osmTypeToShoppingType(tags)
        const desc = tags.description || tags['note'] || ''
        return {
          name,
          type,
          area: tags['addr:suburb'] || tags['addr:city'] || place,
          description: desc || `Listed shopping spot in ${place} via OpenStreetMap.`,
          knownFor: [],
          priceRange: type === 'mall' ? 'mid' : 'budget',
          source: 'osm',
        }
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

/* ────────────────────────────────────────────────────────────────── *
 * 4. In-memory cache                                                  *
 * ────────────────────────────────────────────────────────────────── */

const cache = new Map() // key → { at: number, body: object }
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

function cacheGet(key) {
  const hit = cache.get(key)
  if (!hit) return null
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return hit.body
}
function cacheSet(key, body) {
  cache.set(key, { at: Date.now(), body })
  // Soft-cap the cache so we don't leak in long-running processes.
  if (cache.size > 256) {
    const firstKey = cache.keys().next().value
    if (firstKey) cache.delete(firstKey)
  }
}

/* ────────────────────────────────────────────────────────────────── *
 * 5. Public API                                                       *
 * ────────────────────────────────────────────────────────────────── */

function dedupeSpots(spots) {
  const seen = new Set()
  const out = []
  for (const s of spots || []) {
    if (!s?.name) continue
    const k = normaliseKey(s.name)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(s)
  }
  return out
}

function decorateSpot(spot, place) {
  return {
    ...spot,
    knownFor: Array.isArray(spot.knownFor) ? spot.knownFor.slice(0, 6) : [],
    links: buildLinks(spot.name, place),
  }
}

/**
 * Get shopping suggestions for a destination.
 *
 * Returns shape:
 *   {
 *     place: 'Jaipur',
 *     region: 'Rajasthan / Jaipur',
 *     summary: '6 places to shop in Jaipur — bazaars, malls and boutiques.',
 *     spots: [{ name, type, area, description, knownFor, priceRange, links }],
 *     links: { googleMaps, googleSearch, osm },
 *     source: 'curated' | 'curated+osm' | 'osm' | 'generic',
 *   }
 */
async function getShoppingForPlace({ place }) {
  const placeStr = String(place || '').trim()
  if (!placeStr) {
    return {
      place: '',
      summary: 'Pick a destination first.',
      spots: [],
      links: { googleMaps: '', googleSearch: '', osm: '' },
      source: 'empty',
    }
  }

  const cacheKey = normaliseKey(placeStr)
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  const curated = pickCurated(placeStr)
  let osmSpots = []
  // For curated places we already have the best stuff — skip the slow
  // Overpass call. For uncurated places we go live to get something useful.
  if (!curated) {
    try {
      osmSpots = await fetchOverpassNearby(placeStr)
    } catch {
      osmSpots = []
    }
  }

  let merged = dedupeSpots([
    ...(curated?.spots || []),
    ...osmSpots,
  ])

  let source = 'curated'
  if (curated && osmSpots.length) source = 'curated+osm'
  else if (!curated && osmSpots.length) source = 'osm'

  if (merged.length === 0) {
    merged = genericSpots(placeStr)
    source = 'generic'
  }

  // Cap to 8 — visually clean and fast to render.
  merged = merged.slice(0, 8).map((s) => decorateSpot(s, placeStr))

  const summary = (() => {
    const types = new Set(merged.map((s) => s.type))
    const parts = []
    if (types.has('bazaar') || types.has('market')) parts.push('bazaars')
    if (types.has('mall')) parts.push('malls')
    if (types.has('street')) parts.push('streets')
    if (types.has('craft')) parts.push('craft hubs')
    if (types.has('boutique')) parts.push('boutiques')
    const joined = parts.length ? parts.join(', ') : 'places'
    return `${merged.length} place${merged.length === 1 ? '' : 's'} to shop in ${placeStr} — ${joined}.`
  })()

  const body = {
    place: placeStr,
    region: curated?.region || null,
    summary,
    spots: merged,
    links: buildPlaceLinks(placeStr),
    source,
  }

  cacheSet(cacheKey, body)
  return body
}

module.exports = { getShoppingForPlace }
