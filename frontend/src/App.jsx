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

  const handleSearch = async (from, to, days = 5, opts = {}) => {
    const nextTripType = opts && Object.prototype.hasOwnProperty.call(opts, 'tripType')
      ? (opts.tripType ?? null)
      : tripType
    const nextVibes = opts && Array.isArray(opts.vibes) ? opts.vibes : vibes
    setTripType(nextTripType)
    setVibes(nextVibes)
    setSearchParams({ from, to, days })
    setSearchError('')
    setView('loading')
    try {
      const data = await searchTrip(from, to, { days, tripType: nextTripType, vibes: nextVibes })
      setTripData(data)
      setView('comparison')
    } catch (error) {
      console.error('Search failed:', error)
      if (error.response?.status === 401) {
        logout()
        return
      }
      setSearchError(tripErrorMessage(error) || 'Search failed — is the API running?')
      setView('home')
    }
  }

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
      try {
        setSearchParams((s) => ({ ...s, from, to, days: n }))
        const data = await searchTrip(from, to, { days: n, tripType, vibes })
        setTripData(data)
      } catch (error) {
        console.error('Refetch failed:', error)
        if (error.response?.status === 401) {
          logout()
          return
        }
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
          <div className="pointer-events-auto max-w-lg w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 text-center shadow-xl">
            {searchError}
            {view === 'comparison' && (
              <button
                type="button"
                onClick={() => setSearchError('')}
                className="block w-full mt-2 text-xs text-slate-400 hover:text-white underline"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {view === 'home' && (
        <>
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
        <LoadingSpinner from={searchParams.from} to={searchParams.to} />
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

  return (
    <BrowserRouter>
      <ShareExperienceProvider>
        {user ? <AppShell /> : <PublicShell />}
      </ShareExperienceProvider>
    </BrowserRouter>
  )
}
