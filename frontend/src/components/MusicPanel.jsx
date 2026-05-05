import React, { useEffect, useState, useRef } from 'react'
import {
  Music2,
  Disc3,
  ExternalLink,
  Headphones,
  Loader2,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import { getPlaceMusic } from '../services/musicService'

/**
 * Local error boundary so a render-time crash inside the music UI never blanks
 * the entire ComparisonPage. We render `null` on failure — the rest of the
 * page (weather, plans, map) keeps working.
 */
class MusicErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(err) {
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn('[MusicPanel] render failed, hiding panel:', err)
    }
  }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

/* Spotify uses an inline-svg "S" mark — no extra deps. */
function SpotifyGlyph({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#1DB954" />
      <path
        d="M7 10.2c3.4-.9 7.5-.6 10.6 1.1.4.2.5.7.3 1.1-.2.4-.7.5-1.1.3-2.7-1.5-6.5-1.7-9.4-.9-.4.1-.9-.1-1-.5-.1-.5.1-1 .6-1.1zm.4 2.7c2.9-.7 6.4-.4 8.9 1 .4.2.5.6.3 1-.2.4-.6.5-1 .3-2.2-1.2-5.3-1.5-7.8-.9-.4.1-.8-.2-.9-.6 0-.4.2-.7.5-.8zm.5 2.7c2.4-.5 5.1-.3 7.1.8.3.2.4.5.2.8-.2.3-.5.4-.8.2-1.7-1-4.1-1.2-6.2-.7-.3.1-.6-.1-.7-.4-.1-.3.1-.6.4-.7z"
        fill="#fff"
      />
    </svg>
  )
}

function YouTubeGlyph({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M23 7.2s-.2-1.5-.9-2.2c-.8-.9-1.7-.9-2.1-1C16.9 3.7 12 3.7 12 3.7s-4.9 0-8 .3c-.4.1-1.3.1-2.1 1C1.2 5.7 1 7.2 1 7.2S.7 9 .7 10.7v1.5C.7 14 1 15.7 1 15.7s.2 1.5.9 2.2c.8.9 1.9.9 2.4 1 1.7.2 7.7.3 7.7.3s4.9 0 8-.3c.4-.1 1.3-.1 2.1-1 .7-.7.9-2.2.9-2.2s.3-1.7.3-3.5v-1.5c0-1.7-.3-3.5-.3-3.5z"
        fill="#FF0000"
      />
      <path d="M9.7 14.3l5.3-2.8-5.3-2.8z" fill="#fff" />
    </svg>
  )
}

function ProviderButton({ href, label, icon, kbd }) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition hover:border-fuchsia-400/60 dark:hover:border-fuchsia-400/40 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/10 hover:text-slate-900 dark:hover:text-white active:scale-[0.97] touch-manipulation"
      title={`Open in ${label}`}
    >
      {icon}
      <span>{label}</span>
      {kbd && <ExternalLink size={11} className="text-slate-400" />}
    </a>
  )
}

function TrackRow({ track, idx, accent }) {
  const ring =
    accent === 'gold'
      ? 'border-amber-300/70 bg-amber-50/80 dark:border-amber-400/20 dark:bg-amber-500/[0.04]'
      : 'border-fuchsia-300/70 bg-fuchsia-50/80 dark:border-fuchsia-400/20 dark:bg-fuchsia-500/[0.04]'
  const accentText = accent === 'gold' ? 'text-amber-700 dark:text-amber-300' : 'text-fuchsia-700 dark:text-fuchsia-300'
  const counterBg =
    accent === 'gold'
      ? 'bg-white/80 dark:bg-slate-900/60 ring-1 ring-amber-300/70 dark:ring-amber-500/30'
      : 'bg-white/80 dark:bg-slate-900/60 ring-1 ring-fuchsia-300/70 dark:ring-fuchsia-500/30'
  return (
    <li
      className={`group relative flex flex-col gap-2 rounded-xl border ${ring} p-2.5 transition-colors hover:border-fuchsia-400/60 dark:hover:border-fuchsia-400/40 sm:flex-row sm:items-center sm:gap-3 sm:p-3`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${counterBg} text-xs font-bold tabular-nums ${accentText}`}
      >
        {String(idx + 1).padStart(2, '0')}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{track.title}</p>
        <p className="truncate text-[11px] text-slate-600 dark:text-slate-400">
          {track.artist || 'Unknown artist'}
          {track.language ? <span className="ml-1.5 text-slate-500">· {track.language}</span> : null}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0">
        {track.links?.spotify && (
          <a
            href={track.links.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-black/30 px-2 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-200 transition hover:border-emerald-400/60 dark:hover:border-emerald-400/40 hover:text-slate-900 dark:hover:text-white active:scale-[0.97] touch-manipulation"
            title="Search on Spotify"
          >
            <SpotifyGlyph size={11} />
            Spotify
          </a>
        )}
        {track.links?.ytMusic && (
          <a
            href={track.links.ytMusic}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-black/30 px-2 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-200 transition hover:border-rose-400/60 dark:hover:border-rose-400/40 hover:text-slate-900 dark:hover:text-white active:scale-[0.97] touch-manipulation"
            title="Search on YouTube Music"
          >
            <YouTubeGlyph size={11} />
            YT Music
          </a>
        )}
      </div>
    </li>
  )
}

function MusicPanelInner({ destination, tripType, vibes }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const reqIdRef = useRef(0)

  useEffect(() => {
    if (!destination) {
      setData(null)
      return
    }
    const myReq = ++reqIdRef.current
    let cancelled = false
    setLoading(true)
    setError(false)

    getPlaceMusic({ place: destination, tripType, vibes })
      .then((res) => {
        if (cancelled || reqIdRef.current !== myReq) return
        // Defensive: drop any malformed tracks so a bad shape can't crash render.
        const safeTracks = Array.isArray(res?.tracks)
          ? res.tracks.filter((t) => t && typeof t.title === 'string' && t.title.trim())
          : []
        if (safeTracks.length === 0) {
          setError(true)
          setData(null)
        } else {
          setData({ ...res, tracks: safeTracks })
        }
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [destination, tripType, JSON.stringify(vibes || [])])

  if (!destination) return null

  return (
    <div
      className="mb-6 sm:mb-8 rounded-2xl border border-slate-900/10 dark:border-white/10 glass p-4 sm:p-5 animate-slide-up w-full min-w-0"
      style={{ animationDelay: '0.16s' }}
    >
      <div className="mb-3 flex items-center gap-2 min-w-0">
        <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-fuchsia-200 to-pink-200 dark:from-fuchsia-500/25 dark:to-pink-500/15 border border-fuchsia-400/60 dark:border-fuchsia-500/30 ring-1 ring-white/40 dark:ring-white/10 flex items-center justify-center">
          <Disc3
            size={16}
            className={`text-fuchsia-700 dark:text-fuchsia-300 ${loading ? 'animate-spin' : ''}`}
            style={{ animationDuration: '2.5s' }}
          />
        </div>
        <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-white truncate">
          Soundtrack for {destination}
        </h3>
        {data?.source && (
          <span
            className={`ml-auto hidden xs:inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
              data.source.includes('llm')
                ? 'border-fuchsia-400/60 dark:border-fuchsia-400/30 bg-fuchsia-100/80 dark:bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300'
                : 'border-cyan-400/60 dark:border-cyan-400/30 bg-cyan-100/80 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
            }`}
          >
            <Sparkles size={9} />
            {data.source.includes('llm') ? 'AI tuned' : 'Curated'}
          </span>
        )}
      </div>

      <p className="mb-4 text-xs text-slate-600 dark:text-slate-400 leading-snug">
        {data?.summary
          ? data.summary
          : 'Music suggestions tuned to where you are going — open in your favourite app.'}
      </p>

      {/* Loading skeleton */}
      {loading && !data && (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-slate-900/8 dark:border-white/8 bg-white/40 dark:bg-white/[0.02] p-3"
            >
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-slate-900/5 dark:bg-white/5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-900/5 dark:bg-white/5" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-900/5 dark:bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error / empty state */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-900/8 dark:border-white/8 bg-white/40 dark:bg-white/[0.02] p-6 text-center">
          <Headphones size={22} className="text-slate-400 dark:text-slate-500" />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Couldn’t load suggestions for this place right now.
          </p>
          <button
            type="button"
            onClick={() => {
              setError(false)
              setLoading(true)
              getPlaceMusic({ place: destination, tripType, vibes })
                .then((res) => {
                  if (!res?.tracks?.length) setError(true)
                  else setData(res)
                })
                .catch(() => setError(true))
                .finally(() => setLoading(false))
            }}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-slate-900/15 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-fuchsia-400/60 dark:hover:border-fuchsia-400/40 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/10 hover:text-slate-900 dark:hover:text-white transition-all active:scale-[0.97] touch-manipulation"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      )}

      {/* Loaded */}
      {!loading && !error && data?.tracks?.length > 0 && (
        <>
          <ul className="space-y-2">
            {data.tracks.map((t, i) => (
              <TrackRow key={`${t.title}-${i}`} track={t} idx={i} accent="fuchsia" />
            ))}
          </ul>

          {/* Provider buttons (search the whole vibe at once) */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-900/8 dark:border-white/8 pt-3">
            <span className="mr-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-500">
              <Music2 size={11} />
              Open vibe in
            </span>
            <ProviderButton
              href={data.links?.spotify}
              label="Spotify"
              icon={<SpotifyGlyph />}
              kbd
            />
            <ProviderButton
              href={data.links?.ytMusic}
              label="YouTube Music"
              icon={<YouTubeGlyph />}
              kbd
            />
            <ProviderButton
              href={data.links?.youtube}
              label="YouTube"
              icon={<YouTubeGlyph />}
              kbd
            />
            {data.links?.jiosaavn && (
              <ProviderButton
                href={data.links.jiosaavn}
                label="JioSaavn"
                icon={<Music2 size={12} className="text-cyan-600 dark:text-cyan-300" />}
                kbd
              />
            )}
          </div>

          {data.attribution && (
            <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-500 leading-relaxed">
              {data.attribution}
            </p>
          )}
        </>
      )}

      {/* Tiny inline loader if refreshing while data already shown */}
      {loading && data && (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-500">
          <Loader2 size={11} className="animate-spin" />
          Updating to match your vibe…
        </div>
      )}
    </div>
  )
}

export default function MusicPanel(props) {
  return (
    <MusicErrorBoundary>
      <MusicPanelInner {...props} />
    </MusicErrorBoundary>
  )
}
