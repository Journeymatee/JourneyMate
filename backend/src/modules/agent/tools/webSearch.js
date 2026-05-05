'use strict'

/**
 * Tool: web_search
 *
 *   Real-time web search via Tavily (https://tavily.com/). Tavily's free
 *   tier is generous and returns AI-friendly summaries + citations, so the
 *   agent can quote actual sources instead of hallucinating.
 *
 *   When `TAVILY_API_KEY` is missing we fall back to a deterministic
 *   "useful link list" — Google + DuckDuckGo + a couple of travel-specific
 *   search portals — so the UI never goes blank.
 */

const env = require('../../../config/env')
const { fetchJson } = require('./_http')

const NAME = 'web_search'
const DESCRIPTION =
  'Real-time web search. Use this when the user asks for live information ' +
  'that is not specific to trains/flights/hotels — news, blog posts, prices, ' +
  'visa rules, schedules, etc. Returns 3–8 result snippets with source URLs.'

const SCHEMA = {
  type: 'function',
  function: {
    name: NAME,
    description: DESCRIPTION,
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Concise search query (3–12 words is best).',
        },
        topic: {
          type: 'string',
          enum: ['general', 'news'],
          description: 'Use "news" for time-sensitive lookups.',
          default: 'general',
        },
        max_results: {
          type: 'integer',
          minimum: 3,
          maximum: 8,
          default: 5,
        },
      },
      required: ['query'],
    },
  },
}

function fallbackLinks(query) {
  const q = encodeURIComponent(query)
  return {
    ok: true,
    provider: 'fallback',
    answer: null,
    results: [
      {
        title: `Google — "${query}"`,
        url: `https://www.google.com/search?q=${q}`,
        snippet: 'Open this query directly on Google search.',
      },
      {
        title: `DuckDuckGo — "${query}"`,
        url: `https://duckduckgo.com/?q=${q}`,
        snippet: 'Privacy-friendly search results.',
      },
      {
        title: `Bing — "${query}"`,
        url: `https://www.bing.com/search?q=${q}`,
        snippet: 'Bing results, often surface different sources.',
      },
    ],
    note: 'TAVILY_API_KEY is not configured — returning search portal links instead of live snippets. Add a free Tavily key to enable real-time web data.',
  }
}

async function run(args = {}) {
  const query = String(args.query || '').trim().slice(0, 240)
  if (!query) {
    return { ok: false, error: 'query is required', results: [] }
  }
  const topic = args.topic === 'news' ? 'news' : 'general'
  const maxResults = Math.min(8, Math.max(3, Number(args.max_results) || 5))

  if (!env.TAVILY_API_KEY) {
    return fallbackLinks(query)
  }

  const data = await fetchJson('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: env.TAVILY_API_KEY,
      query,
      topic,
      max_results: maxResults,
      include_answer: true,
      include_images: false,
    }),
  })

  if (!data || !Array.isArray(data.results)) {
    return fallbackLinks(query)
  }

  return {
    ok: true,
    provider: 'tavily',
    answer: data.answer || null,
    results: data.results.slice(0, maxResults).map((r) => ({
      title: String(r.title || '').trim().slice(0, 200),
      url: r.url,
      snippet: String(r.content || r.snippet || '').trim().slice(0, 480),
      published: r.published_date || null,
      score: r.score || null,
    })),
  }
}

module.exports = { name: NAME, description: DESCRIPTION, schema: SCHEMA, run }
