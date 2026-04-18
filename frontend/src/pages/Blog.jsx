import React, { useState } from 'react'
import { Clock, Tag, ArrowRight, BookOpen, TrendingUp, User } from 'lucide-react'

const POSTS = [
  {
    id: 1,
    slug: 'silver-vs-gold-varanasi',
    title: 'Silver vs Gold: The Complete Varanasi Guide',
    excerpt: 'Can you truly experience Varanasi on a budget — or does the ghats experience demand a luxury price tag? We tested both. Here\'s the honest comparison.',
    category: 'Comparison',
    categoryColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    readTime: '8 min read',
    date: 'Apr 12, 2026',
    author: 'Priya Sharma',
    emoji: '🕉️',
    tags: ['Varanasi', 'Budget Travel', 'Luxury Travel'],
    featured: true,
  },
  {
    id: 2,
    slug: 'goa-budget-tips',
    title: '15 Tips to Stretch Your Goa Budget Further',
    excerpt: 'Goa doesn\'t have to be expensive. From feni to fish curry, beach shacks to hidden coves — here are the insider moves to make the most of every rupee.',
    category: 'Tips & Tricks',
    categoryColor: 'text-green-400 bg-green-500/10 border-green-500/20',
    readTime: '6 min read',
    date: 'Apr 8, 2026',
    author: 'Rahul Menon',
    emoji: '🏖️',
    tags: ['Goa', 'Budget Tips', 'Food'],
  },
  {
    id: 3,
    slug: 'manali-monsoon-guide',
    title: 'Why Manali in Monsoon is Underrated',
    excerpt: 'Everyone visits Manali in summer. But the monsoon months bring lush valleys, zero crowds, and prices up to 40% lower. Here\'s what to expect.',
    category: 'Destination',
    categoryColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    readTime: '5 min read',
    date: 'Apr 5, 2026',
    author: 'Divya Krishnan',
    emoji: '🏔️',
    tags: ['Manali', 'Offseason', 'Mountains'],
  },
  {
    id: 4,
    slug: 'india-train-travel-guide',
    title: 'The Ultimate Indian Train Travel Guide for 2026',
    excerpt: 'AC 3-tier vs Sleeper vs Vande Bharat — which class fits your trip? This comprehensive guide covers booking, comfort, etiquette, and hidden tips.',
    category: 'Guide',
    categoryColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    readTime: '12 min read',
    date: 'Mar 28, 2026',
    author: 'Arjun Patel',
    emoji: '🚂',
    tags: ['Trains', 'Budget Travel', 'How-to'],
    featured: true,
  },
  {
    id: 5,
    slug: 'top-10-heritage-hotels',
    title: 'Top 10 Heritage Hotels in India Worth the Splurge',
    excerpt: 'If you\'re going Gold, these palace conversions and heritage properties will make your trip utterly unforgettable. Curated from across Rajasthan, Kerala, and the Himalayas.',
    category: 'Luxury',
    categoryColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    readTime: '9 min read',
    date: 'Mar 20, 2026',
    author: 'Meera Nair',
    emoji: '🏛️',
    tags: ['Luxury', 'Hotels', 'Rajasthan'],
  },
  {
    id: 6,
    slug: 'digital-nomad-india',
    title: 'India\'s Best Cities for Digital Nomads in 2026',
    excerpt: 'Fast WiFi, coworking spaces, cafe culture, and low cost of living. These five Indian cities are quietly becoming hotspots for location-independent workers.',
    category: 'Lifestyle',
    categoryColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    readTime: '7 min read',
    date: 'Mar 15, 2026',
    author: 'Karan Desai',
    emoji: '💻',
    tags: ['Remote Work', 'Nomad Life', 'Cities'],
  },
]

const CATEGORIES = ['All', 'Comparison', 'Tips & Tricks', 'Destination', 'Guide', 'Luxury', 'Lifestyle']

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [hoveredId, setHoveredId] = useState(null)

  const filtered = activeCategory === 'All'
    ? POSTS
    : POSTS.filter((p) => p.category === activeCategory)

  const featured = POSTS.filter((p) => p.featured)

  return (
    <div className="min-h-[100dvh] mesh-bg pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-6">
            <BookOpen size={14} className="text-purple-400" />
            <span className="text-sm text-slate-400 font-medium">Stories, guides & travel wisdom</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-4 leading-tight">
            Travel <span className="shimmer-silver">Stories</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Real insights, honest comparisons, and practical tips from India's travel community.
          </p>
        </div>

        {/* Featured posts */}
        {activeCategory === 'All' && (
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
                      <h3 className="font-display font-bold text-lg sm:text-xl text-white leading-snug group-hover:text-green-300 transition-colors">
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
                      <div className={`flex items-center gap-1.5 text-xs font-semibold text-green-400 transition-transform ${hoveredId === post.id ? 'translate-x-1' : ''}`}>
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
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent shadow-lg shadow-green-500/20'
                  : 'glass border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* All posts grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map((post) => (
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
                <h3 className="font-display font-bold text-base sm:text-lg text-white mb-3 leading-snug group-hover:text-green-300 transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 flex-1">
                  {post.excerpt.slice(0, 120)}…
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.map((t) => (
                    <span key={t} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full glass border border-white/8 text-slate-500">
                      <Tag size={9} />{t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-white/6 pt-3">
                  <span className="flex items-center gap-1.5"><User size={11} />{post.author}</span>
                  <span className="flex items-center gap-1.5"><Clock size={11} />{post.readTime}</span>
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
