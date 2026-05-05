import React, { useState } from 'react'
import {
  CloudSun,
  Sun,
  Cloud,
  CloudFog,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  Disc3,
  Route,
  ShoppingBag,
  ChefHat,
  ChevronRight,
  Clock,
  Ruler,
} from 'lucide-react'
import InsightModal from './InsightModal'
import WeatherPanel from './WeatherPanel'
import MusicPanel from './MusicPanel'
import ShoppingPanel from './ShoppingPanel'
import StreetFoodPanel from './StreetFoodPanel'
import RouteDirectionMap from './RouteDirectionMap'

/* ------------------------------------------------------------------ *
 * WMO weather code → icon (mirrors WeatherPanel so tile + modal match) *
 * ------------------------------------------------------------------ */
function describeCode(code) {
  if (code == null) return { label: 'Unknown', Icon: Cloud }
  if (code === 0) return { label: 'Clear', Icon: Sun }
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
  if (t == null || !Number.isFinite(Number(t))) return '—'
  return `${Math.round(t)}°`
}

/* ------------------------------------------------------------------ *
 * Tile — a single clickable insight card                                *
 * ------------------------------------------------------------------ */
function InsightTile({
  icon: Icon,
  label,
  primary,
  secondary,
  accent = 'cyan',
  onClick,
  disabled,
}) {
  // Per-accent gradient + glow, used for the icon square & hover ring.
  // Tailwind needs literal class names so we pick from a static map (no
  // template-string interpolation that JIT can't see).
  const accentMap = {
    cyan: {
      iconBg: 'from-cyan-400 to-sky-500',
      iconShadow: 'shadow-cyan-500/30',
      hoverBorder: 'group-hover:border-cyan-400/40',
      hoverGlow: 'group-hover:shadow-cyan-500/15',
    },
    amber: {
      iconBg: 'from-amber-400 to-orange-500',
      iconShadow: 'shadow-amber-500/30',
      hoverBorder: 'group-hover:border-amber-400/40',
      hoverGlow: 'group-hover:shadow-amber-500/15',
    },
    fuchsia: {
      iconBg: 'from-fuchsia-400 to-pink-500',
      iconShadow: 'shadow-fuchsia-500/30',
      hoverBorder: 'group-hover:border-fuchsia-400/40',
      hoverGlow: 'group-hover:shadow-fuchsia-500/15',
    },
    emerald: {
      iconBg: 'from-emerald-400 to-teal-500',
      iconShadow: 'shadow-emerald-500/30',
      hoverBorder: 'group-hover:border-emerald-400/40',
      hoverGlow: 'group-hover:shadow-emerald-500/15',
    },
    violet: {
      iconBg: 'from-violet-400 to-indigo-500',
      iconShadow: 'shadow-violet-500/30',
      hoverBorder: 'group-hover:border-violet-400/40',
      hoverGlow: 'group-hover:shadow-violet-500/15',
    },
    orange: {
      iconBg: 'from-orange-400 to-rose-500',
      iconShadow: 'shadow-orange-500/30',
      hoverBorder: 'group-hover:border-orange-400/40',
      hoverGlow: 'group-hover:shadow-orange-500/15',
    },
  }
  const a = accentMap[accent] || accentMap.cyan

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex items-center gap-3 sm:gap-3.5 overflow-hidden rounded-2xl border border-slate-900/10 dark:border-white/8 bg-white/85 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.02] backdrop-blur-md px-3 sm:px-4 py-3 sm:py-3.5 text-left shadow-md shadow-slate-900/5 dark:shadow-lg dark:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-lg dark:hover:shadow-xl ${a.hoverBorder} ${a.hoverGlow} active:scale-[0.99] touch-manipulation disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-white/85 dark:disabled:hover:bg-white/[0.03]`}
    >
      {/* Inner sheen on hover — visible only in dark, where the gradient
          card needs the extra punch. Light mode already reads clean. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:via-white/20"
      />

      <div
        className={`relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${a.iconBg} text-white shadow-md ${a.iconShadow} ring-1 ring-white/40 dark:ring-white/15`}
      >
        <Icon size={18} className="sm:hidden" strokeWidth={2.2} />
        <Icon size={20} className="hidden sm:block" strokeWidth={2.2} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
          {primary}
        </p>
        {secondary && (
          <p className="truncate text-[11px] text-slate-600 dark:text-slate-400">{secondary}</p>
        )}
      </div>

      <ChevronRight
        size={16}
        className="shrink-0 text-slate-400 dark:text-slate-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-slate-900 dark:group-hover:text-white"
      />
    </button>
  )
}

/* ------------------------------------------------------------------ *
 * Public — TripInsightsBar                                             *
 * ------------------------------------------------------------------ */
export default function TripInsightsBar({
  destination,
  weather,
  routeMaps,
  osrm,
  tripType,
  vibes,
  streetFood,
}) {
  const [openId, setOpenId] = useState(null) // 'weather' | 'music' | 'shopping' | 'route' | 'food' | null

  // ── weather preview ──────────────────────────────────────────────
  const dest = weather?.destination
  const cur = dest?.current
  const wxMeta = describeCode(cur?.code)
  const weatherPrimary = cur ? `${formatTemp(cur.temperature)} · ${wxMeta.label}` : 'Live forecast'
  const weatherSecondary = cur
    ? `Feels ${formatTemp(cur.feelsLike)} in ${destination}`
    : 'Tap to load'

  // ── route preview ────────────────────────────────────────────────
  const hasRoute = !!(routeMaps?.origin && routeMaps?.destination)
  const distanceKm = osrm?.distanceKm
  const durationMin = osrm?.durationMin
  const routePrimary = (() => {
    if (Number.isFinite(distanceKm) && Number.isFinite(durationMin)) {
      const h = Math.floor(durationMin / 60)
      const m = durationMin % 60
      const dur = h > 0 ? `${h}h ${m}m` : `${m}m`
      return `${distanceKm} km · ${dur}`
    }
    return 'View route'
  })()
  const routeSecondary = hasRoute
    ? `${routeMaps.origin.label} → ${routeMaps.destination.label}`
    : 'Map unavailable'

  // ── food preview ─────────────────────────────────────────────────
  // Mirrors the way the other tiles show a "primary" line that reads as
  // a quick stat and a "secondary" line that reads as descriptive copy.
  const foodList = Array.isArray(streetFood) ? streetFood : []
  const foodCount = foodList.length
  const fineCount = foodList.filter((i) => i.tier === 'fine').length
  const streetCount = foodCount - fineCount
  const foodPrimary = foodCount > 0
    ? `${foodCount} pick${foodCount === 1 ? '' : 's'}${fineCount > 0 ? ' · fine-dining' : ''}`
    : 'Curated picks'
  const foodSecondary = foodCount > 0
    ? `${streetCount} street${fineCount > 0 ? ` · ${fineCount} fine-dining` : ''}`
    : `Famous food in ${destination}`

  return (
    <>
      <div
        className="mb-6 sm:mb-8 grid grid-cols-1 gap-2.5 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 sm:gap-3 animate-slide-up w-full min-w-0"
        style={{ animationDelay: '0.06s' }}
      >
        <InsightTile
          icon={wxMeta.Icon}
          label="Weather"
          primary={weatherPrimary}
          secondary={weatherSecondary}
          accent="cyan"
          onClick={() => setOpenId('weather')}
          disabled={!dest}
        />
        <InsightTile
          icon={Disc3}
          label="Soundtrack"
          primary="Tuned to your vibe"
          secondary={`Music for ${destination}`}
          accent="fuchsia"
          onClick={() => setOpenId('music')}
          disabled={!destination}
        />
        <InsightTile
          icon={ChefHat}
          label="Famous food"
          primary={foodPrimary}
          secondary={foodSecondary}
          accent="orange"
          onClick={() => setOpenId('food')}
          disabled={!destination}
        />
        <InsightTile
          icon={ShoppingBag}
          label="Shopping"
          primary="Bazaars, malls & crafts"
          secondary={`Shop near ${destination}`}
          accent="amber"
          onClick={() => setOpenId('shopping')}
          disabled={!destination}
        />
        <InsightTile
          icon={Route}
          label="Route"
          primary={routePrimary}
          secondary={routeSecondary}
          accent="emerald"
          onClick={() => setOpenId('route')}
          disabled={!hasRoute}
        />
      </div>

      {/* ── Modals (rendered always, content gated on `open` flag) ── */}
      <InsightModal
        open={openId === 'weather'}
        onClose={() => setOpenId(null)}
        title={`Weather in ${destination}`}
        subtitle="Live conditions and 3-day outlook"
        icon={wxMeta.Icon}
        accent="cyan"
      >
        {/* Inline-render the existing panel. We strip its outer shell by
            wrapping in a plain div — the shell is inside the panel itself,
            but it sits cleanly inside the modal too. */}
        <div className="-mt-2">
          <WeatherPanel weather={weather} destinationLabel={destination} />
        </div>
        {weather && Number.isFinite(distanceKm) && (
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-400">
            <div className="rounded-lg border border-slate-900/8 dark:border-white/8 bg-white/70 dark:bg-white/[0.03] px-3 py-2">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-500">
                <Ruler size={12} /> Distance
              </span>
              <p className="mt-0.5 font-semibold text-slate-900 dark:text-white tabular-nums">{distanceKm} km</p>
            </div>
            <div className="rounded-lg border border-slate-900/8 dark:border-white/8 bg-white/70 dark:bg-white/[0.03] px-3 py-2">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-500">
                <Clock size={12} /> Drive time
              </span>
              <p className="mt-0.5 font-semibold text-slate-900 dark:text-white tabular-nums">
                {Math.floor(durationMin / 60)}h {durationMin % 60}m
              </p>
            </div>
          </div>
        )}
      </InsightModal>

      <InsightModal
        open={openId === 'music'}
        onClose={() => setOpenId(null)}
        title={`Soundtrack for ${destination}`}
        subtitle="Tracks tuned to your trip type & vibe"
        icon={Disc3}
        accent="fuchsia"
      >
        <div className="-mt-2">
          <MusicPanel destination={destination} tripType={tripType} vibes={vibes} />
        </div>
      </InsightModal>

      <InsightModal
        open={openId === 'shopping'}
        onClose={() => setOpenId(null)}
        title={`Shopping in ${destination}`}
        subtitle="Bazaars, malls and craft hubs — opens in Google Maps"
        icon={ShoppingBag}
        accent="amber"
      >
        <div className="-mt-2">
          <ShoppingPanel destination={destination} />
        </div>
      </InsightModal>

      <InsightModal
        open={openId === 'food'}
        onClose={() => setOpenId(null)}
        title={`Famous food in ${destination}`}
        subtitle="Local favourites — markets, dhabas, fine dining"
        icon={ChefHat}
        accent="orange"
      >
        <div className="-mt-2">
          <StreetFoodPanel items={streetFood} destination={destination} />
        </div>
      </InsightModal>

      <InsightModal
        open={openId === 'route'}
        onClose={() => setOpenId(null)}
        title="Route map"
        subtitle={hasRoute ? `${routeMaps.origin.label} → ${routeMaps.destination.label}` : ''}
        icon={Route}
        accent="emerald"
      >
        {hasRoute && (
          <>
            <div className="mb-3 grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-400">
              <div className="rounded-lg border border-slate-900/8 dark:border-white/8 bg-white/70 dark:bg-white/[0.03] px-3 py-2">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-500">
                  <Ruler size={12} /> Distance
                </span>
                <p className="mt-0.5 font-semibold text-slate-900 dark:text-white tabular-nums">
                  {Number.isFinite(distanceKm) ? `${distanceKm} km` : '—'}
                </p>
              </div>
              <div className="rounded-lg border border-slate-900/8 dark:border-white/8 bg-white/70 dark:bg-white/[0.03] px-3 py-2">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-500">
                  <Clock size={12} /> Drive time
                </span>
                <p className="mt-0.5 font-semibold text-slate-900 dark:text-white tabular-nums">
                  {Number.isFinite(durationMin)
                    ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`
                    : '—'}
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-900/8 dark:border-white/8">
              <RouteDirectionMap
                originCoords={routeMaps.origin}
                destCoords={routeMaps.destination}
              />
            </div>
            <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-500">
              Driving distance & time via OSRM. Powered by OpenStreetMap (ODbL).
            </p>
          </>
        )}
      </InsightModal>
    </>
  )
}
