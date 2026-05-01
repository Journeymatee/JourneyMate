'use strict'

/**
 * Admin Agent service.
 *
 * Flow per `ask`:
 *   1. The agent receives the admin's question.
 *   2. If an OpenAI-compatible API key is configured, it runs an LLM-driven
 *      tool-calling loop (max 4 hops) using `admin.tools.js`.
 *   3. Otherwise it falls back to a deterministic intent-router that maps
 *      common questions to direct tool calls — so the page works even
 *      without an LLM.
 *
 * The response always exposes `toolCalls` so the admin can verify
 * exactly what was queried.
 */

const ApiError = require('../../lib/ApiError')
const env = require('../../config/env')
const { runTool, getToolDefinitions } = require('./admin.tools')

const SYSTEM_PROMPT = [
  'You are JourneyMate AdminBot — a careful, read-only data analyst for the JourneyMate travel app.',
  'Answer the admin\'s questions about real customer data ONLY by calling the provided tools.',
  'Never invent numbers. If a tool result is empty, say so plainly.',
  'Prefer concise plain-English summaries; use a small markdown table when listing items.',
  'Always cite the time window you used (e.g. "last 7 days") when relevant.',
  'Do not return raw SQL. Do not echo the entire user list — at most 10 rows.',
  'Emails are partially masked by tools; respect that and never try to unmask.',
].join(' ')

const MAX_HOPS = 4
const REQUEST_TIMEOUT_MS = env.AI_TIMEOUT_MS || 20000

/* ------------------------------------------------------------------ */
/*  Local fallback (when no AI_API_KEY is configured)                  */
/* ------------------------------------------------------------------ */

async function localFallback(question) {
  const q = String(question || '').toLowerCase()
  const calls = []
  const record = async (name, args) => {
    const result = await runTool(name, args)
    calls.push({ name, args, result })
    return result
  }

  if (/(how many|count|total).*user/.test(q) || /\busers?\b/.test(q)) {
    const since = /today|24/.test(q)
      ? '24h'
      : /week|7/.test(q)
        ? '7d'
        : /month|30/.test(q)
          ? '30d'
          : /year/.test(q)
            ? '1y'
            : 'all'
    const r = await record('count_users', { since })
    return {
      reply:
        `**Users:** ${r.total} total. New signups in window (${r.since}): **${r.newSignupsInWindow}**.\n` +
        (r.byProvider?.length
          ? `Providers: ${r.byProvider.map((p) => `${p.provider}=${p.c}`).join(', ')}`
          : ''),
      toolCalls: calls,
    }
  }

  if (/recent (user|signup)/.test(q)) {
    const r = await record('recent_users', { limit: 10 })
    const rows = r.users
      .map((u) => `- ${u.email} · ${u.name} · ${u.provider} · ${new Date(u.createdAt).toISOString().slice(0, 10)}`)
      .join('\n')
    return { reply: `**Latest ${r.count} signups:**\n${rows}`, toolCalls: calls }
  }

  if (/(top|popular).*destination/.test(q)) {
    const r = await record('top_destinations', { limit: 5, since: '30d' })
    const rows = r.items.map((x) => `- ${x.destination} — ${x.bookings} bookings (₹${x.revenue_inr})`).join('\n')
    return { reply: `**Top destinations (${r.since}):**\n${rows || '_no bookings yet_'}`, toolCalls: calls }
  }

  if (/(top|popular).*route/.test(q)) {
    const r = await record('top_routes', { limit: 5, since: '30d' })
    const rows = r.items.map((x) => `- ${x.origin} → ${x.destination} — ${x.bookings} bookings`).join('\n')
    return { reply: `**Top routes (${r.since}):**\n${rows || '_no bookings yet_'}`, toolCalls: calls }
  }

  if (/recent.*booking|last.*booking/.test(q)) {
    const r = await record('recent_bookings', { limit: 10 })
    const rows = r.bookings
      .map(
        (b) =>
          `- #${b.id} · ${b.origin} → ${b.destination} · ${b.plan} · ₹${b.priceInr} · ${b.status} · ${b.user.email}`
      )
      .join('\n')
    return { reply: `**Latest ${r.count} bookings:**\n${rows || '_none yet_'}`, toolCalls: calls }
  }

  if (/(how many|count).*booking|revenue|earnings/.test(q)) {
    const since = /today/.test(q) ? '24h' : /week/.test(q) ? '7d' : /year/.test(q) ? '1y' : '30d'
    const r = await record('count_bookings', { since })
    return {
      reply:
        `**Bookings (${since}):** ${r.total}\n` +
        `Revenue: ₹${r.revenueInr.toLocaleString('en-IN')} · Avg: ₹${r.avgPriceInr.toLocaleString('en-IN')}\n` +
        (r.byPlan.length ? `By plan: ${r.byPlan.map((p) => `${p.plan}=${p.c}`).join(', ')}` : ''),
      toolCalls: calls,
    }
  }

  if (/(ai|chat|assistant).*usage|usage.*(ai|chat)/.test(q)) {
    const r = await record('ai_usage_summary', { since: '7d', topUsers: 5 })
    const top = r.topUsers.map((u) => `- ${u.email} · ${u.messages} msgs`).join('\n')
    return {
      reply:
        `**AI usage (${r.since}):** ${r.totalMessages} messages\n` +
        `Top users:\n${top || '_no users yet_'}`,
      toolCalls: calls,
    }
  }

  if (/(street ?food|famous food|local food).*(city|cities|most|top|count)|which city.*food|how many.*food/.test(q)) {
    const r = await record('count_street_food', { limit: 8 })
    const rows = r.topCities
      .map((c, i) => `${i + 1}. **${c.city}** — ${c.count} dishes (${c.street} street · ${c.fine} fine)`)
      .join('\n')
    return {
      reply:
        `**Street-food catalog:** ${r.cities} cities · ${r.totalDishes} dishes total\n\n${rows}`,
      toolCalls: calls,
    }
  }

  if (/(street ?food|famous food|local food).*\b(in|for|at)\b/.test(q)) {
    const m = q.match(/\b(?:in|for|at)\s+([a-z][a-z\s]{1,40})/)
    const city = m?.[1]?.trim()
    if (city) {
      const r = await record('street_food_for', { city, tier: 'all', limit: 8 })
      if (!r.count) return { reply: `No curated street food entries for "${city}" yet.`, toolCalls: calls }
      const rows = r.items
        .map((it) => `- ${it.emoji || '🍽️'} **${it.name}**${it.tier === 'fine' ? ' _(fine dining)_' : ''} — ${it.description}`)
        .join('\n')
      return {
        reply: `**Famous food in ${city}** (${r.count} picks):\n${rows}`,
        toolCalls: calls,
      }
    }
  }

  if (/lookup|find.*user|who is/.test(q)) {
    // try to extract an email or numeric id
    const match = q.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|\b\d{1,9}\b/i)
    if (match) {
      const r = await record('user_lookup', { emailOrId: match[0] })
      if (!r.found) return { reply: `No user found for "${match[0]}".`, toolCalls: calls }
      return {
        reply:
          `**${r.user.name}** (${r.user.email}) · ${r.user.provider}\n` +
          `Bookings: ${r.totals.bookings} · Spend: ₹${r.totals.spendInr.toLocaleString('en-IN')}`,
        toolCalls: calls,
      }
    }
  }

  // Default: high-level dashboard.
  const [users, bookings, ai, catalog] = await Promise.all([
    record('count_users', { since: '7d' }),
    record('count_bookings', { since: '7d' }),
    record('ai_usage_summary', { since: '7d', topUsers: 3 }),
    record('catalog_summary', {}),
  ])

  return {
    reply: [
      "Here's a quick snapshot for the **last 7 days** (no AI_API_KEY set, so I'm answering from canned summaries — set the key to enable free-form questions):",
      '',
      `- **Users:** ${users.total} total, ${users.newSignupsInWindow} new this week`,
      `- **Bookings:** ${bookings.total} this week · ₹${bookings.revenueInr.toLocaleString('en-IN')} revenue`,
      `- **AI chat:** ${ai.totalMessages} messages this week`,
      `- **Catalog:** ${catalog.cities} cities · ${catalog.routes} routes · ${catalog.blogPosts} blog posts`,
    ].join('\n'),
    toolCalls: calls,
  }
}

/* ------------------------------------------------------------------ */
/*  LLM-driven agent loop (tool calling)                               */
/* ------------------------------------------------------------------ */

async function llmAgent(question, history = []) {
  if (typeof fetch !== 'function') {
    throw ApiError.unavailable('AI service is unavailable in this Node runtime')
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: String(question).slice(0, 2000) },
  ]
  const tools = getToolDefinitions()
  const toolCalls = []

  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS)

    let response
    let data
    try {
      response = await fetch(env.AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.AI_MODEL,
          temperature: 0.2,
          messages,
          tools,
          tool_choice: 'auto',
          max_tokens: 700,
        }),
        signal: ctrl.signal,
      })
      data = await response.json().catch(() => ({}))
    } finally {
      clearTimeout(timer)
    }

    if (!response.ok) {
      if (response.status === 401) throw ApiError.unavailable('AI API key is invalid')
      if (response.status === 429) throw ApiError.tooMany('AI rate limit reached. Please retry shortly.')
      throw ApiError.unavailable(data?.error?.message || 'AI service request failed')
    }

    const choice = data?.choices?.[0]
    const msg = choice?.message
    if (!msg) throw ApiError.unavailable('AI did not return a response')

    // Final answer (no more tool calls requested).
    const requestedTools = Array.isArray(msg.tool_calls) ? msg.tool_calls : []
    if (requestedTools.length === 0) {
      const reply = String(msg.content || '').trim() || 'I could not find an answer in your data.'
      return { reply, toolCalls, model: env.AI_MODEL }
    }

    // Execute every tool call requested in this hop, append to history, loop.
    messages.push({
      role: 'assistant',
      content: msg.content || null,
      tool_calls: requestedTools,
    })

    for (const tc of requestedTools) {
      const name = tc?.function?.name
      let args = {}
      try {
        args = JSON.parse(tc?.function?.arguments || '{}')
      } catch {
        args = {}
      }
      const result = await runTool(name, args)
      toolCalls.push({ name, args, result })
      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(result).slice(0, 6000),
      })
    }
  }

  // Hop budget exhausted — return what we have.
  return {
    reply:
      'I gathered the data but had to stop after several lookups without producing a final answer. ' +
      'Try a more specific question (e.g. "How many bookings to Goa this month?").',
    toolCalls,
    model: env.AI_MODEL,
    truncated: true,
  }
}

/* ------------------------------------------------------------------ */
/*  Public entry                                                       */
/* ------------------------------------------------------------------ */

async function ask({ question, history = [] }) {
  const trimmed = String(question || '').trim()
  if (!trimmed) throw ApiError.badRequest('question is required')
  if (trimmed.length > 2000) throw ApiError.badRequest('question is too long (max 2000 chars)')

  if (!env.AI_API_KEY) {
    const r = await localFallback(trimmed)
    return { ...r, model: 'admin-fallback' }
  }

  try {
    return await llmAgent(trimmed, history)
  } catch (err) {
    // If the LLM path fails, return the local fallback so the admin still gets value.
    if (err instanceof ApiError && err.status >= 500) {
      const fb = await localFallback(trimmed)
      return { ...fb, model: 'admin-fallback', warning: err.message }
    }
    throw err
  }
}

/** Quick "live numbers" panel for the admin page header. */
async function quickStats() {
  const [users, bookings, weekUsers, weekBookings, ai] = await Promise.all([
    runTool('count_users', { since: 'all' }),
    runTool('count_bookings', { since: 'all' }),
    runTool('count_users', { since: '7d' }),
    runTool('count_bookings', { since: '7d' }),
    runTool('ai_usage_summary', { since: '7d', topUsers: 1 }),
  ])
  return {
    totalUsers: users.total,
    newUsers7d: weekUsers.newSignupsInWindow,
    totalBookings: bookings.total,
    bookings7d: weekBookings.total,
    revenue7dInr: weekBookings.revenueInr,
    revenueTotalInr: bookings.revenueInr,
    aiMessages7d: ai.totalMessages,
  }
}

module.exports = { ask, quickStats }
