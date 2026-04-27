import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Tag, ArrowRight, BookOpen, TrendingUp, User, Sparkles, ChevronRight } from 'lucide-react'
import api, { API_BASE_URL } from '../api/client'

function categoryStyle(category) {
  const c = String(category || '')
  const map = {
    Comparison: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    Destination: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    Guide: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Luxury: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
    Lifestyle: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  }
  return map[c] || 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20'
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

function mapPost(p) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    categoryColor: categoryStyle(p.category),
    readTime: `${p.read_time_mins} min read`,
    date: formatDate(p.published_at),
    author: p.author,
    emoji: p.emoji,
    tags: Array.isArray(p.tags) ? p.tags : [],
    featured: Boolean(p.is_featured),
  }
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [hoveredId, setHoveredId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [posts, setPosts] = useState([])

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/blog')
        if (!active) return
        const list = Array.isArray(data?.posts) ? data.posts.map(mapPost) : []
        setPosts(list)
      } catch (e) {
        if (!active) return
        const status = e?.response?.status
        const server = e?.response?.data?.error?.message || e?.response?.data?.message
        if (!e?.response) {
          setError(
            "Can't reach the API. In dev, run the backend on port 8080 and the Vite dev server (proxy forwards /api to the backend)."
          )
        } else if (status === 404) {
          const hint = import.meta.env.DEV
            ? `Local: stop the old process on port 8080, then in backend/ run npm run dev. Open http://127.0.0.1:8080/api/blog in the browser; you should see JSON with a "posts" field. (Request base: ${API_BASE_URL}.)`
            : 'Production: push this repo, redeploy the hosted backend, then set VITE_API_URL on the frontend to the API base that ends in /api (e.g. https://your-api.vercel.app/api), redeploy the frontend, and try again.'
          setError(
            `The server returned 404 for the blog list — it is an older or different API that does not register GET /api/blog. ${hint}`
          )
        } else {
          setError(server || `Could not load blog posts (HTTP ${status || 'error'}).`)
        }
        setPosts([])
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(() => {
    const set = new Set()
    for (const p of posts) {
      if (p.category) set.add(p.category)
    }
    return ['All', ...Array.from(set).sort()]
  }, [posts])

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return posts
    return posts.filter((p) => p.category === activeCategory)
  }, [activeCategory, posts])

  const featured = useMemo(() => posts.filter((p) => p.featured), [posts])

  return (
    <div className="min-h-[100dvh] page-bg-purple pt-20 sm:pt-24 px-4 sm:px-6 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto pb-6 sm:pb-10">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 mb-6">
            <BookOpen size={14} className="text-purple-400" />
            <span className="text-sm text-slate-300 font-medium">Stories, guides & travel wisdom</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-tight">
            Travel <span className="shimmer-purple">Stories</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-6">
            Real insights, honest comparisons, and practical tips — powered by your JourneyMate content system.
          </p>
          <Link
            to="/share-experience"
            className="group inline-flex items-center gap-2 sm:gap-3 rounded-2xl border border-cyan-500/35 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 px-4 sm:px-5 py-3 sm:py-3.5 text-left max-w-xl mx-auto w-full sm:w-auto transition-all hover:border-cyan-400/50 hover:from-cyan-500/15"
          >
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-400/30 shrink-0">
              <Sparkles size={18} className="text-amber-200" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-white">Add your real experience for new members</p>
              <p className="text-xs text-slate-500 mt-0.5">Best months to visit, field notes, likes & comments — on a dedicated page</p>
            </div>
            <ChevronRight size={20} className="text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 text-center">
            {error}
          </div>
        )}

        {/* Featured posts */}
        {!loading && activeCategory === 'All' && featured.length > 0 && (
          <div className="mb-12 sm:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={18} className="text-amber-400" />
              <h2 className="font-display font-bold text-xl text-white">Featured</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {featured.map((post) => (
                <div
                  key={post.id}
                  className="glass rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 group cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl flex flex-col"
                  onMouseEnter={() => setHoveredId(post.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="bg-gradient-to-br from-white/5 to-transparent p-6 sm:p-8 border-b border-white/6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl glass border border-white/10 flex items-center justify-center text-3xl shrink-0">
                      {post.emoji}
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${post.categoryColor} inline-block mb-2`}>
                        {post.category}
                      </span>
                      <h3 className="font-display font-bold text-lg sm:text-xl text-white leading-snug group-hover:text-purple-300 transition-colors">
                        {post.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col flex-1">
                    <p className="text-slate-400 text-sm leading-relaxed mb-5 flex-1">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <User size={12} />
                        <span>{post.author}</span>
                        <Clock size={12} />
                        <span>{post.readTime}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-semibold text-purple-400 transition-transform ${hoveredId === post.id ? 'translate-x-1' : ''}`}>
                        Read <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8 sm:mb-10">
          {loading ? (
            <div className="h-9 w-64 rounded-full bg-white/5 border border-white/10 animate-pulse" />
          ) : (
            categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white border-transparent shadow-lg shadow-purple-500/20'
                    : 'glass border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))
          )}
        </div>

        {/* All posts grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass rounded-3xl border border-white/8 overflow-hidden">
                  <div className="h-40 bg-white/5 animate-pulse" />
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-5/6 bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
              ))
            : filtered.map((post) => (
                <div
                  key={post.id}
                  className="glass rounded-3xl overflow-hidden border border-white/8 hover:border-white/15 group cursor-pointer transition-all duration-300 hover:scale-[1.01] flex flex-col"
                >
                  <div className="p-5 sm:p-6 border-b border-white/6 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl glass border border-white/10 flex items-center justify-center text-2xl shrink-0">
                      {post.emoji}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${post.categoryColor}`}>
                      {post.category}
                    </span>
                  </div>
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <h3 className="font-display font-bold text-base sm:text-lg text-white mb-3 leading-snug group-hover:text-purple-300 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {post.tags.map((t) => (
                        <span key={t} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full glass border border-white/8 text-slate-500">
                          <Tag size={9} />
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/6 pt-3">
                      <span className="flex items-center gap-1.5">
                        <User size={11} />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={11} />
                        {post.readTime}
                      </span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  )
}
