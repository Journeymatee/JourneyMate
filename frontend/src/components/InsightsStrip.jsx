import React, { useEffect, useState } from 'react'
import { MapPin, Sparkles } from 'lucide-react'
import api from '../api/client'

export default function InsightsStrip() {
  const [items, setItems] = useState([])
  const [source, setSource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      setErr('')
      try {
        const { data } = await api.get('/insights/trending-cities')
        if (!active) return
        setItems(Array.isArray(data?.items) ? data.items : [])
        setSource(data?.source || null)
      } catch (e) {
        if (!active) return
        setErr('Insights unavailable right now.')
        setItems([])
        setSource(null)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="px-4 sm:px-6 -mt-6 sm:-mt-8 mb-8 max-w-7xl mx-auto">
        <div className="h-10 rounded-2xl glass border border-white/10 animate-pulse" />
      </div>
    )
  }

  if (err || !items.length) {
    return null
  }

  return (
    <div className="px-4 sm:px-6 -mt-6 sm:-mt-8 mb-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <p className="text-[11px] text-slate-500 flex items-center gap-2">
          <Sparkles size={12} className="text-amber-300" />
          Trending city insights
          {source && (
            <span className="px-2 py-0.5 rounded-full border border-cyan-500/25 text-cyan-200/80">
              {source}
            </span>
          )}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.slice(0, 6).map((c) => (
          <div
            key={`${c.name}-${c.state}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200"
          >
            <MapPin size={12} className="text-cyan-300" />
            <span className="text-white/90 font-semibold">{c.name}</span>
            <span className="text-slate-500">· {c.state}</span>
            {Number.isFinite(Number(c.popularity)) && (
              <span className="ml-1 text-[10px] text-slate-500">pop {c.popularity}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
