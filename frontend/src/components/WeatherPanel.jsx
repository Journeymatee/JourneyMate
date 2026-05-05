import React from 'react'
import {
  CloudSun,
  Sun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  Droplets,
  Wind,
  Thermometer,
  MapPin,
} from 'lucide-react'

/* WMO weather code → label + icon. Based on https://open-meteo.com/en/docs */
function describeCode(code) {
  if (code == null) return { label: 'Unknown', Icon: Cloud }
  if (code === 0) return { label: 'Clear sky', Icon: Sun }
  if ([1, 2].includes(code)) return { label: 'Mostly clear', Icon: CloudSun }
  if (code === 3) return { label: 'Overcast', Icon: Cloud }
  if ([45, 48].includes(code)) return { label: 'Fog', Icon: CloudFog }
  if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Drizzle', Icon: CloudDrizzle }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Rain', Icon: CloudRain }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Snow', Icon: CloudSnow }
  if ([95, 96, 99].includes(code)) return { label: 'Thunderstorm', Icon: CloudLightning }
  return { label: 'Mixed', Icon: Cloud }
}

function formatTemp(t) {
  if (t == null || !Number.isFinite(t)) return '—'
  return `${Math.round(t)}°`
}

function formatDay(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, { weekday: 'short' })
  } catch {
    return dateStr
  }
}

function WeatherCard({ label, weather, accent }) {
  if (!weather) {
    return (
      <div className="rounded-2xl border border-slate-900/10 dark:border-white/8 bg-white/70 dark:bg-white/[0.03] p-3 sm:p-4 min-w-0">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          <MapPin size={13} />
          <span className="truncate">{label}</span>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">Live weather not available right now.</p>
      </div>
    )
  }

  const { current, forecast = [] } = weather
  const { label: condition, Icon } = describeCode(current?.code)
  const accentText = accent === 'gold' ? 'text-amber-700 dark:text-amber-300' : 'text-cyan-700 dark:text-cyan-300'
  const accentRing =
    accent === 'gold'
      ? 'border-amber-300/70 dark:border-amber-400/25 bg-amber-50/80 dark:bg-amber-500/[0.06]'
      : 'border-cyan-300/70 dark:border-cyan-400/25 bg-cyan-50/80 dark:bg-cyan-500/[0.06]'

  return (
    <div className={`rounded-2xl border ${accentRing} p-3 sm:p-4 min-w-0`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-600 dark:text-slate-400">
            <MapPin size={12} className={accentText} />
            <span className="truncate">{label}</span>
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
            {weather.label || label}
          </p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-white/5 ${accentText}`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-3 flex items-end gap-3 flex-wrap">
        <p className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl tabular-nums leading-none">
          {formatTemp(current?.temperature)}
        </p>
        <div className="mb-1 min-w-0">
          <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200 sm:text-sm">{condition}</p>
          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
            Feels like <span className="tabular-nums">{formatTemp(current?.feelsLike)}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] sm:text-[11px]">
        <div className="rounded-lg border border-slate-900/8 dark:border-white/8 bg-white/80 dark:bg-slate-900/50 px-2 py-1.5">
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <Droplets size={10} className="text-sky-600 dark:text-sky-300" />
            <span>Humidity</span>
          </div>
          <p className="mt-0.5 font-semibold text-slate-900 dark:text-white tabular-nums">
            {current?.humidity != null ? `${Math.round(current.humidity)}%` : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-slate-900/8 dark:border-white/8 bg-white/80 dark:bg-slate-900/50 px-2 py-1.5">
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <Wind size={10} className="text-emerald-600 dark:text-emerald-300" />
            <span>Wind</span>
          </div>
          <p className="mt-0.5 font-semibold text-slate-900 dark:text-white tabular-nums">
            {current?.wind != null ? `${Math.round(current.wind)} km/h` : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-slate-900/8 dark:border-white/8 bg-white/80 dark:bg-slate-900/50 px-2 py-1.5">
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <Thermometer size={10} className="text-rose-600 dark:text-rose-300" />
            <span>Rain</span>
          </div>
          <p className="mt-0.5 font-semibold text-slate-900 dark:text-white tabular-nums">
            {current?.precipitation != null ? `${current.precipitation} mm` : '—'}
          </p>
        </div>
      </div>

      {forecast.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {forecast.map((d) => {
            const meta = describeCode(d.code)
            return (
              <div
                key={d.date}
                className="flex flex-col items-center gap-0.5 rounded-lg border border-slate-900/8 dark:border-white/8 bg-white/70 dark:bg-slate-900/40 px-1.5 py-2 text-center"
              >
                <p className="text-[10px] uppercase tracking-wide text-slate-600 dark:text-slate-400">
                  {formatDay(d.date)}
                </p>
                <meta.Icon size={14} className={accentText} />
                <p className="text-[11px] font-semibold text-slate-900 dark:text-white tabular-nums">
                  {formatTemp(d.max)} <span className="text-slate-500">/ {formatTemp(d.min)}</span>
                </p>
                {Number.isFinite(d.precipChance) && d.precipChance > 0 && (
                  <p className="text-[9px] text-sky-600 dark:text-sky-300">
                    {Math.round(d.precipChance)}% rain
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function WeatherPanel({ weather, destinationLabel }) {
  if (!weather) return null
  // Only show weather for the destination (where the user is going).
  const destination = weather.destination
  if (!destination) return null

  const placeName = destinationLabel || 'Destination'

  return (
    <div
      className="mb-6 sm:mb-8 rounded-2xl border border-slate-900/10 dark:border-white/10 glass p-4 sm:p-5 animate-slide-up w-full min-w-0"
      style={{ animationDelay: '0.14s' }}
    >
      <div className="mb-3 flex items-center gap-2 min-w-0">
        <CloudSun size={16} className="text-cyan-600 dark:text-cyan-300 shrink-0" />
        <h3 className="text-sm font-bold tracking-wide text-slate-900 dark:text-white truncate">
          Weather in {placeName}
        </h3>
      </div>
      <p className="mb-4 text-xs text-slate-600 dark:text-slate-400">
        Current conditions and a 3-day outlook for your destination — pack accordingly.
      </p>

      <div className="max-w-xl mx-auto">
        <WeatherCard label={placeName} weather={destination} accent="gold" />
      </div>
    </div>
  )
}
