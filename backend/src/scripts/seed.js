'use strict'

const bcrypt = require('bcrypt')
const { pool } = require('../config/db')
const logger = require('../lib/logger')
const { rowsForInsert } = require('../data/indian-cities')
const { BLOG_ARTICLE_BODIES } = require('../data/blog-articles')
const { migrate } = require('./migrate')

const DEMO_USERS = [
  { email: 'demo@journeymate.app',   password: 'demo123',  name: 'Demo Traveler' },
  { email: 'traveler@example.com',   password: 'password', name: 'Priya Sharma' },
]

async function seedUsers() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM users')
  if (rows[0].n > 0) {
    logger.info({ msg: 'users already seeded', count: rows[0].n })
    return
  }
  logger.info('seeding demo users')
  for (const u of DEMO_USERS) {
    const hash = await bcrypt.hash(u.password, 10)
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      [u.email.toLowerCase(), hash, u.name]
    )
  }
}

async function seedCities() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM cities')
  const target = rowsForInsert()
  if (rows[0].n >= target.length) {
    logger.info({ msg: 'cities already seeded', count: rows[0].n })
    return
  }

  logger.info({ msg: 'seeding cities', count: target.length })
  const BATCH = 100
  for (let i = 0; i < target.length; i += BATCH) {
    const chunk = target.slice(i, i + BATCH)
    const values = []
    const params = []
    chunk.forEach((c, idx) => {
      const p = idx * 9
      params.push(
        c.name, c.slug, c.state, c.state_code, c.type,
        c.lat, c.lng, c.popularity, c.tags
      )
      values.push(`($${p+1},$${p+2},$${p+3},$${p+4},$${p+5},$${p+6},$${p+7},$${p+8},$${p+9}::text[])`)
    })
    await pool.query(
      `INSERT INTO cities (name, slug, state, state_code, type, lat, lng, popularity, tags)
       VALUES ${values.join(',')}
       ON CONFLICT (slug) DO UPDATE SET
         popularity = GREATEST(cities.popularity, EXCLUDED.popularity),
         tags = EXCLUDED.tags`,
      params
    )
  }
}

const BLOG_SEED = [
  {
    slug: 'varanasi-silver-gold-2026',
    title: 'Varanasi: What Silver and Gold Actually Buy You in 2026',
    excerpt:
      'We compared real budgets for boats, food, and stays near the ghats, then stress-tested a premium itinerary. Here is a practical way to pick your tier without FOMO.',
    category: 'Comparison',
    readTimeMins: 9,
    author: 'Harsh Vardhan Kumar',
    emoji: '🕉️',
    tags: ['Varanasi', 'Comparison', 'Budget'],
    isFeatured: true,
  },
  {
    slug: 'goa-budget-beyond-beaches',
    title: 'Goa on a Tight Budget: A Route That Is Not “Only Baga + Calangute”',
    excerpt:
      'If you want value, mix quiet hinterland pockets with one premium sunset evening. A simple plan that still feels like a real holiday — without endless taxi bills.',
    category: 'Destination',
    readTimeMins: 7,
    author: 'Harsh Vardhan Kumar',
    emoji: '🌴',
    tags: ['Goa', 'Itinerary', 'Value'],
    isFeatured: false,
  },
  {
    slug: 'manali-monsoon-safety',
    title: 'Manali in Monsoon: Safety, Savings, and the Best Time Windows',
    excerpt:
      'Landslide windows, flexible buffers, and how to read weather patterns before you book — especially if you are mixing bus + cab hops.',
    category: 'Guide',
    readTimeMins: 8,
    author: 'Harsh Vardhan Kumar',
    emoji: '🌧️',
    tags: ['Manali', 'Monsoon', 'Planning'],
    isFeatured: true,
  },
  {
    slug: 'vande-bharat-vs-3ac',
    title: 'Vande Bharat vs 3A vs Sleeper: A Practical India Train Choice Framework',
    excerpt:
      'Ticket price is only one variable. This framework helps you pick comfort, timing, and station logistics for the Indian rail reality.',
    category: 'Guide',
    readTimeMins: 10,
    author: 'Harsh Vardhan Kumar',
    emoji: '🚆',
    tags: ['Trains', 'Logistics', 'India'],
    isFeatured: false,
  },
  {
    slug: 'journey-mate-trip-comparison-philosophy',
    title: 'Why JourneyMate Compares Budget and Luxury the Way It Does',
    excerpt:
      'A product note: we optimize for “decision clarity” — not fantasy itineraries. This post explains the comparison lens we use in the app.',
    category: 'Lifestyle',
    readTimeMins: 5,
    author: 'Harsh Vardhan Kumar',
    emoji: '✨',
    tags: ['JourneyMate', 'Product', 'How we build'],
    isFeatured: false,
  },
  {
    slug: 'kerala-backwaters-without-tourist-trap-spend',
    title: 'Kerala Backwaters: A Clean Spend Plan (Without Overpaying for “Package Drama”)',
    excerpt:
      'A practical split between local stays, a curated boat slot, and food you will actually enjoy — with guardrails for hidden add-ons.',
    category: 'Luxury',
    readTimeMins: 8,
    author: 'Harsh Vardhan Kumar',
    emoji: '🛶',
    tags: ['Kerala', 'Value', 'Waterways'],
    isFeatured: false,
  },
  {
    slug: 'india-visa-checklist-2026',
    title: 'A Simple Pre-Trip Checklist for India Travel in 2026 (Apps + ID + Health)',
    excerpt:
      'Not glamorous — but the stuff that stops trips from going sideways. Keep it as a 10-minute pre-flight scan.',
    category: 'Guide',
    readTimeMins: 6,
    author: 'Harsh Vardhan Kumar',
    emoji: '🧾',
    tags: ['Checklist', 'Logistics', 'Pre-trip'],
    isFeatured: false,
  },
]

async function seedBlog() {
  logger.info({ msg: 'upserting blog posts', count: BLOG_SEED.length })
  for (const p of BLOG_SEED) {
    const body = (BLOG_ARTICLE_BODIES[p.slug] || '').trim() || null
    await pool.query(
      `
      INSERT INTO blog_posts (
        slug, title, excerpt, body, category, read_time_mins, author, emoji, tags, is_featured, is_published, published_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::text[], $10, true, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        excerpt = EXCLUDED.excerpt,
        body = EXCLUDED.body,
        category = EXCLUDED.category,
        read_time_mins = EXCLUDED.read_time_mins,
        author = EXCLUDED.author,
        emoji = EXCLUDED.emoji,
        tags = EXCLUDED.tags,
        is_featured = EXCLUDED.is_featured,
        is_published = true,
        updated_at = NOW()
    `,
      [
        p.slug,
        p.title,
        p.excerpt,
        body,
        p.category,
        p.readTimeMins,
        p.author,
        p.emoji,
        p.tags,
        p.isFeatured,
      ]
    )
  }
}

/**
 * Seed a handful of approved community travel stories so the public Blog
 * page never looks empty before real users contribute. Idempotent — only
 * runs when the table is empty.
 */
const COMMUNITY_EXPERIENCES_SEED = [
  {
    displayName: 'Aditi R.',
    title: 'A first-timer\'s sunrise on the Ganga',
    body:
      'I was nervous about Varanasi being overwhelming, and yes, the lanes are intense. But the moment we pushed off in the boat at 5:30 a.m. and the sky turned pink behind the ghats, every doubt evaporated. The boatman shared chai from a flask. We watched two men do their morning yoga on the steps. The whole city felt like it was breathing in slow motion.\n\nGo with someone you can be quiet with. Don\'t over-pack the day. Eat at Kashi Chaat Bhandar.',
    destination: 'Varanasi',
    visitMonths: 'October–February',
  },
  {
    displayName: 'Karthik S.',
    title: 'South Goa surprised me more than the north',
    body:
      'I\'d been to Goa twice before, both times to Baga and Calangute, both times left feeling like I\'d been to a slightly noisier version of any other beach town. Last December we drove south — Palolem, Patnem, Agonda. Different country.\n\nThe shacks close earlier (10 p.m.), the music is gentler, and you can actually hear the sea. Stay at Cuba Patnem if you can — clean rooms 200 metres from the water for ₹1,800.',
    destination: 'Goa',
    visitMonths: 'November–February',
  },
  {
    displayName: 'Meera V.',
    title: 'Kerala houseboat: yes, do the one night',
    body:
      'We dithered about whether the houseboat was worth it. It is — but only for the one night, not two. By morning of day two I was ready for solid ground and a real shower.\n\nWhat surprised me was how *quiet* the backwaters get after sunset. No wifi, no engine after dark, just the sound of water on the hull. Bring a book you\'ve actually been wanting to read.',
    destination: 'Alleppey',
    visitMonths: 'September–March',
  },
  {
    displayName: 'Rohan B.',
    title: 'Manali in late June was perfect',
    body:
      'Skipped peak July monsoon and went the last week of June. Atal Tunnel was open, Sissu was green and quiet, and prices were already dropping for off-season. Got a Vashisht stay with mountain view for ₹1,400/night that would\'ve been ₹3,000 in May.\n\nOne tip: keep a buffer day. We needed it on day three when fog closed Rohtang for half a day. Used it to do a riverside cafe walk in Old Manali instead.',
    destination: 'Manali',
    visitMonths: 'Late June, early September',
  },
  {
    displayName: 'Sneha P.',
    title: 'Hampi blew me away — and almost no one was there',
    body:
      'Visited Hampi in late January on a long weekend. Felt like having a UNESCO site to myself — just goats, boulders, and 600-year-old temples in golden light.\n\nStayed across the river at Mowgli Riverside (₹1,200/night), rented a cycle, and lost a whole day at Hippie Island. Best ₹4,500 I\'ve spent on a weekend.',
    destination: 'Hampi',
    visitMonths: 'November–February',
  },
  {
    displayName: 'Yash D.',
    title: 'Vande Bharat from Hyderabad to Bangalore is the move',
    body:
      'Took the Hyderabad–Bangalore Vande Bharat last month for ₹1,750. 8 hours, station to station, with onboard food and decent legroom. Compared to a 1.5h flight (after airport time, security, traffic) it ended up costing my day about the same — and I worked from the seat.\n\nIf you\'re between two big cities and the train option is a Vande Bharat or Tejas, take it. The flight is a different mode of stress.',
    destination: 'Hyderabad → Bangalore',
    visitMonths: 'Year-round',
  },
]

async function seedExperiences() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM blog_experiences')
  if (rows[0].n > 0) {
    logger.info({ msg: 'community experiences already present', count: rows[0].n })
    return
  }
  logger.info({
    msg: 'seeding community experiences',
    count: COMMUNITY_EXPERIENCES_SEED.length,
  })
  // Stagger created_at backwards so the list looks lived-in (newest first).
  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000
  for (let i = 0; i < COMMUNITY_EXPERIENCES_SEED.length; i += 1) {
    const e = COMMUNITY_EXPERIENCES_SEED[i]
    const created = new Date(now - (i + 1) * oneDayMs * 6)
    await pool.query(
      `
      INSERT INTO blog_experiences
        (display_name, title, body, destination, visit_months, is_approved, created_at)
      VALUES ($1, $2, $3, $4, $5, true, $6)
    `,
      [e.displayName, e.title, e.body, e.destination, e.visitMonths, created]
    )
  }
}

/**
 * Upsert the curated street-food catalog defined in trip.data.js into Postgres.
 * Idempotent — safe to re-run on every boot. Edits to the JS map flow into
 * the DB on next start because we UPSERT on (city_slug, name).
 */
async function seedStreetFood() {
  const { DESTINATION_STREET_FOOD, buildMapsUrl, safeAffiliateUrl } = require('../modules/trips/trip.data')

  let upserted = 0
  let cities = 0
  for (const [citySlug, items] of Object.entries(DESTINATION_STREET_FOOD || {})) {
    if (!Array.isArray(items) || items.length === 0) continue
    cities += 1
    for (let i = 0; i < items.length; i += 1) {
      const it = items[i] || {}
      const tier = it.tier === 'fine' ? 'fine' : 'street'
      const cityLabel = citySlug === 'default' ? '' : citySlug
      const mapsUrl = it.mapsUrl || buildMapsUrl(it.where, cityLabel)
      const affiliateUrl = safeAffiliateUrl(it.affiliateUrl)

      await pool.query(
        `
        INSERT INTO street_food_items
          (city_slug, name, emoji, description, where_to_eat, tier,
           maps_url, affiliate_url, affiliate_partner, position, is_published, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW())
        ON CONFLICT (city_slug, name) DO UPDATE SET
          emoji             = EXCLUDED.emoji,
          description       = EXCLUDED.description,
          where_to_eat      = EXCLUDED.where_to_eat,
          tier              = EXCLUDED.tier,
          maps_url          = EXCLUDED.maps_url,
          affiliate_url     = EXCLUDED.affiliate_url,
          affiliate_partner = EXCLUDED.affiliate_partner,
          position          = EXCLUDED.position,
          is_published      = true,
          updated_at        = NOW()
        `,
        [
          citySlug,
          it.name,
          it.emoji || null,
          it.description || null,
          it.where || null,
          tier,
          mapsUrl,
          affiliateUrl,
          it.affiliatePartner || null,
          i,
        ]
      )
      upserted += 1
    }
  }
  logger.info({ msg: 'street food seeded', cities, items: upserted })
}

async function runAll() {
  await migrate()
  await seedUsers()
  await seedCities()
  await seedBlog()
  await seedExperiences()
  await seedStreetFood()
}

module.exports = {
  seedUsers,
  seedCities,
  seedBlog,
  seedExperiences,
  seedStreetFood,
  runAll,
}
  await seedStreetFood()
}

module.exports = { seedUsers, seedCities, seedBlog, seedStreetFood, runAll }

if (require.main === module) {
  runAll()
    .then(async () => { logger.info('seed complete'); await pool.end(); process.exit(0) })
    .catch(async (e) => { logger.error({ msg: 'seed failed', err: e.message }); try { await pool.end() } catch {} ; process.exit(1) })
}
