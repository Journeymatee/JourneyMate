import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, BookmarkCheck, Copy, Check, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { createSavedTrip, shareUrl } from '../services/savedTripsService'

/**
 * Inline "Save trip" control for the Compare hero.
 *
 * - One click saves the current `tripData` with a sensible default name.
 * - After saving, swaps into a tiny strip with: "Copy share link" + "View saved".
 * - Resets when the user navigates to a different trip (origin/destination change).
 *
 * The control is visually compact so it can sit next to the existing Back
 * button without crowding the route header on small screens.
 */
export default function SaveTripButton({ tripData, payload, className = '' }) {
  // The parent can pass an already-merged `payload` (e.g. trip + per-day
  // notes) — fall back to `tripData` so older call-sites still work.
  const payloadToSave = payload || tripData
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(null)   // SavedTrip | null
  const [error, setError]   = useState('')
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef(null)

  // Identity = origin + destination + days. Anything else (vibes / tier toggle)
  // is allowed to mutate without losing the "saved" badge.
  const tripKey = useMemo(() => {
    if (!tripData) return ''
    return [tripData.origin, tripData.destination, tripData.requestedDays].filter(Boolean).join('|')
  }, [tripData?.origin, tripData?.destination, tripData?.requestedDays])

  useEffect(() => {
    setSaved(null)
    setError('')
    setCopied(false)
  }, [tripKey])

  useEffect(() => () => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
  }, [])

  const handleSave = async () => {
    if (!payloadToSave || saving) return
    setSaving(true)
    setError('')
    try {
      const item = await createSavedTrip({ payload: payloadToSave })
      setSaved(item)
    } catch (err) {
      const msg = err?.response?.data?.error?.message
        || err?.response?.data?.error
        || err?.message
        || 'Could not save trip'
      setError(typeof msg === 'string' ? msg : 'Could not save trip')
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = async () => {
    if (!saved?.shareToken) return
    const url = shareUrl(saved.shareToken)
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        // Fallback for older browsers / non-secure origins.
        const ta = document.createElement('textarea')
        ta.value = url
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      setError('Could not copy link')
    }
  }

  if (!tripData) return null
  // Read-only context (e.g. /shared/:token) — hide write controls.
  if (tripData.__readOnly) return null

  /* ── Saved state — show share + view ── */
  if (saved) {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl glass border border-emerald-500/30 text-emerald-300">
          <BookmarkCheck size={14} />
          Saved
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-xl glass border border-white/10 hover:border-white/20 text-slate-200 hover:text-white transition-colors active:scale-[0.97] touch-manipulation"
          aria-live="polite"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-300" />
              Link copied
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy share link
            </>
          )}
        </button>
        <Link
          to="/saved"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-xl glass border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-colors active:scale-[0.97] touch-manipulation"
        >
          <ExternalLink size={14} />
          View saved
        </Link>
      </div>
    )
  }

  /* ── Default state — single Save button ── */
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 text-sm text-slate-100 px-3.5 sm:px-4 py-2.5 rounded-xl glass border border-emerald-500/30 hover:border-emerald-400/60 hover:bg-emerald-500/10 disabled:opacity-60 transition-colors active:scale-[0.97] touch-manipulation"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Bookmark size={16} className="text-emerald-300" />}
        {saving ? 'Saving…' : 'Save trip'}
      </button>
      {error && (
        <span className="inline-flex items-center gap-1.5 text-xs text-red-300" role="alert">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
    </div>
  )
}
