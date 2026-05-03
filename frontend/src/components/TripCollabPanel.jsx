import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageCircle,
  Send,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  ThumbsUp,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  listComments,
  postComment,
  deleteComment,
  getVotes,
  castVote,
  clearVote,
} from '../services/savedTripsService'

/**
 * Collaboration panel for a public shared trip.
 *
 * - Anyone with the share link can read comments and vote totals.
 * - Posting and voting require auth — anonymous viewers see CTAs to
 *   sign in instead.
 * - Comments are loaded once on mount; votes refresh after each action.
 *
 * Designed to live below the ComparisonPage on /shared/:token. Self-
 * contained: no external state, no Redux, no upstream callbacks needed.
 */
export default function TripCollabPanel({ token, name = 'this trip' }) {
  const { user } = useAuth()

  const [comments, setComments]         = useState([])
  const [commentsLoading, setCLoading]  = useState(true)
  const [commentsError, setCError]      = useState('')
  const [draft, setDraft]               = useState('')
  const [posting, setPosting]           = useState(false)

  const [votes, setVotes]      = useState({ silver: 0, gold: 0, total: 0, mine: null })
  const [voting, setVoting]    = useState(false)
  const [voteError, setVoteErr] = useState('')

  const draftRef = useRef(null)

  useEffect(() => {
    if (!token) return undefined
    let cancelled = false
    setCLoading(true)
    setCError('')
    Promise.all([listComments(token), getVotes(token)])
      .then(([cs, vs]) => {
        if (cancelled) return
        setComments(Array.isArray(cs) ? cs : [])
        if (vs) setVotes(vs)
      })
      .catch((err) => {
        if (cancelled) return
        setCError(err?.response?.data?.error?.message || err?.message || 'Could not load discussion')
      })
      .finally(() => { if (!cancelled) setCLoading(false) })
    return () => { cancelled = true }
  }, [token])

  const handlePost = async (e) => {
    e?.preventDefault()
    const body = String(draft || '').trim()
    if (!body || posting) return
    setPosting(true)
    setCError('')
    try {
      const item = await postComment(token, body)
      if (item) setComments((cur) => [item, ...cur])
      setDraft('')
      requestAnimationFrame(() => { draftRef.current?.focus() })
    } catch (err) {
      setCError(err?.response?.data?.error?.message || err?.message || 'Could not post comment')
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (item) => {
    if (!item?.isMine) return
    const ok = typeof window !== 'undefined' && window.confirm('Delete this comment?')
    if (!ok) return
    const prev = comments
    setComments((cur) => cur.filter((c) => c.id !== item.id))
    try {
      await deleteComment(token, item.id)
    } catch (err) {
      setComments(prev)
      setCError(err?.response?.data?.error?.message || err?.message || 'Could not delete')
    }
  }

  const handleVote = async (choice) => {
    if (!user || voting) return
    setVoting(true)
    setVoteErr('')
    try {
      let summary
      if (votes.mine === choice) {
        summary = await clearVote(token)
      } else {
        summary = await castVote(token, choice)
      }
      if (summary) setVotes(summary)
    } catch (err) {
      setVoteErr(err?.response?.data?.error?.message || err?.message || 'Could not register vote')
    } finally {
      setVoting(false)
    }
  }

  const silverPct = useMemo(
    () => (votes.total > 0 ? Math.round((votes.silver / votes.total) * 100) : 0),
    [votes.silver, votes.total]
  )
  const goldPct = useMemo(
    () => (votes.total > 0 ? Math.round((votes.gold / votes.total) * 100) : 0),
    [votes.gold, votes.total]
  )

  return (
    <section className="px-4 sm:px-6 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        {/* Vote panel */}
        <div className="glass rounded-3xl border border-white/10 p-5 sm:p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsUp size={16} className="text-emerald-300" />
            <h3 className="font-display font-bold text-white text-base sm:text-lg">Which plan?</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mb-4">
            Anyone with the share link can vote. Pick the tier you'd actually book for {name}.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <VoteButton
              tier="silver"
              label="Silver"
              count={votes.silver}
              pct={silverPct}
              picked={votes.mine === 'silver'}
              disabled={!user || voting}
              onClick={() => handleVote('silver')}
              accent="emerald"
            />
            <VoteButton
              tier="gold"
              label="Gold"
              count={votes.gold}
              pct={goldPct}
              picked={votes.mine === 'gold'}
              disabled={!user || voting}
              onClick={() => handleVote('gold')}
              accent="amber"
            />
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>{votes.total} vote{votes.total === 1 ? '' : 's'} so far</span>
            {votes.mine && (
              <button
                type="button"
                onClick={() => handleVote(votes.mine)}
                disabled={voting}
                className="underline hover:text-white"
              >
                Clear my vote
              </button>
            )}
          </div>

          {!user && (
            <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-3 py-2.5 text-xs text-emerald-200">
              <Link to="/" className="underline hover:text-white">Sign in</Link> to cast your vote and join the discussion.
            </div>
          )}
          {voteError && (
            <div className="mt-3 text-xs text-red-300 inline-flex items-center gap-1.5">
              <AlertCircle size={12} /> {voteError}
            </div>
          )}
        </div>

        {/* Comments thread */}
        <div className="glass rounded-3xl border border-white/10 p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle size={16} className="text-emerald-300" />
            <h3 className="font-display font-bold text-white text-base sm:text-lg">Discussion</h3>
            <span className="text-xs text-slate-500 ml-auto">
              {comments.length} comment{comments.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mb-4">
            Tag the food spots, lock the date, point out the WhatsApp-grade chaos — all in one place.
          </p>

          {/* Composer */}
          {user ? (
            <form onSubmit={handlePost} className="mb-4">
              <textarea
                ref={draftRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder={`Reply as ${user.name || user.email || 'you'}…`}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400/50 resize-y leading-snug"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">{draft.length}/2000</span>
                <button
                  type="submit"
                  disabled={posting || !draft.trim()}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white disabled:opacity-50 transition-colors"
                >
                  {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-3 py-2.5 text-xs text-emerald-200 inline-flex items-center gap-2">
              <Sparkles size={12} />
              <span>
                <Link to="/" className="underline hover:text-white">Sign in</Link> to add a comment.
              </span>
            </div>
          )}

          {/* List */}
          {commentsError && (
            <div className="mb-3 text-xs text-red-300 inline-flex items-center gap-1.5">
              <AlertCircle size={12} /> {commentsError}
            </div>
          )}
          {commentsLoading ? (
            <div className="text-slate-500 text-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Loading discussion…
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              No comments yet — kick things off.
            </p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl bg-white/3 border border-white/8 p-3 sm:p-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {(c.authorName || 'T')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-white truncate">{c.authorName}</span>
                    <span className="text-[11px] text-slate-500">{formatRelative(c.createdAt)}</span>
                    {c.isMine && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="ml-auto text-slate-500 hover:text-red-300 transition-colors"
                        aria-label="Delete comment"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-200 whitespace-pre-line leading-snug">{c.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

function VoteButton({ tier, label, count, pct, picked, disabled, onClick, accent }) {
  const hue = accent === 'amber'
    ? {
        ring: picked ? 'border-amber-400/70' : 'border-amber-500/30',
        bg:   picked ? 'bg-amber-500/15'      : 'bg-amber-500/5 hover:bg-amber-500/10',
        text: 'text-amber-300',
        bar:  'bg-amber-400',
      }
    : {
        ring: picked ? 'border-emerald-400/70' : 'border-emerald-500/30',
        bg:   picked ? 'bg-emerald-500/15'      : 'bg-emerald-500/5 hover:bg-emerald-500/10',
        text: 'text-emerald-300',
        bar:  'bg-emerald-400',
      }
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative overflow-hidden text-left rounded-2xl border transition-colors px-3 py-3 ${hue.ring} ${hue.bg} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      aria-pressed={picked}
      data-tier={tier}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-bold uppercase tracking-widest ${hue.text}`}>{label}</span>
        <span className="text-xs text-slate-300 font-semibold tabular-nums">{count}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-1">
        <div className={`h-full ${hue.bar} transition-all`} style={{ width: `${Math.max(2, pct)}%` }} />
      </div>
      <div className="text-[11px] text-slate-400">
        {pct}% of votes
      </div>
    </button>
  )
}

function formatRelative(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const diff = Date.now() - d.getTime()
    if (diff < 60_000)         return 'just now'
    if (diff < 3_600_000)      return `${Math.round(diff / 60_000)} min ago`
    if (diff < 86_400_000)     return `${Math.round(diff / 3_600_000)} hr ago`
    if (diff < 7 * 86_400_000) return `${Math.round(diff / 86_400_000)} d ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}
