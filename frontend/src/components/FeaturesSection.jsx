import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, Shield, BarChart3, Clock, Globe, Heart, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Instant Compare',
    desc: 'See Silver vs Gold plans side-by-side in under 3 seconds. No endless scrolling.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    glow: 'group-hover:shadow-yellow-500/10',
    to: '/how-it-works',
  },
  {
    icon: BarChart3,
    title: 'Price Transparency',
    desc: 'Every rupee explained. Know exactly what you\'re paying for at each tier.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    glow: 'group-hover:shadow-blue-500/10',
    to: '/how-it-works',
  },
  {
    icon: Clock,
    title: 'Day-by-Day Plans',
    desc: 'Full itinerary for both budget and luxury — so you know exactly how each trip unfolds.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    glow: 'group-hover:shadow-purple-500/10',
    to: '/how-it-works',
  },
  {
    icon: Shield,
    title: 'Best Price Guarantee',
    desc: 'Silver tier prices are always the lowest available. We check 20+ booking platforms.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    glow: 'group-hover:shadow-green-500/10',
    to: '/how-it-works',
  },
  {
    icon: Globe,
    title: '600+ Routes',
    desc: 'From Hyderabad to the Himalayas — we cover all major Indian travel routes and villages.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    glow: 'group-hover:shadow-cyan-500/10',
    to: '/popular-routes',
  },
  {
    icon: Heart,
    title: 'Curated Experiences',
    desc: 'Gold tier isn\'t just expensive — it\'s thoughtfully curated for maximum memory-making.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    glow: 'group-hover:shadow-rose-500/10',
    to: '/blog',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-12 sm:py-20 lg:py-24 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-6">
            <span className="text-sm text-slate-400 font-medium">Why JourneyMate?</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white mb-4 leading-tight">
            Travel smarter,<br className="hidden sm:block" /> not harder
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            We built the tool we wished existed when planning our own trips across India.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((feat, i) => {
            const Icon = feat.icon
            return (
              <Link
                key={feat.title}
                to={feat.to}
                className={`group glass rounded-2xl p-5 sm:p-6 border ${feat.border} hover:border-opacity-60 hover:-translate-y-1.5 hover:shadow-xl ${feat.glow} transition-all duration-300 cursor-pointer flex flex-col`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-2xl ${feat.bg} border ${feat.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={20} className={feat.color} />
                </div>

                {/* Text */}
                <h3 className="font-display font-bold text-base sm:text-lg text-white mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1">{feat.desc}</p>

                {/* Learn more */}
                <div className={`flex items-center gap-1.5 mt-4 text-xs font-semibold ${feat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                  <span>Learn more</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}
