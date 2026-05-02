'use strict'

const ai = require('../src/modules/ai/ai.service')
const { pool } = require('../src/config/db')

const PROMPTS = [
  'hi',
  'hello there',
  'good morning',
  'namaste',
  'who are you',
  'what can you do',
  'help',
  'thanks',
  'tell me a joke',
  'what time is it',
  'where should I go for a weekend?',
  'plan a 3 day trip to goa',
  'famous food in lucknow',
  'compare train vs flight Mumbai to Delhi',
  'best time to visit ladakh',
  'safety tips for solo female travel',
  'packing list for manali in january',
  'visa requirements for india',
  'cool',
  'bye',
]

;(async () => {
  const user = { id: null, name: 'Harsh', email: 'h@example.com' }
  for (const message of PROMPTS) {
    const r = await ai.chat({ message, history: [], user }).catch((e) => ({ reply: `[ERR] ${e.message}`, nlp: { intent: 'error' } }))
    const intent = r.nlp?.intent || '?'
    const lines = String(r.reply || '').split('\n').slice(0, 3).join(' / ')
    console.log(`▶ "${message}"`.padEnd(54), `[${intent.padEnd(11)}]`, lines.slice(0, 130))
  }
  await pool.end().catch(() => {})
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
