/**
 * RouteDirectionMap
 *
 * 100% FREE — uses OpenStreetMap tiles + OSRM public routing API.
 * No API key, no billing, no Google account required.
 *
 * If VITE_GOOGLE_MAPS_API_KEY is set in .env.local the map
 * automatically upgrades to Google Maps Directions embed.
 */
import React, { useEffect, useState } from 'react'
import {
  MapContainer, TileLayer, CircleMarker, Tooltip,
  Polyline, useMap,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

/* ── helpers ───────────────────────────────────────────────── */

function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions?.length >= 2) {
      try { map.fitBounds(positions, { padding: [50, 50] }) } catch (_) {}
    }
  }, [map, positions])
  return null
}

/**
 * Fetch actual road route from OSRM public demo server.
 * Returns array of [lat, lng] or null on error.
 */
async function fetchOSRMRoute(from, to) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}` +
    `?overview=full&geometries=geojson`
  try {
    const res = await fetch(url)
    const data = await res.json()
    if (data.routes?.[0]) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
    }
  } catch (_) {}
  return null
}

/* ── OSM / Leaflet map ─────────────────────────────────────── */

function OSMRoute({ originCoords, destCoords }) {
  const [routePoints, setRoutePoints] = useState(null)
  const [loading, setLoading] = useState(true)

  const fromPos = [originCoords.lat, originCoords.lng]
  const toPos   = [destCoords.lat,   destCoords.lng]

  useEffect(() => {
    setLoading(true)
    fetchOSRMRoute(originCoords, destCoords).then((pts) => {
      setRoutePoints(pts)
      setLoading(false)
    })
  }, [originCoords.lat, originCoords.lng, destCoords.lat, destCoords.lng])

  /* fallback curved line when OSRM is unavailable */
  const fallbackArc = () => {
    const mid = [
      (fromPos[0] + toPos[0]) / 2,
      (fromPos[1] + toPos[1]) / 2,
    ]
    const d = Math.hypot(toPos[0] - fromPos[0], toPos[1] - fromPos[1])
    return [fromPos, [mid[0] + d * 0.3, mid[1]], toPos]
  }

  const line = routePoints ?? fallbackArc()

  return (
    <>
      <FitBounds positions={[fromPos, toPos]} />

      {/* Route line */}
      <Polyline
        positions={line}
        pathOptions={{
          color: '#22c55e',
          weight: 3,
          opacity: 0.85,
          dashArray: routePoints ? undefined : '10 6',
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />

      {/* Origin pin */}
      <CircleMarker
        center={fromPos}
        radius={11}
        pathOptions={{ color: '#16a34a', weight: 2.5, fillColor: '#22c55e', fillOpacity: 0.85 }}
      >
        <Tooltip direction="top" offset={[0, -10]} permanent opacity={1}>
          <span style={{ fontWeight: 700 }}>🟢 {originCoords.label}</span>
        </Tooltip>
      </CircleMarker>

      {/* Destination pin */}
      <CircleMarker
        center={toPos}
        radius={11}
        pathOptions={{ color: '#b45309', weight: 2.5, fillColor: '#f59e0b', fillOpacity: 0.85 }}
      >
        <Tooltip direction="top" offset={[0, -10]} permanent opacity={1}>
          <span style={{ fontWeight: 700 }}>🟡 {destCoords.label}</span>
        </Tooltip>
      </CircleMarker>

      {/* Loading overlay */}
      {loading && (
        <div
          className="absolute inset-0 z-[400] flex items-center justify-center rounded-2xl"
          style={{ background: 'rgba(10,10,20,0.5)', pointerEvents: 'none' }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-7 h-7 border-2 border-white/20 border-t-green-400 rounded-full animate-spin" />
            <span className="text-xs text-slate-300">Loading route…</span>
          </div>
        </div>
      )}
    </>
  )
}

/* ── Google Maps iframe ────────────────────────────────────── */

function GoogleMapsRoute({ origin, destination }) {
  const [loaded, setLoaded] = useState(false)
  const src =
    `https://www.google.com/maps/embed/v1/directions` +
    `?key=${GMAPS_KEY}` +
    `&origin=${encodeURIComponent(origin + ', India')}` +
    `&destination=${encodeURIComponent(destination + ', India')}` +
    `&mode=transit&language=en`

  return (
    <div className="relative w-full h-[320px] sm:h-[400px]">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10 rounded-b-2xl">
          <div className="w-8 h-8 border-2 border-white/20 border-t-green-400 rounded-full animate-spin" />
        </div>
      )}
      <iframe
        title="Route Map"
        className="w-full h-full"
        src={src}
        allowFullScreen
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{ border: 0 }}
      />
    </div>
  )
}

/* ── Public component ──────────────────────────────────────── */

export default function RouteDirectionMap({ originCoords, destCoords }) {
  if (!originCoords || !destCoords) return null

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl">
      {/* Header bar */}
      <div className="bg-slate-900/70 px-4 py-2.5 border-b border-white/8 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
          <span className="font-medium">
            {originCoords.label}
            <span className="text-slate-600 mx-1.5">→</span>
            {destCoords.label}
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-slate-500">
          {GMAPS_KEY ? 'Google Maps' : 'OpenStreetMap · OSRM routing · free'}
        </span>
      </div>

      {GMAPS_KEY ? (
        <GoogleMapsRoute origin={originCoords.label} destination={destCoords.label} />
      ) : (
        <div className="relative">
          <MapContainer
            center={[22.5937, 78.9629]}
            zoom={5}
            className="h-[320px] sm:h-[400px] w-full z-0"
            scrollWheelZoom={false}
            doubleClickZoom={false}
            attributionControl
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &bull; Routing: <a href="http://project-osrm.org">OSRM</a>'
            />
            <OSMRoute originCoords={originCoords} destCoords={destCoords} />
          </MapContainer>
        </div>
      )}
    </div>
  )
}
