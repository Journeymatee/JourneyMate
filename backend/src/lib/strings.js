'use strict'

/**
 * String utilities: typo-tolerant matching for user input.
 *
 * `editDistance` uses the Optimal-String-Alignment (OSA) variant of
 * Damerau-Levenshtein — it counts insertions, deletions, substitutions AND
 * adjacent transpositions, all as a single edit. That means the very common
 * "delih" → "delhi" typo costs 1, not 2 (a plain Levenshtein would charge 2).
 *
 * The implementation is small and allocation-light because it gets called
 * a couple hundred times per fuzzy lookup.
 */
function editDistance(a, b) {
  if (a === b) return 0
  if (!a) return b ? b.length : 0
  if (!b) return a.length
  const m = a.length
  const n = b.length
  // Quick prune — if lengths differ a lot, the distance is at least the diff.
  if (Math.abs(m - n) > 4 && Math.abs(m - n) >= Math.max(m, n)) return Math.max(m, n)

  // Two rolling rows + one row above for transposition detection.
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i += 1) dp[i][0] = i
  for (let j = 0; j <= n; j += 1) dp[0][j] = j

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
      if (
        i > 1 && j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1)
      }
    }
  }
  return dp[m][n]
}

/**
 * Pick the closest candidate to `input` (by edit distance) under a
 * length-aware threshold. Returns `null` if nothing is confident enough.
 *
 * Threshold scales with the input length so short keys don't false-match:
 *   len ≤ 4  → 1 edit  (e.g. "goa" must be exact)
 *   len ≤ 7  → 2 edits
 *   len ≥ 8  → 3 edits
 *
 * @param {string} input        raw user-typed string
 * @param {string[]} candidates candidate keys (lowercased)
 * @returns {{ match: string, distance: number } | null}
 */
function closestMatch(input, candidates) {
  const key = String(input || '').toLowerCase().trim()
  if (!key || key.length < 3 || !Array.isArray(candidates) || candidates.length === 0) {
    return null
  }
  const threshold = key.length <= 4 ? 1 : key.length <= 7 ? 2 : 3
  let best = null
  let bestDist = Infinity
  for (const cand of candidates) {
    if (typeof cand !== 'string' || !cand) continue
    if (Math.abs(cand.length - key.length) > threshold) continue
    const d = editDistance(key, cand)
    if (d <= threshold && d < bestDist) {
      bestDist = d
      best = cand
      if (d === 0) break
    }
  }
  return best ? { match: best, distance: bestDist } : null
}

module.exports = { editDistance, closestMatch }
