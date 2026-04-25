import React from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin, Mail, Phone,
  Linkedin, Twitter, ArrowLeft, ExternalLink,
} from 'lucide-react'

export default function AboutOwner() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center pt-24 pb-20 px-4 sm:px-6"
      style={{
        background:
          'radial-gradient(ellipse at 25% 10%, rgba(99,102,241,0.18) 0%, transparent 50%),' +
          'radial-gradient(ellipse at 75% 90%, rgba(34,197,94,0.14) 0%, transparent 50%),' +
          'radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 65%),' +
          'linear-gradient(135deg, #0d0d1a 0%, #0a0f0a 50%, #0d0a00 100%)',
      }}
    >
      <div className="w-full max-w-xl mx-auto">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-10 group">
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back to JourneyMate
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-black/60"
          style={{
            background: 'rgba(15,15,25,0.80)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >

          {/* ── Photo section ── */}
          <div className="flex flex-col items-center pt-10 pb-6 px-7 sm:px-10"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(34,197,94,0.14) 50%, rgba(245,158,11,0.12) 100%)',
            }}
          >
            {/* Circular photo */}
            <div className="relative mb-4">
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-green-400/50 via-indigo-500/30 to-amber-400/40 blur-md" />
              <img
                src="/harsh.jpeg"
                alt="Harsh Vardhan Kumar"
                className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover object-top border-4 border-white/15 shadow-2xl shadow-black/50"
                style={{ filter: 'brightness(0.92) saturate(1.15) contrast(1.05)' }}
              />
              {/* Online dot */}
              <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-green-400 border-2 border-slate-950 shadow-lg" />
            </div>

            {/* Platform owner badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/40 shadow-lg"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-green-300 tracking-wide">Platform Owner · JourneyMate</span>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="px-7 sm:px-10 pb-9 sm:pb-12 text-center pt-4">

            {/* Name */}
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight mb-1">
              Harsh Vardhan Kumar
            </h1>

            {/* Role */}
            <p className="text-green-400 font-semibold text-sm sm:text-base mb-5 tracking-wide">
              Java Full Stack Developer &nbsp;·&nbsp; Creator of JourneyMate
            </p>

            {/* Divider */}
            <div className="w-14 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent mx-auto mb-6" />

            {/* About Me */}
            <p className="text-slate-300 text-sm sm:text-[15px] leading-relaxed mb-4 max-w-md mx-auto">
              I'm a full-stack developer from India with a B.Tech in Computer Science from{' '}
              <span className="text-white font-semibold">National Institute of Technology, Agartala</span>.
              Currently working at{' '}
              <span className="text-white font-semibold">GlobalLogic</span> — building scalable backends in{' '}
              <span className="text-amber-400 font-medium">Java / Spring Boot</span> and responsive frontends in{' '}
              <span className="text-purple-400 font-medium">React.js</span>.
            </p>
            <p className="text-slate-400 text-sm sm:text-[15px] leading-relaxed mb-8 max-w-md mx-auto">
              I built <span className="text-green-400 font-semibold">JourneyMate</span> using{' '}
              <span className="text-amber-400 font-medium">Java Full Stack</span> and{' '}
              <span className="text-purple-400 font-medium">React.js</span> — making travel planning
              smarter for every Indian traveler by comparing budget vs luxury options across
              600+ routes, with real prices, interactive maps, and day-by-day itineraries.
            </p>

            {/* Info chips */}
            <div className="flex flex-wrap gap-2 justify-center mb-7">
              {[
                { icon: MapPin, label: 'India 🇮🇳' },
                { icon: Phone,  label: '+91-6207384926' },
                { icon: Mail,   label: 'harshvardhan1412002@gmail.com' },
              ].map(({ icon: Icon, label }) => (
                <span key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <Icon size={11} className="text-slate-500 shrink-0" />
                  {label}
                </span>
              ))}
            </div>

            {/* Social buttons */}
            <div className="flex flex-wrap gap-2.5 justify-center mb-8">
              <a href="https://www.linkedin.com/in/harsh-vardhan-8b406a250"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 text-xs font-semibold transition-all hover:-translate-y-0.5">
                <Linkedin size={13} /> LinkedIn
              </a>
              <a href="https://x.com/Harsh____06"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/12 text-slate-300 hover:text-white hover:border-white/25 text-xs font-semibold transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Twitter size={13} /> Twitter / X
              </a>
              <a href="https://www.instagram.com/harshify__14"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-300 hover:bg-pink-500/20 text-xs font-semibold transition-all hover:-translate-y-0.5">
                <ExternalLink size={13} /> Instagram
              </a>
              <a href="mailto:harshvardhan1412002@gmail.com"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 hover:bg-green-500/20 text-xs font-semibold transition-all hover:-translate-y-0.5">
                <Mail size={13} /> Email me
              </a>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-white/6 mb-7" />

            {/* CTA */}
            <Link to="/"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-green-500/25 transition-all hover:-translate-y-0.5">
              ✈️ &nbsp;Try JourneyMate
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
