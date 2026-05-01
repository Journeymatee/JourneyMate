'use strict'

/**
 * Admin Agent — read-only DB tools.
 *
 * Each tool:
 *   - has a `definition` (OpenAI tool/function-calling JSON schema), and
 *   - has a `run(args)` function that returns plain JSON.
 *
 * SAFETY: every tool is read-only. Inputs are validated and parameterized
 * so the LLM cannot inject SQL. NEVER add a write tool here without a
 * confirmation flow.
 */

const { pool } = require('../../config/db')
const {
  streetFoodIndex,
  getDestinationStreetFood,
} = require('../trips/trip.data')

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function clampInt(v, min, max, fallback) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(n)))
}

/** Allowed time windows mapped to a Postgres interval string. */
const SINCE_MAP = {
  today: '1 day',
  '24h': '1 day',
  '1d': '1 day',
  '7d': '7 days',
  week: '7 days',
  '30d': '30 days',
  month: '30 days',
  '90d': '90 days',
  quarter: '90 days',
  '1y': '365 days',
  year: '365 days',
  all: null,
}
function sinceClause(since, column = 'created_at') {
  if (!since || since === 'all') return { sql: '', params: [] }
  const interval = SINCE_MAP[String(since).toLowerCase()]
  if (!interval) return { sql: '', params: [] }
  return { sql: `${column} >= NOW() - INTERVAL '${interval}'`, params: [] }
}

function maskEmail(email) {
  if (!email) return ''
  const [name, domain] = String(email).split('@')
  if (!domain) return email
  const safeName =
    name.length <= 2 ? name[0] + '*' : `${name.slice(0, 2)}${'*'.repeat(Math.max(1, name.length - 3))}${name.slice(-1)}`
  return `${safeName}@${domain}`
}

/* ------------------------------------------------------------------ */
/*  Tools                                                              */
/* ------------------------------------------------------------------ */

const tools = {
  /* ---------- Users ---------- */
  count_users: {
    definition: {
      type: 'function',
      function: {
        name: 'count_users',
        description:
          'Total registered users, plus a count of new signups inside an optional time window.',
        parameters: {
          type: 'object',
          properties: {
            since: {
              type: 'string',
              enum: ['today', '24h', '7d', '30d', '90d', '1y', 'all'],
              description: 'Restrict the new-signups count to this window. Defaults to "all".',
            },
          },
        },
      },
    },
    async run(args = {}) {
      const since = args.since || 'all'
      const totalQ = `SELECT COUNT(*)::int AS total FROM users`
      const total = (await pool.query(totalQ)).rows[0]?.total || 0

      let recent = total
      const sinceFilter = sinceClause(since, 'created_at')
      if (sinceFilter.sql) {
        const recentQ = `SELECT COUNT(*)::int AS c FROM users WHERE ${sinceFilter.sql}`
        recent = (await pool.query(recentQ)).rows[0]?.c || 0
      }

      const byProviderQ = `SELECT provider, COUNT(*)::int AS c FROM users GROUP BY provider`
      const byProvider = (await pool.query(byProviderQ)).rows

      return { total, since, newSignupsInWindow: recent, byProvider }
    },
  },

  recent_users: {
    definition: {
      type: 'function',
      function: {
        name: 'recent_users',
        description:
          'List the most recently registered users (newest first). Emails are partially masked.',
        parameters: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
        },
      },
    },
    async run(args = {}) {
      const limit = clampInt(args.limit, 1, 50, 10)
      const q = `
        SELECT id, email, full_name, provider, created_at
        FROM users
        ORDER BY id DESC
        LIMIT $1
      `
      const { rows } = await pool.query(q, [limit])
      return {
        count: rows.length,
        users: rows.map((u) => ({
          id: u.id,
          email: maskEmail(u.email),
          name: u.full_name,
          provider: u.provider,
          createdAt: u.created_at,
        })),
      }
    },
  },

  user_signups_by_day: {
    definition: {
      type: 'function',
      function: {
        name: 'user_signups_by_day',
        description: 'Daily signup counts for charting (last N days).',
        parameters: {
          type: 'object',
          properties: {
            days: { type: 'integer', minimum: 1, maximum: 90, default: 14 },
          },
        },
      },
    },
    async run(args = {}) {
      const days = clampInt(args.days, 1, 90, 14)
      const q = `
        SELECT DATE_TRUNC('day', created_at)::date AS day, COUNT(*)::int AS c
        FROM users
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY 1
        ORDER BY 1 ASC
      `
      const { rows } = await pool.query(q)
      return { days, series: rows.map((r) => ({ day: r.day, signups: r.c })) }
    },
  },

  user_lookup: {
    definition: {
      type: 'function',
      function: {
        name: 'user_lookup',
        description:
          'Find one user by email or numeric id. Returns profile, total bookings, total spend, and last 3 bookings.',
        parameters: {
          type: 'object',
          properties: {
            emailOrId: { type: 'string', minLength: 1, maxLength: 255 },
          },
          required: ['emailOrId'],
        },
      },
    },
    async run(args = {}) {
      const raw = String(args.emailOrId || '').trim()
      if (!raw) return { error: 'emailOrId is required' }

      let user
      if (/^\d+$/.test(raw)) {
        const r = await pool.query('SELECT * FROM users WHERE id = $1', [Number(raw)])
        user = r.rows[0]
      } else {
        const r = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [raw])
        user = r.rows[0]
      }
      if (!user) return { found: false }

      const summary = (
        await pool.query(
          `SELECT COUNT(*)::int AS total, COALESCE(SUM(price_inr), 0)::int AS spend
           FROM bookings WHERE user_id = $1`,
          [user.id]
        )
      ).rows[0] || { total: 0, spend: 0 }

      const recent = (
        await pool.query(
          `SELECT id, origin, destination, plan, price_inr, travel_date, status, created_at
           FROM bookings WHERE user_id = $1 ORDER BY id DESC LIMIT 3`,
          [user.id]
        )
      ).rows

      return {
        found: true,
        user: {
          id: user.id,
          email: maskEmail(user.email),
          name: user.full_name,
          provider: user.provider,
          createdAt: user.created_at,
        },
        totals: { bookings: summary.total, spendInr: summary.spend },
        recentBookings: recent,
      }
    },
  },

  /* ---------- Bookings ---------- */
  count_bookings: {
    definition: {
      type: 'function',
      function: {
        name: 'count_bookings',
        description:
          'Count bookings, optionally filtered by time window and/or plan tier.',
        parameters: {
          type: 'object',
          properties: {
            since: {
              type: 'string',
              enum: ['today', '24h', '7d', '30d', '90d', '1y', 'all'],
              default: 'all',
            },
            plan: { type: 'string', enum: ['silver', 'gold', 'any'], default: 'any' },
          },
        },
      },
    },
    async run(args = {}) {
      const plan = args.plan || 'any'
      const since = args.since || 'all'
      const conds = []
      const params = []
      if (plan === 'silver' || plan === 'gold') {
        params.push(plan)
        conds.push(`plan = $${params.length}`)
      }
      const sinceFilter = sinceClause(since, 'created_at')
      if (sinceFilter.sql) conds.push(sinceFilter.sql)
      const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''

      const q = `
        SELECT
          COUNT(*)::int AS total,
          COALESCE(SUM(price_inr), 0)::int AS revenue_inr,
          COALESCE(AVG(price_inr), 0)::int AS avg_price_inr
        FROM bookings ${where}
      `
      const row = (await pool.query(q, params)).rows[0] || {}

      const byPlanQ = `
        SELECT plan, COUNT(*)::int AS c, COALESCE(SUM(price_inr),0)::int AS revenue_inr
        FROM bookings ${where}
        GROUP BY plan
        ORDER BY c DESC
      `
      const byPlan = (await pool.query(byPlanQ, params)).rows

      const byStatusQ = `
        SELECT status, COUNT(*)::int AS c
        FROM bookings ${where}
        GROUP BY status
        ORDER BY c DESC
      `
      const byStatus = (await pool.query(byStatusQ, params)).rows

      return {
        since,
        planFilter: plan,
        total: row.total || 0,
        revenueInr: row.revenue_inr || 0,
        avgPriceInr: row.avg_price_inr || 0,
        byPlan,
        byStatus,
      }
    },
  },

  recent_bookings: {
    definition: {
      type: 'function',
      function: {
        name: 'recent_bookings',
        description:
          'List the most recent bookings (newest first), optionally filtered by destination, plan or time.',
        parameters: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
            destination: {
              type: 'string',
              description:
                'Case-insensitive partial match on destination city (e.g. "goa", "manali").',
            },
            plan: { type: 'string', enum: ['silver', 'gold', 'any'], default: 'any' },
            since: {
              type: 'string',
              enum: ['today', '24h', '7d', '30d', '90d', '1y', 'all'],
              default: 'all',
            },
          },
        },
      },
    },
    async run(args = {}) {
      const limit = clampInt(args.limit, 1, 50, 10)
      const plan = args.plan || 'any'
      const since = args.since || 'all'
      const dest = (args.destination || '').trim()

      const conds = []
      const params = []
      if (plan === 'silver' || plan === 'gold') {
        params.push(plan)
        conds.push(`b.plan = $${params.length}`)
      }
      if (dest) {
        params.push(`%${dest}%`)
        conds.push(`b.destination ILIKE $${params.length}`)
      }
      const sinceFilter = sinceClause(since, 'b.created_at')
      if (sinceFilter.sql) conds.push(sinceFilter.sql)
      const where = conds.length ? `WHERE ${conds.join(' AND ')}` : ''

      params.push(limit)
      const q = `
        SELECT b.id, b.origin, b.destination, b.plan, b.price_inr, b.travel_date,
               b.status, b.created_at,
               u.email AS user_email, u.full_name AS user_name
        FROM bookings b
        JOIN users u ON u.id = b.user_id
        ${where}
        ORDER BY b.id DESC
        LIMIT $${params.length}
      `
      const { rows } = await pool.query(q, params)
      return {
        count: rows.length,
        bookings: rows.map((r) => ({
          id: r.id,
          origin: r.origin,
          destination: r.destination,
          plan: r.plan,
          priceInr: r.price_inr,
          travelDate: r.travel_date,
          status: r.status,
          createdAt: r.created_at,
          user: { email: maskEmail(r.user_email), name: r.user_name },
        })),
      }
    },
  },

  top_destinations: {
    definition: {
      type: 'function',
      function: {
        name: 'top_destinations',
        description: 'Most-booked destination cities, with booking counts and revenue.',
        parameters: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 20, default: 5 },
            since: {
              type: 'string',
              enum: ['today', '7d', '30d', '90d', '1y', 'all'],
              default: '30d',
            },
          },
        },
      },
    },
    async run(args = {}) {
      const limit = clampInt(args.limit, 1, 20, 5)
      const since = args.since || '30d'
      const sinceFilter = sinceClause(since, 'created_at')
      const where = sinceFilter.sql ? `WHERE ${sinceFilter.sql}` : ''

      const q = `
        SELECT destination,
               COUNT(*)::int AS bookings,
               COALESCE(SUM(price_inr),0)::int AS revenue_inr
        FROM bookings
        ${where}
        GROUP BY destination
        ORDER BY bookings DESC
        LIMIT $1
      `
      const { rows } = await pool.query(q, [limit])
      return { since, items: rows }
    },
  },

  top_routes: {
    definition: {
      type: 'function',
      function: {
        name: 'top_routes',
        description:
          'Most-booked origin → destination pairs, with booking counts and revenue.',
        parameters: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 20, default: 5 },
            since: {
              type: 'string',
              enum: ['today', '7d', '30d', '90d', '1y', 'all'],
              default: '30d',
            },
          },
        },
      },
    },
    async run(args = {}) {
      const limit = clampInt(args.limit, 1, 20, 5)
      const since = args.since || '30d'
      const sinceFilter = sinceClause(since, 'created_at')
      const where = sinceFilter.sql ? `WHERE ${sinceFilter.sql}` : ''

      const q = `
        SELECT origin, destination,
               COUNT(*)::int AS bookings,
               COALESCE(SUM(price_inr),0)::int AS revenue_inr
        FROM bookings
        ${where}
        GROUP BY origin, destination
        ORDER BY bookings DESC, revenue_inr DESC
        LIMIT $1
      `
      const { rows } = await pool.query(q, [limit])
      return { since, items: rows }
    },
  },

  /* ---------- AI usage ---------- */
  ai_usage_summary: {
    definition: {
      type: 'function',
      function: {
        name: 'ai_usage_summary',
        description:
          'How many AI chat messages happened in a window, plus split by user vs assistant and most active users.',
        parameters: {
          type: 'object',
          properties: {
            since: {
              type: 'string',
              enum: ['today', '7d', '30d', '90d', '1y', 'all'],
              default: '7d',
            },
            topUsers: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
          },
        },
      },
    },
    async run(args = {}) {
      const since = args.since || '7d'
      const topUsers = clampInt(args.topUsers, 1, 10, 5)
      const sinceFilter = sinceClause(since, 'created_at')
      const where = sinceFilter.sql ? `WHERE ${sinceFilter.sql}` : ''

      const total = (await pool.query(`SELECT COUNT(*)::int AS c FROM ai_chat_messages ${where}`)).rows[0]?.c || 0
      const byRole = (
        await pool.query(`SELECT role, COUNT(*)::int AS c FROM ai_chat_messages ${where} GROUP BY role`)
      ).rows
      const top = (
        await pool.query(`
          SELECT u.id, u.email, u.full_name AS name, COUNT(*)::int AS messages
          FROM ai_chat_messages m
          JOIN users u ON u.id = m.user_id
          ${where ? where.replace('created_at', 'm.created_at') : ''}
          GROUP BY u.id, u.email, u.full_name
          ORDER BY messages DESC
          LIMIT $1
        `, [topUsers])
      ).rows

      return {
        since,
        totalMessages: total,
        byRole,
        topUsers: top.map((u) => ({
          id: u.id,
          email: maskEmail(u.email),
          name: u.name,
          messages: u.messages,
        })),
      }
    },
  },

  /* ---------- Street-food catalog ---------- */
  count_street_food: {
    definition: {
      type: 'function',
      function: {
        name: 'count_street_food',
        description:
          'Aggregate of the street-food catalog: number of cities with curated entries, total dishes, and a per-city breakdown (count + street/fine split). Use this for questions like "which city has the most street foods?" or "how many cities have curated food?".',
        parameters: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
        },
      },
    },
    async run(args = {}) {
      const limit = clampInt(args.limit, 1, 50, 10)
      const idx = await streetFoodIndex()
      return {
        cities: idx.cities,
        totalDishes: idx.total,
        topCities: idx.byCity.slice(0, limit),
      }
    },
  },

  street_food_for: {
    definition: {
      type: 'function',
      function: {
        name: 'street_food_for',
        description:
          'Get the curated street-food list for a destination city. Returns dish name, description, where to eat it, tier ("street"|"fine") and a Google-Maps deep link.',
        parameters: {
          type: 'object',
          properties: {
            city: { type: 'string', minLength: 1, maxLength: 80 },
            tier: { type: 'string', enum: ['all', 'street', 'fine'], default: 'all' },
            limit: { type: 'integer', minimum: 1, maximum: 30, default: 10 },
          },
          required: ['city'],
        },
      },
    },
    async run(args = {}) {
      const city = String(args.city || '').trim()
      if (!city) return { error: 'city is required' }
      const tier = args.tier || 'all'
      const limit = clampInt(args.limit, 1, 30, 10)
      const items = (await getDestinationStreetFood(city, { tier })).slice(0, limit)
      return { city, tier, count: items.length, items }
    },
  },

  /* ---------- Platform content ---------- */
  catalog_summary: {
    definition: {
      type: 'function',
      function: {
        name: 'catalog_summary',
        description:
          'Counts of cities, curated routes, and blog posts in the database.',
        parameters: { type: 'object', properties: {} },
      },
    },
    async run() {
      const [cities, routes, posts] = await Promise.all([
        pool.query('SELECT COUNT(*)::int AS c FROM cities'),
        pool.query('SELECT COUNT(*)::int AS c FROM routes'),
        pool.query('SELECT COUNT(*)::int AS c FROM blog_posts').catch(() => ({ rows: [{ c: 0 }] })),
      ])
      return {
        cities: cities.rows[0]?.c || 0,
        routes: routes.rows[0]?.c || 0,
        blogPosts: posts.rows[0]?.c || 0,
      }
    },
  },
}

/** Used in the OpenAI request payload `tools: [...]`. */
function getToolDefinitions() {
  return Object.values(tools).map((t) => t.definition)
}

/** Run a tool by name with args. Returns plain JSON. */
async function runTool(name, args) {
  const t = tools[name]
  if (!t) return { error: `Unknown tool "${name}"` }
  try {
    return await t.run(args || {})
  } catch (err) {
    return { error: err?.message || 'Tool execution failed' }
  }
}

module.exports = { tools, getToolDefinitions, runTool }
