import React, { useEffect, useState } from 'react'
import { Heart, MapPin, MessageCircle, Send, Loader2, CalendarDays } from 'lucide-react'
import api from '../api/client'

const REACTIONS = ['👍', '❤️', '😂', '🎉', '🙏', '✈️']

function formatCommentDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function BlogExperienceCard({
  exp,
  clientId,
  user,
  onRefresh,
  formatDate: formatDateMain,
}) {
  const [rLoading, setRLoading] = useState(false)
  const [cText, setCText] = useState('')
  const [cName, setCName] = useState(user?.name || '')
  const [cSubmit, setCSubmit] = useState(false)
  const [localErr, setLocalErr] = useState('')

  useEffect(() => {
    if (user?.name) setCName(user.name)
  }, [user?.name, user?.id])

  const payload = () => (user ? {} : { client_id: clientId })

  const onLike = async () => {
    if (!user && !clientId) {
      setLocalErr('Client id not ready — refresh the page.')
      return
    }
    setRLoading(true)
    setLocalErr('')
    try {
      await api.post(
        `/blog/experiences/${exp.id}/like`,
        {
          ...payload(),
        }
      )
      await onRefresh()
    } catch (e) {
      setLocalErr(
        e?.response?.data?.error?.message || e?.message || 'Like failed'
      )
    } finally {
      setRLoading(false)
    }
  }

  const onPickEmoji = async (emoji) => {
    if (!user && !clientId) {
      setLocalErr('Client id not ready — refresh the page.')
      return
    }
    const next = exp.viewer_emoji === emoji ? 'remove' : emoji
    setRLoading(true)
    setLocalErr('')
    try {
      await api.post(
        `/blog/experiences/${exp.id}/reaction`,
        { emoji: next, ...payload() }
      )
      await onRefresh()
    } catch (e) {
      setLocalErr(
        e?.response?.data?.error?.message || e?.message || 'Reaction failed'
      )
    } finally {
      setRLoading(false)
    }
  }

  const onComment = async (e) => {
    e.preventDefault()
    const t = cText.trim()
    if (t.length < 1) return
    if (!user && !clientId) {
      setLocalErr('Client id not ready — refresh the page.')
      return
    }
    if (user) {
      const n = (cName || user.name || 'Traveler').trim()
      if (n.length < 1) return
    } else {
      if ((cName || '').trim().length < 2) {
        setLocalErr('Name must be at least 2 characters for guest comments.')
        return
      }
    }
    setCSubmit(true)
    setLocalErr('')
    try {
      if (user) {
        await api.post(`/blog/experiences/${exp.id}/comments`, {
          body: t,
          display_name: cName || user.name || 'Traveler',
        })
      } else {
        await api.post(`/blog/experiences/${exp.id}/comments`, {
          body: t,
          display_name: cName.trim(),
          client_id: clientId,
        })
      }
      setCText('')
      if (!user) setCName('')
      else setCName(user.name || cName)
      await onRefresh()
    } catch (err) {
      setLocalErr(
        err?.response?.data?.error?.message || err?.message || 'Comment failed'
      )
    } finally {
      setCSubmit(false)
    }
  }

  return (
    <li className="glass rounded-2xl border border-white/10 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <h3 className="font-display font-bold text-lg text-white">{exp.title}</h3>
        <time className="text-xs text-slate-500" dateTime={exp.created_at}>
          {formatDateMain(exp.created_at)}
        </time>
      </div>
      {exp.destination && (
        <p className="text-xs text-fuchsia-300/90 flex items-center gap-1.5 mb-2">
          <MapPin size={12} className="shrink-0" />
          {exp.destination}
        </p>
      )}
      {exp.visit_months && String(exp.visit_months).trim() && (
        <p className="text-xs text-amber-200/95 flex items-start gap-1.5 mb-3 rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2">
          <CalendarDays size={14} className="shrink-0 mt-0.5 text-amber-300" />
          <span>
            <span className="font-semibold text-amber-100/95">Best time: </span>
            {String(exp.visit_months).trim()}
          </span>
        </p>
      )}
      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">{exp.body}</p>
      <p className="text-xs text-slate-500 mb-4">— {exp.display_name}</p>

      <div
        className="mb-3 border-t border-white/10 pt-4 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent -mx-1 px-1 sm:px-2 -mt-1"
        aria-label="Reactions and likes"
      >
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2.5">Like, react, comment</p>
        <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onLike}
          disabled={rLoading}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
            exp.viewer_liked
              ? 'bg-rose-500/25 border-rose-400/50 text-rose-100'
              : 'bg-white/8 border-white/20 text-slate-200 hover:border-rose-400/40'
          } ${rLoading ? 'opacity-60' : ''}`}
          title={exp.viewer_liked ? 'Unlike' : 'Like'}
        >
          {rLoading ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} className={exp.viewer_liked ? 'fill-rose-400 text-rose-200' : ''} />}
          <span className="tabular-nums font-medium">{Number(exp.like_count) || 0}</span>
        </button>
        {REACTIONS.map((e) => {
          const c = (exp.reaction_counts && exp.reaction_counts[e]) || 0
          const on = exp.viewer_emoji === e
          return (
            <button
              key={e}
              type="button"
              onClick={() => onPickEmoji(e)}
              disabled={rLoading}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-sm transition-transform hover:scale-105 ${
                on
                  ? 'border-amber-300/60 bg-amber-500/25 text-amber-100 shadow-sm shadow-amber-900/30'
                  : 'border-white/12 bg-white/5 hover:border-white/25'
              }`}
              title="Pick emoji"
              aria-pressed={on}
            >
              <span className="leading-none text-base">{e}</span>
              {c > 0 && <span className="text-[10px] text-slate-300 tabular-nums">{c}</span>}
            </button>
          )
        })}
        </div>
      </div>

      {localErr && <p className="text-rose-200/90 text-xs mb-3" role="alert">{localErr}</p>}

      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 text-cyan-200/90 text-xs font-semibold mb-3">
          <MessageCircle size={15} className="text-cyan-400" />
          Comments
          {exp.comment_count > 0 && (
            <span className="text-cyan-300/70 font-normal tabular-nums">({Number(exp.comment_count) || 0})</span>
          )}
        </div>
        {(exp.recent_comments && exp.recent_comments.length > 0) ? (
          <ul className="space-y-3 mb-4">
            {exp.recent_comments.map((c) => (
              <li key={c.id} className="rounded-xl bg-white/[0.03] border border-white/6 px-3 py-2">
                <p className="text-slate-200 text-sm whitespace-pre-wrap">{c.body}</p>
                <p className="text-[10px] text-slate-500 mt-1 flex flex-wrap justify-between gap-1">
                  <span>— {c.display_name}</span>
                  <span>{formatCommentDate(c.created_at)}</span>
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        <form onSubmit={onComment} className="space-y-2">
          {(!user) && (
            <input
              type="text"
              value={cName}
              onChange={(ev) => setCName(ev.target.value)}
              placeholder="Your name (guests)"
              className="w-full sm:max-w-xs rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500"
              maxLength={120}
            />
          )}
          <textarea
            value={cText}
            onChange={(ev) => setCText(ev.target.value)}
            rows={2}
            placeholder="Write a comment…"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500"
            maxLength={2000}
          />
          <div>
            <button
              type="submit"
              disabled={cSubmit || cText.trim().length < 1}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-sm font-medium px-4 py-1.5 hover:bg-cyan-500/30 disabled:opacity-40"
            >
              {cSubmit ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              Add comment
            </button>
          </div>
        </form>
      </div>
    </li>
  )
}
