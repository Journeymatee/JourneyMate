import React, { useState, useEffect, useRef, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { ShareExperienceProvider, useShareExperience } from './context/ShareExperienceContext'

/* ------------------------------------------------------------------ */
/*  Refresh-safe session storage for the home view                     */
/* ------------------------------------------------------------------ */
/** Keep the Compare view alive across page refresh. sessionStorage is
 *  per-tab, so closing the tab clears it — exactly the scope of "refresh". */
const HOME_STATE_KEY = 'jm:home-state-v1'

function readHomeState() {
  try {
    if (typeof sessionStorage === 'undefined') return null
    const raw = sessionStorage.getItem(HOME_STATE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.view !== 'comparison' || !parsed.tripData) return null
    return parsed
  } catch {
    return null
  }
}

function writeHomeState(state) {
  try {
    if (typeof sessionStorage === 'undefined') return
    sessionStorage.setItem(HOME_STATE_KEY, JSON.stringify(state))
  } catch {
    /* quota / privacy mode — ignore */
  }
}

function clearHomeState() {
  try {
    if (typeof sessionStorage === 'undefined') return
    sessionStorage.removeItem(HOME_STATE_KEY)
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  Stale-while-revalidate trip cache (per-route)                      */
/* ------------------------------------------------------------------ */
/**
 * Persists every successful /trips/search response in localStorage keyed by
 * route + days. On the next search of the same route the comparison page
 * appears INSTANTLY from cache; the network request still fires in the
 * background and silently overwrites the cached payload + on-screen data
 * once it returns.
 *
 *   • TTL is intentionally generous (24 h). Prices / weather move slowly
 *     enough that a 1-day-old number is fine for the first paint, and the
 *     background refresh corrects it within seconds.
 *   • We cap the entry count at 24 (LRU on access time) so the per-origin
 *     localStorage quota (~5 MB) stays comfortable.
 */
const TRIP_CACHE_KEY = 'jm:trip-cache-v1'
const TRIP_CACHE_TTL_MS = 24 * 60 * 60 * 1000
const TRIP_CACHE_MAX = 24

function tripCacheKey(from, to, days) {
  const norm = (s) => String(s || '').trim().toLowerCase()
  return `${norm(from)}__${norm(to)}|d=${Math.min(5, Math.max(1, Number(days) || 5))}`
}

function readTripCache() {
  try {
    if (typeof localStorage === 'undefined') return {}
    const raw = localStorage.getItem(TRIP_CACHE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeTripCache(map) {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(TRIP_CACHE_KEY, JSON.stringify(map))
  } catch {
    /* quota full / private mode — ignore */
  }
}

function getCachedTrip(from, to, days) {
  const map = readTripCache()
  const hit = map[tripCacheKey(from, to, days)]
  if (!hit) return null
  if (Date.now() - hit.at > TRIP_CACHE_TTL_MS) return null
  return hit.data || null
}

function setCachedTrip(from, to, days, data) {
  const map = readTripCache()
  map[tripCacheKey(from, to, days)] = { at: Date.now(), data }
  // LRU trim: drop the oldest entries if we exceed the cap.
  const keys = Object.keys(map)
  if (keys.length > TRIP_CACHE_MAX) {
    keys
      .sort((a, b) => (map[a].at || 0) - (map[b].at || 0))
      .slice(0, keys.length - TRIP_CACHE_MAX)
      .forEach((k) => { delete map[k] })
  }
  writeTripCache(map)
}
import Navbar from './components/Navbar'
import HeroSearch from './components/HeroSearch'
import ComparisonPage from './components/ComparisonPage'
import FeaturesSection from './components/FeaturesSection'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'
import LoginPage from './components/LoginPage'
import HowItWorks from './pages/HowItWorks'
import PopularRoutes from './pages/PopularRoutes'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import Pricing from './pages/Pricing'
import ContactUs from './pages/ContactUs'
import AboutOwner from './pages/AboutOwner'
import AdminAgent from './pages/AdminAgent'
import SavedTrips from './pages/SavedTrips'
import SharedTrip from './pages/SharedTrip'
import { AssistantWidget } from './features/ai'
import { useAuth } from './context/AuthContext'
import { searchTrip, tripErrorMessage, getTripPreferences } from './services/travelService'
import { wakeBackend, subscribeWakeStatus } from './api/client'

function HomePage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Hydrate from sessionStorage so a browser refresh on the Compare view
  // lands you back on the Compare view (with the same trip data) instead of
  // dumping you to Home.
  const persistedRef = useRef(readHomeState())
  const persisted = persistedRef.current
  const [view, setView] = useState(() => (persisted?.view === 'comparison' ? 'comparison' : 'home'))
  const [tripData, setTripData] = useState(() => persisted?.tripData ?? null)
  const [searchParams, setSearchParams] = useState(() => persisted?.searchParams ?? { from: '', to: '', days: 5 })
  // Trip-type radio (solo/couple/family/friends) and multi-select vibes are
  // page-level so they survive refresh AND are shared between HeroSearch and
  // ComparisonPage. They're frontend-only — the backend doesn't care.
  const [tripType, setTripType] = useState(() => persisted?.tripType ?? null)
  const [vibes, setVibes] = useState(() => Array.isArray(persisted?.vibes) ? persisted.vibes : [])
  const [searchError, setSearchError] = useState('')
  const [refreshingDays, setRefreshingDays] = useState(false)
  // Backend-wake status drives a small "Server waking…" chip on the home view.
  // Free-tier dynos (Render) sleep after idle and take 30–90 s to boot — we
  // start pinging /health the moment the page mounts so the dyno is hot by
  // the time the user hits search.
  const [wakeStatus, setWakeStatus] = useState('idle')
  const routeRef = useRef({ from: '', to: '' })
  const fromResolved =
    (searchParams.from && String(searchParams.from).trim()) || (tripData?.origin && String(tripData.origin).trim()) || ''
  const toResolved =
    (searchParams.to && String(searchParams.to).trim()) || (tripData?.destination && String(tripData.destination).trim()) || ''
  routeRef.current = { from: fromResolved, to: toResolved }

  // Handle auto-search triggered from PopularRoutes page
  useEffect(() => {
    const state = location.state
    if (state?.autoSearch && state.from && state.to) {
      // Clear the state so back-nav doesn't re-trigger
      navigate('/', { replace: true, state: {} })
      handleSearch(state.from, state.to, state.days ?? 5)
    }
  }, []) // eslint-disable-line

  // Pre-warm the backend (free-tier cold-start mitigation). Subscribed both
  // ways so the chip on the hero matches the global wake state and a future
  // navigation back to '/' picks up an already-warm server immediately.
  useEffect(() => {
    const unsub = subscribeWakeStatus(setWakeStatus)
    wakeBackend().catch(() => { /* the chip will reflect the failed state */ })
    return unsub
  }, [])

  // Mirror the comparison view + trip data into sessionStorage so a refresh
  // re-hydrates the same page. Only persist comparison; clear on home/loading.
  useEffect(() => {
    if (view === 'comparison' && tripData) {
      writeHomeState({ view, tripData, searchParams, tripType, vibes })
    } else if (view === 'home') {
      clearHomeState()
    }
    // 'loading' is ephemeral — leave whatever is already persisted alone.
  }, [view, tripData, searchParams, tripType, vibes])

  // AbortController for the in-flight search so the loader's "Cancel" button
  // can actually stop the network request (otherwise axios would resolve in
  // the background and silently switch the view to 'comparison').
  const searchAbortRef = useRef(null)

  const handleSearch = async (from, to, days = 5, opts = {}) => {
    const nextTripType = opts && Object.prototype.hasOwnProperty.call(opts, 'tripType')
      ? (opts.tripType ?? null)
      : tripType
    const nextVibes = opts && Array.isArray(opts.vibes) ? opts.vibes : vibes
    setTripType(nextTripType)
    setVibes(nextVibes)
    setSearchParams({ from, to, days })
    setSearchError('')

    // ── Stale-while-revalidate: paint the Compare page INSTANTLY if we've
    //    seen this route before. The full network request still fires in
    //    the background and silently swaps in fresh data when it lands.
    const cached = getCachedTrip(from, to, days)
    const haveCached = Boolean(cached)
    if (haveCached) {
      setTripData(cached)
      setView('comparison')
    } else {
      setView('loading')
    }

    // Cancel any previous in-flight request before kicking off a new one.
    if (searchAbortRef.current) searchAbortRef.current.abort()
    const controller = new AbortController()
    searchAbortRef.current = controller

    try {
      const data = await searchTrip(from, to, {
        days,
        tripType: nextTripType,
        vibes: nextVibes,
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      setTripData(data)
      setView('comparison')
      setCachedTrip(from, to, days, data)
    } catch (error) {
      if (controller.signal.aborted) return
      // eslint-disable-next-line no-console
      console.error('Search failed:', error)
      if (error.response?.status === 401) {
        logout()
        return
      }
      // If we already painted from cache, the user keeps seeing the cached
      // result — don't yank them back to home or pop a scary error toast.
      // Just log to console; the next successful search will refresh.
      if (haveCached) return

      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout')
      const isNetwork = error.code === 'ERR_NETWORK' || (!error.response && !isTimeout)
      let msg
      if (isTimeout) {
        msg = 'The server took too long to respond. Free-tier servers can be slow on first wake-up — please try again.'
      } else if (isNetwork) {
        msg = 'Network error — check your connection and try again.'
      } else {
        msg = tripErrorMessage(error) || 'Search failed. Please try again.'
      }
      setSearchError(msg)
      setView('home')
    } finally {
      if (searchAbortRef.current === controller) searchAbortRef.current = null
    }
  }

  const handleCancelSearch = useCallback(() => {
    if (searchAbortRef.current) searchAbortRef.current.abort()
    searchAbortRef.current = null
    setSearchError('Search cancelled. Try a different route or tap search again.')
    setView('home')
  }, [])

  const handleBack = () => {
    setView('home')
    setTripData(null)
    setSearchError('')
    clearHomeState()
  }

  const refetchWithDays = useCallback(
    async (rawDays) => {
      const n = Math.min(5, Math.max(1, Math.round(Number(rawDays)) || 5))
      const from = String(routeRef.current.from || '').trim()
      const to = String(routeRef.current.to || '').trim()
      if (!from || !to) {
        setSearchError('Search a route first, then choose 1–5 days.')
        return
      }
      setRefreshingDays(true)
      setSearchError('')

      // Stale-while-revalidate for day changes too — paint instantly if we
      // have a recent cached snapshot of this route+days, and let the
      // network refresh it in the background.
      const cached = getCachedTrip(from, to, n)
      if (cached) {
        setSearchParams((s) => ({ ...s, from, to, days: n }))
        setTripData(cached)
      }

      try {
        setSearchParams((s) => ({ ...s, from, to, days: n }))
        const data = await searchTrip(from, to, { days: n, tripType, vibes })
        setTripData(data)
        setCachedTrip(from, to, n, data)
      } catch (error) {
        console.error('Refetch failed:', error)
        if (error.response?.status === 401) {
          logout()
          return
        }
        if (cached) return // keep cached UI, swallow the error
        setSearchError(tripErrorMessage(error) || 'Could not update trip length')
      } finally {
        setRefreshingDays(false)
      }
    },
    [logout, tripType, vibes]
  )

  // ─── Auto-refetch when ONLY tripType / vibes change while on Compare ───
  // Debounced so a quick burst of vibe toggles results in one network call.
  // We track the last-applied selection to skip refetches that don't change it.
  const lastAppliedRef = useRef({ tripType: null, vibes: [] })
  // Seed the ref so the very first comparison render doesn't trigger a refetch
  // for what the search already produced.
  useEffect(() => {
    lastAppliedRef.current = { tripType: tripData?.tripType ?? null, vibes: tripData?.vibes ?? [] }
    // Only fire when tripData identity changes — not for our own setTripData below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripData])

  useEffect(() => {
    if (view !== 'comparison' || !tripData) return undefined
    const sameType  = lastAppliedRef.current.tripType === tripType
    const sameVibes = JSON.stringify(lastAppliedRef.current.vibes || []) === JSON.stringify(vibes || [])
    if (sameType && sameVibes) return undefined

    const handle = setTimeout(async () => {
      const from = String(routeRef.current.from || '').trim()
      const to = String(routeRef.current.to || '').trim()
      if (!from || !to) return
      setRefreshingDays(true)
      try {
        const days = Number(searchParams.days ?? tripData.requestedDays ?? 5) || 5
        const data = await searchTrip(from, to, { days, tripType, vibes })
        lastAppliedRef.current = { tripType, vibes: [...vibes] }
        setTripData(data)
      } catch (error) {
        if (error.response?.status === 401) { logout(); return }
        setSearchError(tripErrorMessage(error) || 'Could not update preferences')
      } finally {
        setRefreshingDays(false)
      }
    }, 350)
    return () => clearTimeout(handle)
  }, [tripType, vibes, view, tripData, searchParams.days, logout])

  // ─── No auto-hydration of trip-type / vibes ───
  // Loading a saved preference like "family" felt like the app was
  // making the choice *for* the user. The home view now starts with no
  // trip type and no vibes selected on every fresh load — only an
  // in-tab refresh (sessionStorage, handled above) restores intent.
  // ─── Hydrate trip-type / vibes from server on first sign-in ───
  // Only when we don't already have a session-restored value (sessionStorage
  // wins because it represents in-tab intent).
  const hydratedRef = useRef(false)
  useEffect(() => {
    if (hydratedRef.current) return
    if (persisted) { hydratedRef.current = true; return }
    let cancelled = false
    getTripPreferences().then((prefs) => {
      if (cancelled || !prefs) return
      if (prefs.tripType) setTripType(prefs.tripType)
      if (Array.isArray(prefs.vibes)) setVibes(prefs.vibes)
      hydratedRef.current = true
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {searchError && (view === 'home' || view === 'comparison') && (
        <div className="fixed top-20 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
          <div className="pointer-events-auto max-w-lg w-full rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-md px-4 py-3 text-sm text-red-100 text-center shadow-xl">
            {searchError}
            <button
              type="button"
              onClick={() => setSearchError('')}
              className="block w-full mt-2 text-xs text-slate-300 hover:text-white underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {view === 'home' && (
        <>
          <WakeStatusChip status={wakeStatus} onRetry={() => wakeBackend()} />
          <HeroSearch
            onSearch={handleSearch}
            loading={false}
            initialTripType={tripType}
            initialVibes={vibes}
          />
          <FeaturesSection />
          <Footer />
        </>
      )}

      {view === 'loading' && (
        <LoadingSpinner
          from={searchParams.from}
          to={searchParams.to}
          onCancel={handleCancelSearch}
        />
      )}

      {view === 'comparison' && tripData && (
        <>
          <ComparisonPage
            tripData={tripData}
            onBack={handleBack}
            onChangeDays={refetchWithDays}
            daysLoading={refreshingDays}
            selectedDays={(() => {
              const n = Number(searchParams.days ?? tripData.requestedDays ?? 5)
              if (!Number.isFinite(n)) return 5
              return Math.min(5, Math.max(1, n))
            })()}
            tripType={tripType}
            vibes={vibes}
            onTripTypeChange={setTripType}
            onVibesChange={setVibes}
          />
          <Footer />
        </>
      )}
    </>
  )
}

/**
 * Small chip shown above the hero on the home view that tells the user
 * the server is warming up. Hidden once the dyno is ready (the common
 * case after the first ping returns), so warm visits see nothing.
 */
function WakeStatusChip({ status, onRetry }) {
  if (status === 'idle' || status === 'ready') return null

  const isWaking = status === 'waking'
  const isFailed = status === 'failed'

  return (
    <div className="fixed top-[72px] left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
      <div
        className={`pointer-events-auto inline-flex items-center gap-2 rounded-full border backdrop-blur-md px-3.5 py-1.5 text-[11px] font-semibold shadow-lg transition-all ${
          isWaking
            ? 'border-amber-400/30 bg-amber-500/10 text-amber-200'
            : 'border-rose-400/30  bg-rose-500/10  text-rose-200'
        }`}
      >
        <span className="relative flex w-2 h-2">
          <span
            className={`absolute inset-0 rounded-full animate-ping ${
              isWaking ? 'bg-amber-400/60' : 'bg-rose-400/60'
            }`}
          />
          <span
            className={`relative w-2 h-2 rounded-full ${
              isWaking ? 'bg-amber-400' : 'bg-rose-400'
            }`}
          />
        </span>
        {isWaking && <span>Server is waking up — first request can take ~30s</span>}
        {isFailed && (
          <>
            <span>Server unreachable</span>
            <button
              type="button"
              onClick={onRetry}
              className="ml-1 rounded-full px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 transition-colors"
            >
              Retry
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Legacy redirect. The standalone /share-experience page was replaced by
 * a global modal — old bookmarks land on /blog and pop the dialog open.
 */
function ShareExperienceRedirect() {
  const { open } = useShareExperience()
  useEffect(() => { open() }, [open])
  return <Navigate to="/blog" replace />
}

function AppShell() {
  return (
    <div className="min-h-screen noise">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/popular-routes" element={<PopularRoutes />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/share-experience" element={<ShareExperienceRedirect />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<AboutOwner />} />
        <Route path="/admin" element={<AdminAgent />} />
        <Route path="/saved" element={<SavedTrips />} />
        <Route path="/shared/:token" element={<SharedTrip />} />
        {/* If a logged-in user lands on /login (e.g. clicked an old link),
            send them home instead of showing a blank "no route" screen. */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        {/* Catch-all — anything unknown also goes home. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AssistantWidget />
    </div>
  )
}

/**
 * When the user is signed out, almost everything redirects to LoginPage.
 * The single exception is /shared/:token — public share links must work for
 * anyone, even if they have never signed up.
 */
function PublicShell() {
  return (
    <Routes>
      <Route path="/shared/:token" element={<SharedTrip />} />
      <Route path="*" element={<LoginPage />} />
    </Routes>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/20 border-t-green-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading session…</p>
        </div>
      </div>
    )
  }

  // Logged-in users see the full app; logged-out users land on the
  // PublicShell which renders LoginPage for any route except public
  // share links (/shared/:token).
  return (
    <BrowserRouter>
      <ShareExperienceProvider>
        {user ? <AppShell /> : <PublicShell />}
      </ShareExperienceProvider>
    </BrowserRouter>
  )
}
