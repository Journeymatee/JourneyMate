import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
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
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import Pricing from './pages/Pricing'
import ContactUs from './pages/ContactUs'
import AboutOwner from './pages/AboutOwner'
import ChatbotWidget from './components/ChatbotWidget'
import { useAuth } from './context/AuthContext'
import { searchTrip } from './services/travelService'

function HomePage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [view, setView] = useState('home')
  const [tripData, setTripData] = useState(null)
  const [searchParams, setSearchParams] = useState({ from: '', to: '' })
  const [searchError, setSearchError] = useState('')

  // Handle auto-search triggered from PopularRoutes page
  useEffect(() => {
    const state = location.state
    if (state?.autoSearch && state.from && state.to) {
      // Clear the state so back-nav doesn't re-trigger
      navigate('/', { replace: true, state: {} })
      handleSearch(state.from, state.to)
    }
  }, []) // eslint-disable-line

  const handleSearch = async (from, to) => {
    setSearchParams({ from, to })
    setSearchError('')
    setView('loading')
    try {
      const data = await searchTrip(from, to)
      setTripData(data)
      setView('comparison')
    } catch (error) {
      console.error('Search failed:', error)
      if (error.response?.status === 401) {
        logout()
        return
      }
      const msg = error.response?.data?.error || error.message || 'Search failed — is the API running?'
      setSearchError(msg)
      setView('home')
    }
  }

  const handleBack = () => {
    setView('home')
    setTripData(null)
    setSearchError('')
  }

  return (
    <>
      {searchError && view === 'home' && (
        <div className="fixed top-20 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
          <div className="pointer-events-auto max-w-lg w-full rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 text-center shadow-xl">
            {searchError}
          </div>
        </div>
      )}

      {view === 'home' && (
        <>
          <HeroSearch onSearch={handleSearch} loading={false} />
          <FeaturesSection />
          <Footer />
        </>
      )}

      {view === 'loading' && (
        <LoadingSpinner from={searchParams.from} to={searchParams.to} />
      )}

      {view === 'comparison' && tripData && (
        <>
          <ComparisonPage tripData={tripData} onBack={handleBack} />
          <Footer />
        </>
      )}
    </>
  )
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
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<AboutOwner />} />
      </Routes>
      <ChatbotWidget />
    </div>
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

  if (!user) return <LoginPage />

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
