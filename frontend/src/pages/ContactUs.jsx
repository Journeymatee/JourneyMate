import React, { useState } from 'react'
import { Mail, MessageCircle, MapPin, Clock, ArrowLeft, Send, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const TOPICS = [
  'General enquiry',
  'Bug report',
  'Feature request',
  'Billing & Pricing',
  'Partnership / Business',
  'Media & Press',
  'Other',
]

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate sending — in production, POST to your API
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
  }

  return (
    <div className="min-h-[100dvh] page-bg-emerald pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to JourneyMate
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/30 mb-6">
            <MessageCircle size={14} className="text-emerald-400" />
            <span className="text-sm text-slate-300 font-medium">We'd love to hear from you</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">
            <span className="shimmer-emerald">Contact</span> Us
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Have a question, found a bug, or want to collaborate? We typically respond within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">

          {/* Contact info sidebar */}
          <div className="md:col-span-1 lg:col-span-2 space-y-4">
            {[
              {
                Icon: Mail,
                label: 'Email',
                value: 'harshvardhan1412002@gmail.com',
                href: 'mailto:harshvardhan1412002@gmail.com',
                color: 'text-green-400',
                bg: 'bg-green-500/10',
                border: 'border-green-500/20',
              },
              {
                Icon: Clock,
                label: 'Response Time',
                value: 'Usually within 24 hours',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20',
              },
              {
                Icon: MapPin,
                label: 'Based In',
                value: 'India 🇮🇳',
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
              },
            ].map(({ Icon, label, value, href, color, bg, border }) => (
              <div key={label} className={`glass rounded-2xl p-5 border ${border} flex items-start gap-4`}>
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</div>
                  {href ? (
                    <a href={href} className={`text-sm font-medium ${color} hover:underline break-all`}>{value}</a>
                  ) : (
                    <div className="text-sm text-slate-300 font-medium">{value}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Quick links */}
            <div className="glass rounded-2xl p-5 border border-white/8">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">Quick Links</div>
              <div className="space-y-2">
                {[
                  { label: 'Privacy Policy', to: '/privacy' },
                  { label: 'Terms of Service', to: '/terms' },
                  { label: 'Pricing Plans', to: '/pricing' },
                  { label: 'Popular Routes', to: '/popular-routes' },
                ].map(({ label, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className="flex items-center justify-between text-sm text-slate-400 hover:text-white transition-colors group py-1"
                  >
                    <span>{label}</span>
                    <ArrowLeft size={12} className="rotate-180 group-hover:translate-x-1 transition-transform text-slate-600 group-hover:text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="md:col-span-2 lg:col-span-3">
            {submitted ? (
              <div className="glass rounded-3xl p-8 sm:p-12 border border-green-500/20 flex flex-col items-center text-center h-full justify-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
                  <CheckCircle size={32} className="text-green-400" />
                </div>
                <h2 className="font-display font-bold text-2xl text-white mb-3">Message Sent!</h2>
                <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-6">
                  Thanks for reaching out, <strong className="text-white">{form.name || 'Traveler'}</strong>. We'll get back to you at <span className="text-green-400">{form.email}</span> within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', topic: '', message: '' }) }}
                  className="px-6 py-2.5 rounded-xl bg-white/8 border border-white/10 text-white text-sm font-semibold hover:bg-white/12 transition-all"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 sm:p-8 border border-emerald-500/15 space-y-5">
                {/* Name + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Name</span>
                    <div className="mt-1.5 flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus-within:border-green-500/40 transition-colors">
                      <input
                        required
                        className="w-full bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
                        placeholder="Harsh Vardhan"
                        value={form.name}
                        onChange={set('name')}
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</span>
                    <div className="mt-1.5 flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus-within:border-green-500/40 transition-colors">
                      <input
                        required
                        type="email"
                        className="w-full bg-transparent text-white text-sm outline-none placeholder:text-slate-600"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={set('email')}
                      />
                    </div>
                  </label>
                </div>

                {/* Topic */}
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Topic</span>
                  <div className="mt-1.5 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus-within:border-green-500/40 transition-colors">
                    <select
                      required
                      className="w-full bg-transparent text-white text-sm outline-none appearance-none cursor-pointer"
                      value={form.topic}
                      onChange={set('topic')}
                      style={{ color: form.topic ? 'white' : '#475569' }}
                    >
                      <option value="" disabled style={{ background: '#0a0a0f', color: '#94a3b8' }}>Select a topic…</option>
                      {TOPICS.map((t) => (
                        <option key={t} value={t} style={{ background: '#0a0a0f', color: 'white' }}>{t}</option>
                      ))}
                    </select>
                  </div>
                </label>

                {/* Message */}
                <label className="block">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</span>
                  <div className="mt-1.5 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus-within:border-green-500/40 transition-colors">
                    <textarea
                      required
                      rows={5}
                      className="w-full bg-transparent text-white text-sm outline-none placeholder:text-slate-600 resize-none"
                      placeholder="Tell us what's on your mind…"
                      value={form.message}
                      onChange={set('message')}
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-green-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-slate-600">
                  By submitting, you agree to our{' '}
                  <Link to="/privacy" className="text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
