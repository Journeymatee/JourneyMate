import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ShieldCheck,
  Send,
  Loader2,
  Sparkles,
  Database,
  ChevronDown,
  Users,
  Receipt,
  IndianRupee,
  MessageSquare,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { Navigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

const SUGGESTED_QUESTIONS = [
  'How many users signed up this week?',
  'Top 5 destinations in the last 30 days',
  'Show me the last 10 bookings',
  'Revenue this month vs last week',
  'Who used the AI assistant the most this week?',
  'Catalog summary (cities, routes, posts)',
]

function StatCard({ icon: Icon, label, value, hint, accent = 'green' }) {
  const colors = {
    green: 'border-green-500/25 bg-green-500/5 text-green-400',
    amber: 'border-amber-500/25 bg-amber-500/5 text-amber-400',
    cyan:  'border-cyan-500/25 bg-cyan-500/5 text-cyan-400',
    rose:  'border-rose-500/25 bg-rose-500/5 text-rose-400',
  }
  return (
    <div className="rounded-2xl glass border border-white/10 p-4 sm:p-5 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${colors[accent]}`}>
          <Icon size={16} />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</span>
      </div>
      <div className="text-xl sm:text-2xl font-display font-bold text-white leading-none">{value}</div>
      {hint && <div className="text-[11px] text-slate-500 mt-1.5 leading-snug">{hint}</div>}
    </div>
  )
}

function ToolCallChip({ name, args, result }) {
  const [open, setOpen] = useState(false)
  const argSummary = useMemo(() => {
    const entries = Object.entries(args || {})
    if (!entries.length) return ''
    return entries.map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`).join(', ')
  }, [args])

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-cyan-500/8 transition-colors"
      >
        <Database size={12} className="text-cyan-400 shrink-0" />
        <span className="text-[11px] font-mono text-cyan-300 truncate min-w-0 flex-1">
          {name}({argSummary})
        </span>
        <ChevronDown
          size={14}
          className={`text-cyan-400/70 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <pre className="text-[10px] text-slate-300 bg-slate-950/60 border-t border-cyan-500/15 p-3 overflow-x-auto max-h-64 leading-snug">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[92%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 text-white'
            : 'glass border border-white/10 text-slate-200'
        }`}
      >
        {msg.role === 'assistant' && msg.warning && (
          <div className="mb-2 flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1">
            <AlertTriangle size={12} /> {msg.warning}
          </div>
        )}
        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
        {msg.role === 'assistant' && Array.isArray(msg.toolCalls) && msg.toolCalls.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/8 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Data sources ({msg.toolCalls.length})
            </div>
            {msg.toolCalls.map((tc, i) => (
              <ToolCallChip key={i} name={tc.name} args={tc.args} result={tc.result} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminAgent() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  const fetchStats = async () => {
    setStatsLoading(true)
    setStatsError('')
    try {
      const { data } = await api.get('/admin/stats')
      setStats(data)
    } catch (err) {
      const code = err.response?.status
      if (code === 403) setStatsError('Your account is not on the admin allow-list.')
      else setStatsError(err.response?.data?.error?.message || 'Could not load stats')
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.isAdmin) fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.isAdmin])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  if (!user) return <Navigate to="/" replace />
  if (!user.isAdmin) {
    return (
      <section className="min-h-[100dvh] mesh-bg pt-24 pb-20 px-4 flex items-start justify-center">
        <div className="max-w-md w-full mt-12 glass border border-white/10 rounded-2xl p-6 text-center">
          <ShieldCheck size={32} className="text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-display font-bold text-white mb-2">Admin only</h2>
          <p className="text-sm text-slate-400">
            Your account isn’t on the admin allow-list. Add your email to the
            <code className="text-amber-300 mx-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[11px]">
              ADMIN_EMAILS
            </code>
            env variable on the backend and restart the server.
          </p>
        </div>
      </section>
    )
  }

  const send = async (text) => {
    const question = String(text ?? input).trim()
    if (!question || sending) return

    const userMsg = { role: 'user', content: question }
    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }))

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const { data } = await api.post('/admin/agent', { question, history })
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || '(empty response)',
          toolCalls: data.toolCalls || [],
          model: data.model,
          warning: data.warning,
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err.response?.data?.error?.message ||
            'Something went wrong while talking to the agent. Please try again.',
          toolCalls: [],
          warning: 'agent error',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const fmtInr = (n) =>
    typeof n === 'number'
      ? `₹${n.toLocaleString('en-IN')}`
      : '—'

  return (
    <section className="min-h-[100dvh] mesh-bg pt-20 sm:pt-24 pb-32 px-3 sm:px-5 lg:px-6 overflow-x-hidden">
      <div className="max-w-5xl mx-auto w-full min-w-0">

        {/* Header */}
        <div className="mb-5 sm:mb-7 animate-slide-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-violet-500/15 text-violet-300 border border-violet-500/30 mb-2">
            <ShieldCheck size={11} /> Admin only
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            JourneyMate Admin Agent
          </h1>
          <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">
            Ask anything about your real customer data. The agent only runs read-only queries — every
            answer shows the data sources it pulled from so you can verify the numbers.
          </p>
        </div>

        {/* Live stats strip */}
        <div className="mb-6 sm:mb-7 animate-slide-up" style={{ animationDelay: '0.06s' }}>
          {statsError ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm p-4">
              {statsError}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1.5">
                  <Sparkles size={11} className="text-violet-300" /> Live snapshot
                </div>
                <button
                  type="button"
                  onClick={fetchStats}
                  disabled={statsLoading}
                  className="text-[10px] uppercase tracking-wider text-slate-500 hover:text-white font-semibold flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw size={11} className={statsLoading ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <StatCard
                  icon={Users}
                  label="Total users"
                  value={statsLoading ? '…' : stats?.totalUsers ?? 0}
                  hint={statsLoading ? '' : `+${stats?.newUsers7d ?? 0} this week`}
                  accent="green"
                />
                <StatCard
                  icon={Receipt}
                  label="Total bookings"
                  value={statsLoading ? '…' : stats?.totalBookings ?? 0}
                  hint={statsLoading ? '' : `+${stats?.bookings7d ?? 0} this week`}
                  accent="amber"
                />
                <StatCard
                  icon={IndianRupee}
                  label="Revenue (7d)"
                  value={statsLoading ? '…' : fmtInr(stats?.revenue7dInr)}
                  hint={statsLoading ? '' : `total: ${fmtInr(stats?.revenueTotalInr)}`}
                  accent="cyan"
                />
                <StatCard
                  icon={MessageSquare}
                  label="AI msgs (7d)"
                  value={statsLoading ? '…' : stats?.aiMessages7d ?? 0}
                  hint="Across all users"
                  accent="rose"
                />
              </div>
            </>
          )}
        </div>

        {/* Conversation */}
        <div
          className="rounded-2xl border border-white/10 glass animate-slide-up flex flex-col"
          style={{ animationDelay: '0.12s', minHeight: '52vh' }}
        >
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[60vh]">
            {messages.length === 0 && (
              <div className="text-center py-10 sm:py-14">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/15 border border-violet-500/30 flex items-center justify-center">
                  <Sparkles size={22} className="text-violet-300" />
                </div>
                <p className="text-sm text-slate-300 font-semibold mb-1">
                  Ask me anything about your customers.
                </p>
                <p className="text-xs text-slate-500 mb-5">
                  Read-only · Postgres-backed · Every answer shows its sources.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="text-left text-xs text-slate-300 px-3 py-2.5 rounded-xl bg-white/4 hover:bg-white/8 border border-white/10 hover:border-violet-500/30 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} />
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="glass border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-400 inline-flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Querying your database…
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            className="border-t border-white/10 p-3 sm:p-4 flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              rows={1}
              placeholder="Ask about users, bookings, revenue, AI usage…"
              disabled={sending}
              className="flex-1 min-w-0 resize-none rounded-xl bg-slate-900/60 border border-white/10 focus:border-violet-500/40 focus:outline-none text-sm text-white px-3.5 py-2.5 placeholder:text-slate-600 disabled:opacity-60 max-h-32"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span className="hidden xs:inline">Send</span>
            </button>
          </form>
        </div>

        <p className="text-[10px] text-slate-600 text-center mt-3 leading-snug">
          Customer emails are partially masked in tool results. The agent runs only read-only SQL.
          {' '}You are signed in as <span className="text-slate-400">{user.email}</span>.
        </p>
      </div>
    </section>
  )
}
