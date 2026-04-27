'use strict'

const bcrypt = require('bcrypt')
const { pool } = require('../config/db')
const logger = require('../lib/logger')
const { rowsForInsert } = require('../data/indian-cities')
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
    await pool.query(
      `
      INSERT INTO blog_posts (
        slug, title, excerpt, body, category, read_time_mins, author, emoji, tags, is_featured, is_published, published_at, updated_at
      ) VALUES ($1, $2, $3, NULL, $4, $5, $6, $7, $8::text[], $9, true, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        excerpt = EXCLUDED.excerpt,
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

async function runAll() {
  await migrate()
  await seedUsers()
  await seedCities()
  await seedBlog()
}

module.exports = { seedUsers, seedCities, seedBlog, runAll }

if (require.main === module) {
  runAll()
    .then(async () => { logger.info('seed complete'); await pool.end(); process.exit(0) })
    .catch(async (e) => { logger.error({ msg: 'seed failed', err: e.message }); try { await pool.end() } catch {} ; process.exit(1) })
}
