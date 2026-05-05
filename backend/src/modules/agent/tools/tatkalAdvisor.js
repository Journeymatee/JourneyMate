'use strict'

/**
 * Tool: tatkal_advisor
 *
 * Pure deterministic helper — no third-party API needed. Tells the user:
 *   • Whether Tatkal booking is open / opens at what local time.
 *   • The realistic chance of getting a confirmed Tatkal ticket on that
 *     date, given how quickly seats vanish for popular routes.
 *
 * Indian Railways Tatkal rules (simplified, current as of 2025):
 *   • Tatkal opens *one calendar day before* the journey at IST.
 *   • AC classes (1A/2A/3A/CC/EC) — booking opens at 10:00 IST.
 *   • Sleeper / 2S / non-AC — booking opens at 11:00 IST.
 *   • Same-day journeys are not possible via Tatkal (it must be next-day).
 *
 * The "chance" estimate is heuristic, not authoritative. We label it as
 * such in the response and link to the official IRCTC page for confirmation.
 */

const NAME = 'tatkal_advisor'
const DESCRIPTION =
  'Tells the user when Tatkal booking opens for a given journey date and ' +
  'gives a realistic chance of getting a confirmed Tatkal ticket. Always ' +
  'available — no API key required.'

const SCHEMA = {
  type: 'function',
  function: {
    name: NAME,
    description: DESCRIPTION,
    parameters: {
      type: 'object',
      properties: {
        journey_date: {
          type: 'string',
          description: 'Travel date in YYYY-MM-DD.',
        },
        class: {
          type: 'string',
          enum: ['AC', 'SL', '2S', 'CC', 'EC', '1A', '2A', '3A'],
          description: 'Coach class. AC umbrella = 1A/2A/3A/CC/EC.',
          default: 'SL',
        },
      },
      required: ['journey_date'],
    },
  },
}

function isAcClass(c) {
  const v = String(c || '').toUpperCase()
  return v === 'AC' || v === '1A' || v === '2A' || v === '3A' || v === 'CC' || v === 'EC'
}

function nowIstParts() {
  // IST = UTC+5:30. We compute parts directly so this works on any host
  // regardless of TZ config.
  const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000)
  return {
    iso: now.toISOString().slice(0, 10),
    hour: now.getUTCHours(),
    minute: now.getUTCMinutes(),
  }
}

function addDaysIso(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function chanceFor({ daysAhead, isAc }) {
  // Rough heuristic mapping. Tatkal seats are tiny (10-15% of total) and
  // sell out within minutes for popular trains — chance drops sharply by
  // the time of day. We expose this as a label, not a percentage, to set
  // expectations honestly.
  if (daysAhead < 0) return { label: 'Closed', detail: 'Tatkal booking has already passed for this date.', score: 0 }
  if (daysAhead > 1) return { label: 'Not yet open', detail: 'Tatkal opens 1 day before journey.', score: null }

  const { hour, minute } = nowIstParts()
  const opensAt = isAc ? { h: 10, m: 0 } : { h: 11, m: 0 }
  // Same-day-as-Tatkal-window (the day before the journey).
  if (daysAhead === 1) {
    if (hour < opensAt.h || (hour === opensAt.h && minute < opensAt.m)) {
      return {
        label: 'Opens soon',
        detail: `Tatkal opens at ${opensAt.h}:00 IST today.`,
        score: null,
      }
    }
    // Window already opened. Estimate chance based on minutes since open.
    const minsSinceOpen = (hour - opensAt.h) * 60 + (minute - opensAt.m)
    if (minsSinceOpen < 5)  return { label: 'Excellent', detail: 'Window just opened — book NOW.',                    score: 0.85 }
    if (minsSinceOpen < 30) return { label: 'Good',      detail: 'Some seats may still be left for popular routes.', score: 0.55 }
    if (minsSinceOpen < 90) return { label: 'Tight',     detail: 'Most popular trains sell out within an hour.',     score: 0.25 }
    return { label: 'Slim', detail: 'Premium Tatkal may still have seats at higher prices.', score: 0.10 }
  }
  // Day-of journey — Tatkal can\'t be booked anymore for this train.
  return { label: 'Closed', detail: 'Tatkal had to be booked yesterday for this date.', score: 0 }
}

function run(args = {}) {
  const journeyDate = String(args.journey_date || '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(journeyDate)) {
    return { ok: false, error: 'journey_date must be YYYY-MM-DD' }
  }
  const isAc = isAcClass(args.class)
  const today = nowIstParts().iso
  const daysAhead = (() => {
    const a = new Date(`${journeyDate}T00:00:00Z`).getTime()
    const b = new Date(`${today}T00:00:00Z`).getTime()
    return Math.round((a - b) / (24 * 60 * 60 * 1000))
  })()
  const tatkalDate = addDaysIso(journeyDate, -1)

  const opensAt = isAc ? '10:00 IST' : '11:00 IST'
  const chance = chanceFor({ daysAhead, isAc })

  return {
    ok: true,
    journey_date: journeyDate,
    tatkal_window: {
      opens_on: tatkalDate,
      opens_at: opensAt,
      class_group: isAc ? 'AC (1A/2A/3A/CC/EC)' : 'Non-AC (SL/2S)',
    },
    chance: {
      label: chance.label,
      detail: chance.detail,
      score: chance.score,
    },
    tip:
      'Premium Tatkal (dynamic price) opens at the same time as Tatkal — try it ' +
      'if regular Tatkal sells out within seconds. Also, IRCTC + UPI is faster ' +
      'than card payment during the rush.',
    book_links: {
      irctc: 'https://www.irctc.co.in/nget/train-search',
      ixigo: 'https://www.ixigo.com/trains/booking',
      confirmtkt: 'https://www.confirmtkt.com/',
    },
  }
}

module.exports = { name: NAME, description: DESCRIPTION, schema: SCHEMA, run }
