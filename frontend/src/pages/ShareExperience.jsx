import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  PenLine,
  MapPin,
  Send,
  Loader2,
  CalendarDays,
  Sparkles,
  ChevronLeft,
} from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useExperienceClientId } from '../hooks/useExperienceClientId'
import BlogExperienceCard from '../components/BlogExperienceCard'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ShareExperience() {
  const { user } = useAuth()
  const experienceClientId = useExperienceClientId()
  const [expTitle, setExpTitle] = useState('')
  const [expName, setExpName] = useState('')
  const [expBody, setExpBody] = useState('')
  const [expDest, setExpDest] = useState('')
  const [expVisitMonths, setExpVisitMonths] = useState('')
  const [expSubmitting, setExpSubmitting] = useState(false)
  const [expMessage, setExpMessage] = useState('')
  const [expError, setExpError] = useState('')
  const [experiences, setExperiences] = useState([])
  const [expLoading, setExpLoading] = useState(true)

  const loadExperiences = useCallback(async () => {
    setExpLoading(true)
    setExpError('')
    try {
      const q = experienceClientId
        ? `?client_id=${encodeURIComponent(experienceClientId)}`
        : ''
      const { data } = await api.get(`/blog/experiences${q}`)
      setExperiences(Array.isArray(data?.experiences) ? data.experiences : [])
    } catch (e) {
      setExperiences([])
      if (e?.response?.status && e?.response?.status !== 404) {
        setExpError('Could not load community stories.')
      }
    } finally {
      setExpLoading(false)
    }
  }, [experienceClientId])

  useEffect(() => {
    setExpName((prev) => (user?.name ? user.name : prev))
  }, [user?.name])

  useEffect(() => {
    loadExperiences()
  }, [loadExperiences, user])

  const handleShareExperience = async (e) => {
    e.preventDefault()
    setExpMessage('')
    setExpError('')
    const title = expTitle.trim()
    const display_name = expName.trim()
    const body = expBody.trim()
    const destination = expDest.trim() || undefined
    const visit_months = expVisitMonths.trim() || undefined
    if (display_name.length < 2 || title.length < 4 || body.length < 20) {
      setExpError('Please fill in your name, a title, and a story of at least 20 characters.')
      return
    }
    setExpSubmitting(true)
    try {
      await api.post('/blog/experiences', { title, display_name, body, destination, visit_months })
      setExpMessage('Thanks! Your story is in the list below—others can like, react, and comment.')
      setExpTitle('')
      setExpBody('')
      setExpDest('')
      setExpVisitMonths('')
      if (user?.name) setExpName(user.name)
      else setExpName('')
      await loadExperiences()
    } catch (err) {
      const d = err?.response?.data
      const msg =
        d?.error?.message ||
        (Array.isArray(d?.error?.details) && d?.error?.details[0]?.msg) ||
        err?.message
      setExpError(msg || 'Could not save your experience. Try again in a moment.')
    } finally {
      setExpSubmitting(false)
    }
  }

  return (
    <div className="min-h-[100dvh] page-bg-purple pt-20 sm:pt-24 px-4 sm:px-6 pb-16 sm:pb-20">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <ChevronLeft size={16} className="shrink-0" />
            Back to blog
          </Link>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center gap-2 rounded-full glass border border-cyan-500/30 px-4 py-1.5 mb-4">
            <Sparkles size={16} className="text-amber-300" />
            <span className="text-xs sm:text-sm text-slate-300">Help someone plan their first visit</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white mb-3">
            Add your real experience for new members
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            New travelers often ask which month is best to visit a place and what it is really like. Share
            a destination, the window you would pick again (or skip), and honest field notes so the next
            person can book with confidence.
          </p>
        </div>

        <div className="w-full max-w-4xl mx-auto rounded-3xl glass border border-cyan-500/20 overflow-hidden shadow-xl shadow-cyan-950/30 mb-12 sm:mb-16">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500/50 via-fuchsia-500/40 to-violet-500/50" />
          <div className="p-6 sm:p-9 lg:p-10">
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/25 shrink-0">
                <PenLine className="text-cyan-300" size={22} />
              </div>
              <div className="text-left">
                <h2 className="font-display font-bold text-lg sm:text-xl text-white">Write a field note</h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                  After you post, the list below has <span className="text-slate-400">likes</span>, six{' '}
                  <span className="text-slate-400">emoji reactions</span>, and <span className="text-slate-400">comments</span>.
                </p>
              </div>
            </div>
            <form onSubmit={handleShareExperience} className="mt-6 space-y-4 text-left w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                  <label htmlFor="exp-name" className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Your name
                  </label>
                  <input
                    id="exp-name"
                    type="text"
                    value={expName}
                    onChange={(ev) => setExpName(ev.target.value)}
                    placeholder="How you want to appear"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    maxLength={120}
                    required
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="exp-dest" className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Place you visited
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      id="exp-dest"
                      type="text"
                      value={expDest}
                      onChange={(ev) => setExpDest(ev.target.value)}
                      placeholder="e.g. Spiti, Goa, Munnar"
                      className="w-full rounded-xl bg-white/5 border border-white/10 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      maxLength={120}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="exp-visit-months" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-amber-400" />
                    Best time to go (or months to avoid)
                  </span>
                </label>
                <input
                  id="exp-visit-months"
                  type="text"
                  value={expVisitMonths}
                  onChange={(ev) => setExpVisitMonths(ev.target.value)}
                  placeholder="e.g. Mid March–May; avoid July monsoon if you need clear roads"
                  className="w-full rounded-xl bg-amber-500/5 border border-amber-500/25 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  maxLength={200}
                />
                <p className="text-[10px] text-slate-500 mt-1.5">Helps new members pick the right month or season.</p>
              </div>
              <div>
                <label htmlFor="exp-title" className="block text-xs font-semibold text-slate-400 mb-1.5">
                  One-line summary
                </label>
                <input
                  id="exp-title"
                  type="text"
                  value={expTitle}
                  onChange={(ev) => setExpTitle(ev.target.value)}
                  placeholder="e.g. Manali: when we went and what we would repeat"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  maxLength={200}
                  required
                />
              </div>
              <div>
                <label htmlFor="exp-body" className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Your real experience
                </label>
                <textarea
                  id="exp-body"
                  value={expBody}
                  onChange={(ev) => setExpBody(ev.target.value)}
                  rows={5}
                  placeholder="Minimum 20 characters. Weather, cost range, how long to stay, mistakes to avoid."
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-y min-h-[120px]"
                  maxLength={5000}
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">{expBody.length} / 5000</p>
              </div>
              {expError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100" role="alert">
                  {expError}
                </div>
              )}
              {expMessage && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100" role="status">
                  {expMessage}
                </div>
              )}
              <div>
                <button
                  type="submit"
                  disabled={expSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-600 to-violet-600 text-white text-sm font-semibold px-7 py-3 shadow-lg shadow-cyan-900/30 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {expSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Posting…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Publish to help new members
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto border-t border-white/10 pt-10" id="community-travel-notes">
          <h2 className="font-display font-bold text-2xl text-white mb-1 flex items-center gap-2">
            <User size={24} className="text-cyan-400" />
            Travel notes from the community
          </h2>
          <p className="text-slate-400 text-sm mb-6">Like, react, and comment on any note below.</p>
          {expLoading ? (
            <div className="h-40 rounded-2xl bg-white/5 border border-white/8 animate-pulse" />
          ) : experiences.length === 0 ? (
            <p className="text-slate-500 text-sm py-6">No notes yet—add the first one using the form above.</p>
          ) : (
            <ul className="space-y-5 w-full">
              {experiences.map((x) => (
                <BlogExperienceCard
                  key={x.id}
                  exp={x}
                  clientId={experienceClientId}
                  user={user}
                  onRefresh={loadExperiences}
                  formatDate={formatDate}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
