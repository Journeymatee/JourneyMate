import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bookmark,
  BookmarkCheck,
  MapPin,
  Calendar,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Pencil,
  ExternalLink,
  Loader2,
  AlertCircle,
  Compass,
} from 'lucide-react'
import {
  listSavedTrips,
  deleteSavedTrip,
  updateSavedTrip,
  shareUrl,
} from '../services/savedTripsService'
import { findTripType } from '../data/tripVibes'
import { getStatePhoto, onPhotoError } from '../utils/getStatePhoto'

/**
 * "Saved trips & wishlist" page — list of every trip the user has bookmarked.
 *
 * Each card supports inline rename, delete with confirm, copy share link, a
 * jump to the read-only public view, and a "Re-search" shortcut that runs a
 * fresh /trips/search for the same route (using the existing autoSearch
 * pattern that PopularRoutes uses).
 */
export default function SavedTrips() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const list = await listSavedTrips()
      setItems(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.response?.data?.error?.message || err?.message || 'Could not load saved trips')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const handleDelete = async (item) => {
    if (!item) return
    const ok = typeof window !== 'undefined' && window.confirm(`Delete "${item.name}"? This cannot be undone.`)
    if (!ok) return
    setItems((cur) => cur.filter((it) => it.id !== item.id))
    try {
      await deleteSavedTrip(item.id)
    } catch (err) {
      setError(err?.response?.data?.error?.message || err?.message || 'Could not delete')
      // Restore on failure
      refresh()
    }
  }

  const handleRename = async (item, name) => {
    const next = String(name || '').trim().slice(0, 200)
    if (!next || next === item.name) return item
    setItems((cur) => cur.map((it) => (it.id === item.id ? { ...it, name: next } : it)))
    try {
      const updated = await updateSavedTrip(item.id, { name: next })
      if (updated) setItems((cur) => cur.map((it) => (it.id === item.id ? { ...it, ...updated } : it)))
      return updated
    } catch (err) {
      setError(err?.response?.data?.error?.message || err?.message || 'Could not rename')
      refresh()
      return null
    }
  }

  const handleResearch = (item) => {
    navigate('/', {
      state: {
        autoSearch: true,
        from: item.origin,
        to: item.destination,
        days: item.days,
      },
    })
  }

  const totalSaved = items.length

  return (
    <div className="min-h-[100dvh] page-bg-blue pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/30 mb-5">
            <Bookmark size={14} className="text-emerald-300" />
            <span className="text-xs sm:text-sm text-slate-300 font-medium uppercase tracking-widest">Wishlist</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4 leading-tight">
            Your <span className="shimmer-blue">saved trips</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Every plan you've bookmarked lives here. Pick up where you left off, share a private link with whoever you're travelling with, or kick off a fresh comparison.
          </p>
          {totalSaved > 0 && (
            <p className="text-slate-500 text-xs sm:text-sm mt-3">
              {totalSaved} trip{totalSaved === 1 ? '' : 's'} saved
            </p>
          )}
        </div>

        {/* Error banner */}
        {error && !loading && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-300 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content states */}
        {loading ? (
          <SavedTripsSkeleton />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {items.map((item) => (
              <SavedTripCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
                onRename={handleRename}
                onResearch={handleResearch}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ───────────────────────────── card ───────────────────────────── */

function SavedTripCard({ item, onDelete, onRename, onResearch }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(item.name)
  const [copied, setCopied]   = useState(false)
  const copyTimerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current) }, [])
  useEffect(() => { setDraft(item.name) }, [item.name])
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const photo = useMemo(
    () => getStatePhoto({
      stateCode: item?.payload?.destinationStateCode || item?.payload?.destinationState?.code,
      city: item.destination,
    }),
    [item.destination, item?.payload]
  )

  const tripTypeMeta = item.tripType ? findTripType(item.tripType) : null

  const commitRename = async () => {
    const next = String(draft || '').trim()
    setEditing(false)
    if (!next || next === item.name) {
      setDraft(item.name)
      return
    }
    await onRename(item, next)
  }

  const handleCopy = async () => {
    const url = shareUrl(item.shareToken)
    if (!url) return
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
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
      /* swallow */
    }
  }

  const created = formatDate(item.createdAt)

  return (
    <article className="glass rounded-3xl border border-white/10 overflow-hidden flex flex-col hover:border-white/20 transition-colors">
      {/* Hero strip */}
      <div className="relative h-32 sm:h-36 overflow-hidden bg-slate-900">
        {photo?.file && (
          <img
            src={photo.file}
            alt={photo.spot ? `${photo.spot} — ${photo.name}` : item.destination}
            onError={onPhotoError}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent" />
        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-emerald-200 px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
          <BookmarkCheck size={12} />
          Saved
        </div>
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-baseline gap-1.5 text-sm font-semibold flex-wrap">
            <MapPin size={14} className="text-green-300" />
            <span className="truncate max-w-[40%]">{item.origin}</span>
            <span className="text-slate-300">→</span>
            <MapPin size={14} className="text-amber-300" />
            <span className="truncate max-w-[40%]">{item.destination}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
        {/* Name (editable) */}
        <div className="flex items-start gap-2">
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              value={draft}
              maxLength={200}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitRename() }
                if (e.key === 'Escape') { setDraft(item.name); setEditing(false) }
              }}
              className="flex-1 min-w-0 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm sm:text-base text-white outline-none focus:border-emerald-400/60"
            />
          ) : (
            <h3
              className="flex-1 font-display font-bold text-base sm:text-lg text-white leading-tight break-words"
              title={item.name}
            >
              {item.name}
            </h3>
          )}
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label={editing ? 'Cancel rename' : 'Rename'}
          >
            <Pencil size={14} />
          </button>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10">
            <Calendar size={11} /> {item.days} day{item.days === 1 ? '' : 's'}
          </span>
          {tripTypeMeta && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10">
              <Sparkles size={11} /> {tripTypeMeta.label}
            </span>
          )}
          {Array.isArray(item.vibes) && item.vibes.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/10">
              {item.vibes.slice(0, 3).join(' · ')}
              {item.vibes.length > 3 && ` +${item.vibes.length - 3}`}
            </span>
          )}
          {created && <span className="text-slate-500">Saved {created}</span>}
        </div>

        {/* Prices */}
        {(item.silverPrice != null || item.goldPrice != null) && (
          <div className="flex items-center gap-3 text-sm">
            {item.silverPrice != null && (
              <div className="flex items-center gap-1.5 text-emerald-300">
                <span className="text-xs uppercase tracking-widest">Silver</span>
                <span className="font-display font-bold">₹{Number(item.silverPrice).toLocaleString('en-IN')}</span>
              </div>
            )}
            {item.goldPrice != null && (
              <div className="flex items-center gap-1.5 text-amber-300">
                <span className="text-xs uppercase tracking-widest">Gold</span>
                <span className="font-display font-bold">₹{Number(item.goldPrice).toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
          <Link
            to={`/shared/${encodeURIComponent(item.shareToken)}`}
            className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/25 transition-colors"
          >
            <ExternalLink size={14} />
            Open
          </Link>
          <button
            type="button"
            onClick={() => onResearch(item)}
            className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
            title="Run a fresh comparison for this route"
          >
            <Compass size={14} />
            Re-search
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
            aria-live="polite"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-300" />
                Copied
              </>
            ) : (
              <>
                <Copy size={14} />
                Share link
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 hover:bg-red-500/20 hover:text-white transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

/* ─────────────────────────── helpers ─────────────────────────── */

function formatDate(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const now = new Date()
    const sameYear = d.getFullYear() === now.getFullYear()
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      ...(sameYear ? {} : { year: 'numeric' }),
    })
  } catch {
    return ''
  }
}

function EmptyState() {
  return (
    <div className="glass rounded-3xl border border-white/10 p-8 sm:p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
        <Bookmark size={26} className="text-emerald-300" />
      </div>
      <h2 className="font-display font-bold text-xl sm:text-2xl text-white mb-2">No saved trips yet</h2>
      <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-6">
        Compare a route, then hit "Save trip" on any plan you like — it'll live here so you can come back to it or share with whoever is travelling with you.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors"
      >
        Start a comparison
      </Link>
    </div>
  )
}

function SavedTripsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="glass rounded-3xl border border-white/10 overflow-hidden flex flex-col">
          <div className="h-32 sm:h-36 bg-white/5 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="h-9 bg-white/10 rounded-xl animate-pulse" />
              <div className="h-9 bg-white/10 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      ))}
      <div className="md:col-span-2 flex items-center justify-center text-slate-500 text-sm">
        <Loader2 size={14} className="animate-spin mr-2" />
        Loading your saved trips…
      </div>
    </div>
  )
}
