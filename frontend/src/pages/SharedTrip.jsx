import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, AlertCircle, Compass, Sparkles, Bookmark } from 'lucide-react'

import ComparisonPage from '../components/ComparisonPage'
import TripCollabPanel from '../components/TripCollabPanel'
import PageContainer from '../components/layout/PageContainer'
import { Button, Card } from '../components/ui'

import { getSharedTrip } from '../services/savedTripsService'
import { useAuth } from '../context/AuthContext'

/**
 * Read-only public view of a saved trip via its share token.
 *
 * Pure orchestrator — fetches the shared trip, hands the payload to
 * `<ComparisonPage>`, and renders a small public banner above it
 * built from the design-system primitives (Card, Button).
 */
export default function SharedTrip() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
          setError(
            err?.response?.data?.error?.message ||
            err?.message ||
            'Could not load shared trip',
          )
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])

  if (loading) {
    return <SharedTripLoading />
  }

  if (error || !item) {
    return <SharedTripError message={error} />
  }

  // Decorate the payload so child components that mutate (SaveTripButton)
  // can opt out without threading a new prop through every level.
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
      <PageContainer
        size="wide"
        className="pt-20 sm:pt-24"
      >
        <Card variant="glass" padding="none" className="!border-emerald-500/25 px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Bookmark size={18} className="text-emerald-300" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-widest text-emerald-300 font-semibold">
                Shared trip
              </div>
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
              <Button
                variant="primary"
                accent="emerald"
                size="sm"
                onClick={reSearch}
                iconLeft={<Compass size={14} />}
                className="!rounded-xl"
              >
                Plan this myself
              </Button>
            ) : (
              <Button
                variant="primary"
                accent="emerald"
                size="sm"
                to="/"
                iconLeft={<Sparkles size={14} />}
                className="!rounded-xl"
              >
                Sign in to save
              </Button>
            )}
          </div>
        </Card>
      </PageContainer>

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

/* ─── private helpers ────────────────────────────────────────────── */

function SharedTripLoading() {
  return (
    <main className="min-h-[100dvh] page-bg-blue flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 size={28} className="animate-spin text-emerald-300 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading the shared trip…</p>
      </div>
    </main>
  )
}

function SharedTripError({ message }) {
  return (
    <main className="min-h-[100dvh] page-bg-blue pt-24 sm:pt-28 pb-20">
      <PageContainer size="narrow">
        <Card variant="glass" padding="lg" className="!border-red-500/25 text-center max-w-md mx-auto">
          <AlertCircle size={26} className="text-red-300 mx-auto mb-3" aria-hidden />
          <h1 className="font-display font-bold text-2xl text-white mb-2">
            Link unavailable
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            {message || 'This shared trip link is no longer available.'}
          </p>
          <Button
            variant="primary"
            accent="emerald"
            size="md"
            to="/"
            iconLeft={<Compass size={14} />}
          >
            Plan your own trip
          </Button>
        </Card>
      </PageContainer>
    </main>
  )
}
