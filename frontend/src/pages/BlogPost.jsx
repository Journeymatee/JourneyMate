import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  User,
  Tag,
  ChevronRight,
  Sparkles,
  CalendarDays,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import api from '../api/client'
import PageHero from '../components/PageHero'
import MarkdownArticle from '../components/MarkdownArticle'
import { useShareExperience } from '../context/ShareExperienceContext'
import { resolveStateCode } from '../utils/getStatePhoto'
import { STATE_PHOTOS } from '../data/statePhotos'

/**
 * Map a blog category to a stable visual accent. Mirrors the category
 * pill colours used on the blog list, so nav between list and detail
 * feels continuous.
 */
const CATEGORY_ACCENT = {
  Comparison:  { hero: 'cyan',    image: '/destinations/dest-varanasi.webp', pill: 'text-blue-300 bg-blue-500/10 border-blue-500/30' },
  Destination: { hero: 'purple',  image: '/destinations/dest-goa.webp',      pill: 'text-purple-300 bg-purple-500/10 border-purple-500/30' },
  Guide:       { hero: 'amber',   image: '/destinations/dest-manali.webp',   pill: 'text-amber-300 bg-amber-500/10 border-amber-500/30' },
  Luxury:      { hero: 'amber',   image: '/destinations/dest-kerala.webp',   pill: 'text-amber-300 bg-amber-500/10 border-amber-500/30' },
  Lifestyle:   { hero: 'rose',    image: '/destinations/dest-jaipur.webp',   pill: 'text-rose-300 bg-rose-500/10 border-rose-500/30' },
}

const FALLBACK = {
  hero: 'cyan',
  image: '/destinations/dest-varanasi.webp',
  pill: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
}

/**
 * Heuristic for picking an accent + hero image based on the post tags
 * when category is missing. Order matters — the first match wins.
 */
const TAG_OVERRIDES = [
  { match: /goa/i,        cat: 'Destination' },
  { match: /varanasi/i,   cat: 'Comparison' },
  { match: /manali/i,     cat: 'Guide' },
  { match: /kerala/i,     cat: 'Luxury' },
  { match: /trains?|rail/i, cat: 'Guide' },
]

/**
 * Hue → tailwind colour token map, used when a state photo is picked but
 * we still want the matching pill colour for the category badge.
 */
const ACCENT_HUE_TO_PILL = {
  cyan:    'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
  rose:    'text-rose-300 bg-rose-500/10 border-rose-500/30',
  amber:   'text-amber-300 bg-amber-500/10 border-amber-500/30',
  emerald: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  sky:     'text-sky-300 bg-sky-500/10 border-sky-500/30',
  indigo:  'text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
  violet:  'text-violet-300 bg-violet-500/10 border-violet-500/30',
  teal:    'text-teal-300 bg-teal-500/10 border-teal-500/30',
  lime:    'text-lime-300 bg-lime-500/10 border-lime-500/30',
}

/**
 * Try to pull a state code out of a post's slug, title or tags.
 * Letting tags vote first means a "kerala-monsoon-guide" still resolves to
 * Kerala even if the canonical title is something quirky.
 */
function statePhotoForPost(post) {
  if (!post) return null
  const candidates = [
    ...(Array.isArray(post.tags) ? post.tags : []),
    post.slug,
    post.title,
  ]
  for (const raw of candidates) {
    const code = resolveStateCode({ query: raw, city: raw })
    if (code && STATE_PHOTOS[code]) return STATE_PHOTOS[code]
  }
  return null
}

function pickAccent(post) {
  // 1. State-iconic photo wins — keeps blog visuals tied to actual geography.
  const sp = statePhotoForPost(post)
  if (sp) {
    return {
      hero: sp.accent || 'cyan',
      image: sp.file,
      pill: ACCENT_HUE_TO_PILL[sp.accent] || ACCENT_HUE_TO_PILL.cyan,
    }
  }
  // 2. Fall back to the curated category accent.
  if (post?.category && CATEGORY_ACCENT[post.category]) return CATEGORY_ACCENT[post.category]
  for (const t of post?.tags || []) {
    const hit = TAG_OVERRIDES.find((r) => r.match.test(t))
    if (hit && CATEGORY_ACCENT[hit.cat]) return CATEGORY_ACCENT[hit.cat]
  }
  return FALLBACK
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
}

function authorInitials(name) {
  return String(name || 'JM')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('')
}

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { open: openShareModal } = useShareExperience()
  const [post, setPost] = useState(null)
  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setPost(null)
    ;(async () => {
      try {
        const [{ data: detail }, { data: list }] = await Promise.all([
          api.get(`/blog/${encodeURIComponent(slug)}`),
          api.get('/blog'),
        ])
        if (!active) return
        if (detail?.post) {
          setPost(detail.post)
        } else {
          setError('Post not found')
        }
        if (Array.isArray(list?.posts)) setAllPosts(list.posts)
      } catch (e) {
        if (!active) return
        const status = e?.response?.status
        if (status === 404) {
          setError('We could not find that post — it may have been unpublished.')
        } else {
          setError(
            e?.response?.data?.error?.message ||
              e?.message ||
              'Could not load this post right now.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
    // re-fetch when the slug changes (related-posts navigation, back/forward)
  }, [slug])

  // Scroll to top on slug change so related-post clicks feel like new pages
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [slug])

  const accent = useMemo(() => pickAccent(post), [post])

  const related = useMemo(() => {
    if (!post) return []
    return allPosts
      .filter((p) => p.slug !== post.slug)
      .filter((p) => p.category === post.category || (p.tags || []).some((t) => (post.tags || []).includes(t)))
      .slice(0, 3)
  }, [allPosts, post])

  if (loading) {
    return (
      <div className="min-h-[100dvh] page-bg-purple">
        <div className="h-[44vh] sm:h-[48vh] w-full bg-white/[0.03] animate-pulse mt-0" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4">
          <div className="h-6 w-1/3 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-[100dvh] page-bg-purple">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-32 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/30 mb-5">
            <AlertTriangle size={26} className="text-rose-300" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-3">
            Post not available
          </h1>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">{error || 'The post you were looking for could not be loaded.'}</p>
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-200 px-5 py-2.5 text-sm font-semibold hover:bg-cyan-500/25"
          >
            <ArrowLeft size={16} />
            Back to all stories
          </button>
        </div>
      </div>
    )
  }

  const wordCount = String(post.body || post.excerpt || '')
    .split(/\s+/)
    .filter(Boolean).length
  const readMins =
    Number(post.read_time_mins) > 0
      ? Number(post.read_time_mins)
      : Math.max(2, Math.round(wordCount / 230))

  return (
    <div className="min-h-[100dvh] page-bg-purple">
      <PageHero
        image={accent.image}
        imagePos="center 40%"
        accent={accent.hero}
        size="default"
        eyebrow={post.category || 'Travel notes'}
        eyebrowIcon={<Tag size={14} />}
        title={post.title}
        subtitle={post.excerpt}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-200/95">
          <span className="inline-flex items-center gap-1.5">
            <User size={14} className="opacity-80" />
            {post.author || 'JourneyMate'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} className="opacity-80" />
            {formatDate(post.published_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} className="opacity-80" />
            {readMins} min read
          </span>
        </div>
      </PageHero>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 -mt-2 sm:-mt-4">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-300 transition-colors mt-6 mb-8"
        >
          <ArrowLeft size={14} />
          All stories
        </Link>

        <div className="glass rounded-3xl border border-white/10 p-5 sm:p-8 lg:p-10">
          {/* Author + tag chips strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 border border-white/15 flex items-center justify-center text-sm font-display font-bold text-white shrink-0">
                {authorInitials(post.author)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{post.author || 'JourneyMate'}</p>
                <p className="text-xs text-slate-400">
                  {formatDate(post.published_at)} · {readMins} min read
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(post.tags || []).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full glass border border-white/10 text-slate-300"
                >
                  <Tag size={10} className="opacity-70" />
                  {t}
                </span>
              ))}
              {post.category && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${accent.pill}`}
                >
                  {post.category}
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          {post.body ? (
            <MarkdownArticle body={post.body} className="mt-2" />
          ) : (
            <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              The full article body is being prepared. Check back soon.
            </div>
          )}

          {/* CTA at bottom of article */}
          <div className="mt-12 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-transparent p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex items-start gap-3 max-w-md">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 shrink-0">
                  <Sparkles size={18} className="text-amber-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Been there? Help the next traveller.</p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Drop your honest field notes — best months, what to skip, what surprised you.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={openShareModal}
                className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold px-5 py-2.5 transition-colors"
              >
                Share your story
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                More like this
              </h2>
              <Link
                to="/blog"
                className="text-sm text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
              >
                Browse all
                <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="group glass rounded-2xl border border-white/10 hover:border-white/25 p-5 flex flex-col transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center text-xl shrink-0">
                      {p.emoji || '✈️'}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${pickAccent(p).pill}`}
                    >
                      {p.category}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-white leading-snug mb-2 group-hover:text-cyan-300 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 flex-1">
                    {p.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-slate-500 inline-flex items-center gap-1.5">
                    <Clock size={11} />
                    {p.read_time_mins || 5} min read
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
