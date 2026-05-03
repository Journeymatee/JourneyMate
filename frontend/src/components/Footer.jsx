import React from 'react'
import { Link } from 'react-router-dom'
import { Twitter, Instagram, Linkedin, Mail, MapPin } from 'lucide-react'
import { APP_BUILD } from '../api/client'

const COMPANY_LINKS = [
  { label: 'How it Works',      to: '/how-it-works' },
  { label: 'Popular Routes',    to: '/popular-routes' },
  { label: 'Blog',              to: '/blog' },
  { label: 'About the Creator', to: '/about' },
]

const SUPPORT_LINKS = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Contact Us', to: '/contact' },
]

const SOCIAL = [
  { Icon: Twitter, href: 'https://x.com/Harsh____06', label: 'Twitter' },
  { Icon: Instagram, href: 'https://www.instagram.com/harshify__14?igsh=MWNhc25vOThtYm9kZg==', label: 'Instagram' },
  { Icon: Linkedin, href: 'https://www.linkedin.com/in/harsh-vardhan-8b406a250?utm_source=share_via&utm_content=profile&utm_medium=member_android', label: 'LinkedIn' },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-slate-950/40">
      <div className="max-w-7xl 3xl:max-w-[1680px] 4xl:max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12">

        {/* Main grid */}
        <div className="py-10 sm:py-14 lg:py-16 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">

          {/* Brand column — spans full width on mobile, half on sm, 1/4 on lg */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group w-fit">
              <img
                src="/logo.svg"
                alt="JourneyMate"
                className="w-9 h-9 rounded-xl shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="font-display font-bold text-white text-base block leading-tight">JourneyMate</span>
                <span className="text-[10px] text-slate-500">Smart Travel Comparison</span>
              </div>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-5 max-w-xs">
              India's smartest travel comparison platform. Compare Silver (budget) vs Gold (luxury) trips across 600+ routes.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-4">
              <MapPin size={12} className="text-green-500/60" />
              <span>Built for Indian travelers, by Indian travelers</span>
            </div>
            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIAL.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl glass border border-white/8 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Explore</h3>
            <ul className="space-y-3">
              {COMPANY_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-slate-500 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-green-500 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Support</h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-slate-500 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-amber-500 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Stay Updated</h3>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              Get new route comparisons and travel tips delivered weekly.
            </p>
            <div className="flex flex-col xs:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-green-500/40 transition-colors">
                <Mail size={14} className="text-slate-500 shrink-0" />
                <input
                  type="email"
                  placeholder="you@email.com"
                  className="w-full bg-transparent text-white text-xs outline-none placeholder:text-slate-600"
                />
              </div>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-xs font-bold transition-all hover:-translate-y-0.5 shadow-lg shadow-green-500/20 whitespace-nowrap"
              >
                Join
              </button>
            </div>
            <p className="text-[10px] text-slate-600 mt-2">No spam, unsubscribe anytime.</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600 text-center sm:text-left">
            © 2026 JourneyMate. All rights reserved by Harsh.
            <span className="hidden sm:inline text-slate-700"> · build {APP_BUILD}</span>
          </p>
          <p className="text-xs text-slate-700 text-center sm:text-right">
            Prices are indicative and subject to availability.
          </p>
        </div>
        {/* Mobile-only build chip — easy to read aloud / screenshot for support */}
        <div className="sm:hidden text-center pb-3">
          <span className="text-[10px] text-slate-700 font-mono">build {APP_BUILD}</span>
        </div>
      </div>
    </footer>
  )
}
