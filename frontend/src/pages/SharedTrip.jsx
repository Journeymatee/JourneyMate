import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Loader2, AlertCircle, Compass, Sparkles, Bookmark } from 'lucide-react'
import ComparisonPage from '../components/ComparisonPage'
import TripCollabPanel from '../components/TripCollabPanel'
import { getSharedTrip } from '../services/savedTripsService'
import { useAuth } from '../context/AuthContext'

/**
 * Read-only public view of a saved trip via its share token.
 *
 * - Anyone with the link can open this page (works without auth).
 * - The full ComparisonPage is rendered against the saved payload, but the
 *   payload is decorated with `__readOnly: true` so write-affecting controls
 *   (like SaveTripButton) hide themselves.
 * - Users that are signed in see a CTA to copy this trip into their own
 *   wishlist via "Re-search". Anonymous users see a CTA to sign in.
 */
export default function SharedTrip() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [item, setItem]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    getSharedTrip(token)
      .then((data) => { if (!cancelled) setItem(data) })
      .catch((err) => {
        if (cancelled) return
        const status = err?.response?.status
        if (status === 404) {
          setError('This shared trip link is no longer available.')
        } else {
          setError(err?.response?.data?.error?.message || err?.message || 'Could not load shared trip')
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])

  if (loading) {
    return (
      <div className="min-h-[100dvh] page-bg-blue flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 size={28} className="animate-spin text-emerald-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading the shared trip…</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-[100dvh] page-bg-blue pt-24 sm:pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-md mx-auto glass rounded-3xl border border-red-500/25 p-8 text-center">
          <AlertCircle size={26} className="text-red-300 mx-auto mb-3" />
          <h1 className="font-display font-bold text-2xl text-white mb-2">Link unavailable</h1>
          <p className="text-slate-400 text-sm mb-6">
            {error || 'This shared trip link is no longer available.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors"
          >
            <Compass size={14} />
            Plan your own trip
          </Link>
        </div>
      </div>
    )
  }

  // Decorate the payload so child components that mutate (SaveTripButton)
  // can opt out. Keeping the marker on the trip data itself avoids threading
  // a new prop through ComparisonPage's many sub-components.
  const payload = { ...(item.payload || {}), __readOnly: true }

  const reSearch = () => {
    navigate('/', {
      state: {
        autoSearch: true,
        from: item.origin,
        to: item.destination,
        days: item.days,
      },
    })
  }

  return (
    <div className="min-h-[100dvh]">
      {/* Public banner */}
      <div className="px-4 sm:px-6 pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-3xl border border-emerald-500/25 px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Bookmark size={18} className="text-emerald-300" />
              </div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-widest text-emerald-300 font-semibold">Shared trip</div>
                <div className="text-white text-sm sm:text-base font-display font-semibold truncate">
                  {item.name}
                </div>
                <div className="text-slate-400 text-xs sm:text-sm truncate">
                  {item.origin} → {item.destination} · {item.days} day{item.days === 1 ? '' : 's'}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {user ? (
                <button
                  type="button"
                  onClick={reSearch}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors"
                >
                  <Compass size={14} />
                  Plan this myself
                </button>
              ) : (
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-colors"
                >
                  <Sparkles size={14} />
                  Sign in to save
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <ComparisonPage
        tripData={payload}
        onBack={() => navigate(user ? '/saved' : '/')}
        selectedDays={item.days}
        tripType={payload.tripType || null}
        vibes={Array.isArray(payload.vibes) ? payload.vibes : []}
      />

      <TripCollabPanel token={token} name={item.name || 'this trip'} />
    </div>
  )
}
