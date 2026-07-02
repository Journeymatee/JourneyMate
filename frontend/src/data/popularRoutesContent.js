/**
 * Static data for the Popular Routes page.
 *
 * Tag → colour / emoji / backdrop tables live here so adding a new
 * vibe ("Wildlife", "Foodie", etc.) is a single-file change. The
 * card component reads from these tables, so call sites never need
 * to be touched.
 */

export const TAG_COLORS = Object.freeze({
  Beach:      'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  Mountains:  'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Heritage:   'text-rose-400 bg-rose-500/10 border-rose-500/20',
  Adventure:  'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Hills:      'text-lime-400 bg-lime-500/10 border-lime-500/20',
  Spiritual:  'text-purple-400 bg-purple-500/10 border-purple-500/20',
  Weekend:    'text-teal-400 bg-teal-500/10 border-teal-500/20',
  Scenic:     'text-green-400 bg-green-500/10 border-green-500/20',
  Royal:      'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Explore:    'text-slate-400 bg-slate-500/10 border-slate-500/20',
  Backwaters: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
})

export const TAG_EMOJIS = Object.freeze({
  Beach:      '\uD83C\uDFD6\uFE0F',
  Mountains:  '\uD83C\uDFD4\uFE0F',
  Heritage:   '\uD83C\uDFF0',
  Adventure:  '\u26F7\uFE0F',
  Hills:      '\uD83C\uDF3F',
  Spiritual:  '\uD83D\uDD49\uFE0F',
  Weekend:    '\uD83C\uDF0A',
  Scenic:     '\u2615',
  Royal:      '\uD83C\uDFDB\uFE0F',
  Explore:    '\uD83D\uDDFA\uFE0F',
  Backwaters: '\uD83D\uDEA4',
})

/**
 * Per-tag gradient backdrop — sits behind the destination photo so
 * the card area is never blank, even when an image is slow to load
 * or 404s. Each gradient is a hand-tuned twin (light + dark) of the
 * tag's accent colour so the card visually telegraphs its category
 * at a glance.
 */
export const TAG_BACKDROPS = Object.freeze({
  Beach:      'bg-gradient-to-br from-cyan-200 via-sky-300 to-blue-400 dark:from-cyan-700 dark:via-sky-800 dark:to-slate-900',
  Mountains:  'bg-gradient-to-br from-blue-200 via-indigo-300 to-slate-500 dark:from-blue-800 dark:via-indigo-900 dark:to-slate-950',
  Heritage:   'bg-gradient-to-br from-rose-200 via-amber-200 to-orange-300 dark:from-rose-800 dark:via-amber-900 dark:to-slate-950',
  Adventure:  'bg-gradient-to-br from-orange-200 via-amber-300 to-rose-400 dark:from-orange-700 dark:via-rose-800 dark:to-slate-950',
  Hills:      'bg-gradient-to-br from-lime-200 via-emerald-300 to-teal-400 dark:from-lime-800 dark:via-emerald-900 dark:to-slate-950',
  Spiritual:  'bg-gradient-to-br from-purple-200 via-fuchsia-300 to-amber-300 dark:from-purple-800 dark:via-fuchsia-900 dark:to-slate-950',
  Weekend:    'bg-gradient-to-br from-teal-200 via-cyan-300 to-sky-400 dark:from-teal-800 dark:via-cyan-900 dark:to-slate-950',
  Scenic:     'bg-gradient-to-br from-emerald-200 via-green-300 to-teal-400 dark:from-emerald-800 dark:via-green-900 dark:to-slate-950',
  Royal:      'bg-gradient-to-br from-amber-200 via-yellow-300 to-orange-400 dark:from-amber-800 dark:via-yellow-900 dark:to-slate-950',
  Explore:    'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-800 dark:to-slate-950',
  Backwaters: 'bg-gradient-to-br from-sky-200 via-cyan-300 to-teal-400 dark:from-sky-800 dark:via-cyan-900 dark:to-slate-950',
})

export const CATEGORIES = Object.freeze([
  'All',
  'Beach',
  'Mountains',
  'Heritage',
  'Adventure',
  'Hills',
  'Spiritual',
  'Weekend',
  'Scenic',
  'Royal',
])
