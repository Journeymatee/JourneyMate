import React, { useState } from 'react'
import {
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  ArrowLeft,
  Send,
  CheckCircle,
  Sparkles,
  AlertTriangle,
  Bot,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { sendContactMessage } from '../services/contactService'

const TOPICS = [
  'General enquiry',
  'Bug report',
  'Feature request',
  'Billing & Pricing',
  'Partnership / Business',
  'Media & Press',
  'Other',
]

/**
 * Convert the AI reply (which uses light markdown — **bold** + bullet lines)
 * into a small set of paragraphs/lists for inline display. We deliberately
 * avoid pulling in a markdown library: the assistant's output is already
 * very simple, and a tiny renderer keeps the page fast.
 */
function renderAiReply(text) {
  const safe = String(text || '').trim()
  if (!safe) return null
  const blocks = safe.split(/\n{2,}/)
  return blocks.map((block, bi) => {
    const lines = block.split(/\n/)
    const isList = lines.every((l) => /^\s*([•\-\*])\s+/.test(l))
    if (isList) {
      return (
        <ul
          key={bi}
          className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-200"
        >
          {lines.map((l, li) => (
            <li key={li}>{renderInline(l.replace(/^\s*[•\-\*]\s+/, ''))}</li>
          ))}
        </ul>
      )
    }
    return (
      <p
        key={bi}
        className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed"
      >
        {lines.map((l, li) => (
          <React.Fragment key={li}>
            {renderInline(l)}
            {li < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    )
  })
}

function renderInline(text) {
  // Replace **bold** with a styled <strong>. Everything else stays plain.
  const parts = String(text || '').split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={i} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await sendContactMessage(form)
      setResult(data)
      setSubmitted(true)
    } catch (err) {
      setError(err?.message || 'Could not send your message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnother = () => {
    setSubmitted(false)
    setResult(null)
    setError(null)
    setForm({ name: '', email: '', topic: '', message: '' })
  }

  return (
    <div className="min-h-[100dvh] page-bg-emerald pt-20 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 group active:scale-95 touch-manipulation"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to JourneyMate
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-400/60 dark:border-emerald-500/30 mb-6">
            <MessageCircle size={14} className="text-emerald-700 dark:text-emerald-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
              We&apos;d love to hear from you
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 dark:text-white mb-4">
            <span className="shimmer-emerald">Contact</span> Us
          </h1>
          <p className="text-slate-700 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Have a question, found a bug, or want to collaborate? Our AI assistant
            replies instantly — a human follows up within 24 hours.
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
                color: 'text-green-700 dark:text-green-400',
                bg: 'bg-green-100/70 dark:bg-green-500/10',
                border: 'border-green-300/60 dark:border-green-500/20',
              },
              {
                Icon: Bot,
                label: 'AI Auto-reply',
                value: 'Instant — within seconds',
                color: 'text-fuchsia-700 dark:text-fuchsia-400',
                bg: 'bg-fuchsia-100/70 dark:bg-fuchsia-500/10',
                border: 'border-fuchsia-300/60 dark:border-fuchsia-500/20',
              },
              {
                Icon: Clock,
                label: 'Human Response Time',
                value: 'Usually within 24 hours',
                color: 'text-blue-700 dark:text-blue-400',
                bg: 'bg-blue-100/70 dark:bg-blue-500/10',
                border: 'border-blue-300/60 dark:border-blue-500/20',
              },
              {
                Icon: MapPin,
                label: 'Based In',
                value: 'India 🇮🇳',
                color: 'text-amber-700 dark:text-amber-400',
                bg: 'bg-amber-100/70 dark:bg-amber-500/10',
                border: 'border-amber-300/60 dark:border-amber-500/20',
              },
            ].map(({ Icon, label, value, href, color, bg, border }) => (
              <div
                key={label}
                className={`glass rounded-2xl p-5 border ${border} flex items-start gap-4`}
              >
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 ring-1 ring-slate-900/5 dark:ring-white/10`}>
                  <Icon size={18} className={color} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 dark:text-slate-500 font-medium uppercase tracking-wider mb-1">
                    {label}
                  </div>
                  {href ? (
                    <a
                      href={href}
                      className={`text-sm font-medium ${color} hover:underline break-all`}
                    >
                      {value}
                    </a>
                  ) : (
                    <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {value}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Quick links */}
            <div className="glass rounded-2xl p-5 border border-slate-900/8 dark:border-white/8">
              <div className="text-xs text-slate-500 dark:text-slate-500 font-medium uppercase tracking-wider mb-3">
                Quick Links
              </div>
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
                    className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group py-1"
                  >
                    <span>{label}</span>
                    <ArrowLeft
                      size={12}
                      className="rotate-180 group-hover:translate-x-1 transition-transform text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-400"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form / success state */}
          <div className="md:col-span-2 lg:col-span-3">
            {submitted ? (
              <div className="glass rounded-3xl p-6 sm:p-8 border border-green-300/60 dark:border-green-500/20 flex flex-col gap-6">
                {/* Confirmation header */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/10 border border-green-300/70 dark:border-green-500/20 flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-2">
                    Message sent!
                  </h2>
                  <p className="text-slate-700 dark:text-slate-400 text-sm max-w-md leading-relaxed">
                    Thanks <strong className="text-slate-900 dark:text-white">{form.name || 'Traveler'}</strong>.
                    Your message landed in our inbox and we&apos;ve sent an AI-generated
                    reply to{' '}
                    <span className="text-green-700 dark:text-green-400 font-medium break-all">
                      {form.email}
                    </span>
                    . A human will follow up within 24 hours.
                  </p>
                </div>

                {/* Delivery breadcrumbs — concrete proof of what happened */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-900/8 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] p-3 flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        result?.ownerNotified
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                      }`}
                    >
                      <CheckCircle size={12} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                        Notified our team
                      </p>
                      <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300 leading-snug">
                        {result?.ownerNotified
                          ? 'JourneyMate has received your message.'
                          : 'Saved — we\'ll see it on the next inbox sync.'}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-900/8 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] p-3 flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        result?.autoReplySent
                          ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                      }`}
                    >
                      <Sparkles size={12} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                        AI auto-reply
                      </p>
                      <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300 leading-snug">
                        {result?.autoReplySent
                          ? `Sent to ${form.email}.`
                          : 'Generated below — email delivery pending.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inline AI preview */}
                {result?.aiReply && (
                  <div className="rounded-2xl border border-fuchsia-300/60 dark:border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-50/80 to-cyan-50/80 dark:from-fuchsia-500/[0.06] dark:to-cyan-500/[0.04] p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-500 dark:from-fuchsia-500/30 dark:to-pink-500/20 ring-1 ring-white/40 dark:ring-fuchsia-400/30 text-white dark:text-fuchsia-200 flex items-center justify-center shrink-0">
                        <Bot size={16} />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-700 dark:text-fuchsia-300">
                        JourneyMate AI · Quick answer
                      </p>
                    </div>
                    <div className="space-y-3">{renderAiReply(result.aiReply)}</div>
                    <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-500 italic">
                      A human will follow up if your message needs more than a quick answer.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAnother}
                  className="self-center px-6 py-2.5 rounded-xl bg-slate-900/[0.06] dark:bg-white/8 border border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-white text-sm font-semibold hover:bg-slate-900/[0.1] dark:hover:bg-white/12 transition-all active:scale-[0.97] touch-manipulation"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="glass rounded-3xl p-6 sm:p-8 border border-emerald-300/60 dark:border-emerald-500/15 space-y-5"
              >
                {error && (
                  <div className="flex items-start gap-2.5 rounded-2xl border border-rose-300/60 dark:border-rose-400/30 bg-rose-50/80 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span className="leading-snug">{error}</span>
                  </div>
                )}

                {/* Name + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
                      Your Name
                    </span>
                    <div className="mt-1.5 flex items-center gap-3 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 px-4 py-3 focus-within:border-green-500/60 dark:focus-within:border-green-500/40 transition-colors">
                      <input
                        required
                        autoComplete="name"
                        className="w-full bg-transparent text-slate-900 dark:text-white text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        placeholder="Harsh Vardhan"
                        value={form.name}
                        onChange={set('name')}
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
                      Email Address
                    </span>
                    <div className="mt-1.5 flex items-center gap-3 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 px-4 py-3 focus-within:border-green-500/60 dark:focus-within:border-green-500/40 transition-colors">
                      <input
                        required
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        className="w-full bg-transparent text-slate-900 dark:text-white text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={set('email')}
                      />
                    </div>
                  </label>
                </div>

                {/* Topic */}
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
                    Topic
                  </span>
                  <div className="mt-1.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 px-4 py-3 focus-within:border-green-500/60 dark:focus-within:border-green-500/40 transition-colors">
                    <select
                      required
                      className="w-full bg-transparent text-sm outline-none appearance-none cursor-pointer text-slate-900 dark:text-white"
                      value={form.topic}
                      onChange={set('topic')}
                    >
                      <option value="" disabled>
                        Select a topic…
                      </option>
                      {TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>

                {/* Message */}
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
                    Message
                  </span>
                  <div className="mt-1.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 px-4 py-3 focus-within:border-green-500/60 dark:focus-within:border-green-500/40 transition-colors">
                    <textarea
                      required
                      rows={5}
                      minLength={10}
                      maxLength={4000}
                      className="w-full bg-transparent text-slate-900 dark:text-white text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-y leading-relaxed"
                      placeholder="Tell us what's on your mind…"
                      value={form.message}
                      onChange={set('message')}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Sparkles size={11} className="text-fuchsia-600 dark:text-fuchsia-400" />
                      You&apos;ll get an AI reply in seconds.
                    </span>
                    <span className="tabular-nums">
                      {form.message.length}/4000
                    </span>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-green-500/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] touch-manipulation"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending & generating reply…</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-slate-500 dark:text-slate-600">
                  By submitting, you agree to our{' '}
                  <Link
                    to="/privacy"
                    className="text-slate-700 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 underline-offset-2 hover:underline transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
