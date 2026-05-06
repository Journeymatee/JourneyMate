import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
} from 'lucide-react'

import { sendContactMessage } from '../services/contactService'
import PageContainer from '../components/layout/PageContainer'
import { BackLink, Button, Card, Eyebrow, Heading } from '../components/ui'

/* ─── Static topic list ──────────────────────────────────────────── */

const TOPICS = Object.freeze([
  'General enquiry',
  'Bug report',
  'Feature request',
  'Billing & Pricing',
  'Partnership / Business',
  'Media & Press',
  'Other',
])

const CONTACT_INFO = Object.freeze([
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
    value: 'India \uD83C\uDDEE\uD83C\uDDF3',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-100/70 dark:bg-amber-500/10',
    border: 'border-amber-300/60 dark:border-amber-500/20',
  },
])

const QUICK_LINKS = Object.freeze([
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Pricing Plans', to: '/pricing' },
  { label: 'Popular Routes', to: '/popular-routes' },
])

/* ─── Tiny markdown renderer for the AI reply ────────────────────── */

function renderInline(text) {
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

function renderAiReply(text) {
  const safe = String(text || '').trim()
  if (!safe) return null
  const blocks = safe.split(/\n{2,}/)
  return blocks.map((block, bi) => {
    const lines = block.split(/\n/)
    const isList = lines.every((l) => /^\s*([\u2022\-*])\s+/.test(l))
    if (isList) {
      return (
        <ul
          key={bi}
          className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-200"
        >
          {lines.map((l, li) => (
            <li key={li}>{renderInline(l.replace(/^\s*[\u2022\-*]\s+/, ''))}</li>
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

/* ─── Page (orchestrator) ────────────────────────────────────────── */

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

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
    <main className="min-h-[100dvh] page-bg-emerald pt-20 sm:pt-24 pb-16 sm:pb-20">
      <PageContainer size="default">
        <BackLink />

        {/* Header */}
        <div className="text-center mb-12">
          <Eyebrow
            accent="emerald"
            icon={<MessageCircle size={14} />}
            className="mb-6"
          >
            We&apos;d love to hear from you
          </Eyebrow>
          <Heading
            level={1}
            size="xl"
            className="mb-4 !text-slate-900 dark:!text-white"
          >
            <span className="shimmer-emerald">Contact</span> Us
          </Heading>
          <p className="text-slate-700 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Have a question, found a bug, or want to collaborate? Our AI assistant
            replies instantly — a human follows up within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          <ContactSidebar />

          <div className="md:col-span-2 lg:col-span-3">
            {submitted ? (
              <SubmittedState
                form={form}
                result={result}
                onAnother={handleAnother}
              />
            ) : (
              <ContactForm
                form={form}
                onChange={set}
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
              />
            )}
          </div>
        </div>
      </PageContainer>
    </main>
  )
}

/* ─── Private subcomponents ──────────────────────────────────────── */

function ContactSidebar() {
  return (
    <div className="md:col-span-1 lg:col-span-2 space-y-4">
      {CONTACT_INFO.map(({ Icon, label, value, href, color, bg, border }) => (
        <div
          key={label}
          className={`glass rounded-2xl p-5 border ${border} flex items-start gap-4`}
        >
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 ring-1 ring-slate-900/5 dark:ring-white/10`}>
            <Icon size={18} className={color} aria-hidden />
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

      <Card variant="glass" padding="sm" className="!p-5">
        <div className="text-xs text-slate-500 dark:text-slate-500 font-medium uppercase tracking-wider mb-3">
          Quick Links
        </div>
        <div className="space-y-2">
          {QUICK_LINKS.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group py-1"
            >
              <span>{label}</span>
              <ArrowLeft
                size={12}
                className="rotate-180 group-hover:translate-x-1 transition-transform text-slate-400 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-400"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SubmittedState({ form, result, onAnother }) {
  return (
    <Card variant="glass" padding="lg" className="!border-green-300/60 dark:!border-green-500/20 flex flex-col gap-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/10 border border-green-300/70 dark:border-green-500/20 flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-green-600 dark:text-green-400" aria-hidden />
        </div>
        <Heading level={2} size="md" className="mb-2 !text-slate-900 dark:!text-white">
          Message sent!
        </Heading>
        <p className="text-slate-700 dark:text-slate-400 text-sm max-w-md leading-relaxed">
          Thanks{' '}
          <strong className="text-slate-900 dark:text-white">
            {form.name || 'Traveler'}
          </strong>
          . Your message landed in our inbox and we&apos;ve sent an
          AI-generated reply to{' '}
          <span className="text-green-700 dark:text-green-400 font-medium break-all">
            {form.email}
          </span>
          . A human will follow up within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DeliveryBreadcrumb
          ok={result?.ownerNotified}
          icon={<CheckCircle size={12} />}
          okClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          title="Notified our team"
          okText="JourneyMate has received your message."
          pendingText="Saved — we'll see it on the next inbox sync."
        />
        <DeliveryBreadcrumb
          ok={result?.autoReplySent}
          icon={<Sparkles size={12} />}
          okClass="bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300"
          title="AI auto-reply"
          okText={`Sent to ${form.email}.`}
          pendingText="Generated below — email delivery pending."
        />
      </div>

      {result?.aiReply && <AiReplyPreview text={result.aiReply} />}

      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={onAnother}
        className="self-center !rounded-xl !bg-slate-900/[0.06] dark:!bg-white/8 !border-slate-900/10 dark:!border-white/10 !text-slate-900 dark:!text-white hover:!bg-slate-900/[0.1] dark:hover:!bg-white/12"
      >
        Send another message
      </Button>
    </Card>
  )
}

function DeliveryBreadcrumb({ ok, icon, okClass, title, okText, pendingText }) {
  return (
    <div className="rounded-xl border border-slate-900/8 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] p-3 flex items-start gap-2.5">
      <span
        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          ok ? okClass : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
          {title}
        </p>
        <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-300 leading-snug">
          {ok ? okText : pendingText}
        </p>
      </div>
    </div>
  )
}

function AiReplyPreview({ text }) {
  return (
    <div className="rounded-2xl border border-fuchsia-300/60 dark:border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-50/80 to-cyan-50/80 dark:from-fuchsia-500/[0.06] dark:to-cyan-500/[0.04] p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-500 dark:from-fuchsia-500/30 dark:to-pink-500/20 ring-1 ring-white/40 dark:ring-fuchsia-400/30 text-white dark:text-fuchsia-200 flex items-center justify-center shrink-0">
          <Bot size={16} aria-hidden />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-700 dark:text-fuchsia-300">
          JourneyMate AI · Quick answer
        </p>
      </div>
      <div className="space-y-3">{renderAiReply(text)}</div>
      <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-500 italic">
        A human will follow up if your message needs more than a quick answer.
      </p>
    </div>
  )
}

function ContactForm({ form, onChange, onSubmit, loading, error }) {
  return (
    <form
      onSubmit={onSubmit}
      className="glass rounded-3xl p-6 sm:p-8 border border-emerald-300/60 dark:border-emerald-500/15 space-y-5"
    >
      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-300/60 dark:border-rose-400/30 bg-rose-50/80 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Your Name">
          <input
            required
            autoComplete="name"
            className="w-full bg-transparent text-slate-900 dark:text-white text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
            placeholder="Harsh Vardhan"
            value={form.name}
            onChange={onChange('name')}
          />
        </FormField>
        <FormField label="Email Address">
          <input
            required
            type="email"
            autoComplete="email"
            inputMode="email"
            className="w-full bg-transparent text-slate-900 dark:text-white text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
            placeholder="you@example.com"
            value={form.email}
            onChange={onChange('email')}
          />
        </FormField>
      </div>

      <FormField label="Topic">
        <select
          required
          className="w-full bg-transparent text-sm outline-none appearance-none cursor-pointer text-slate-900 dark:text-white"
          value={form.topic}
          onChange={onChange('topic')}
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
      </FormField>

      <FormField label="Message">
        <textarea
          required
          rows={5}
          minLength={10}
          maxLength={4000}
          className="w-full bg-transparent text-slate-900 dark:text-white text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-y leading-relaxed"
          placeholder="Tell us what's on your mind…"
          value={form.message}
          onChange={onChange('message')}
        />
      </FormField>
      <div className="-mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Sparkles size={11} className="text-fuchsia-600 dark:text-fuchsia-400" aria-hidden />
          You&apos;ll get an AI reply in seconds.
        </span>
        <span className="tabular-nums">{form.message.length}/4000</span>
      </div>

      <Button
        type="submit"
        variant="primary"
        accent="emerald"
        size="md"
        fullWidth
        disabled={loading}
        iconLeft={
          loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden />
          ) : (
            <Send size={16} />
          )
        }
        className="!py-3.5 !rounded-2xl"
      >
        {loading ? 'Sending & generating reply…' : 'Send Message'}
      </Button>

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
  )
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
        {label}
      </span>
      <div className="mt-1.5 flex items-center gap-3 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 px-4 py-3 focus-within:border-green-500/60 dark:focus-within:border-green-500/40 transition-colors">
        {children}
      </div>
    </label>
  )
}
