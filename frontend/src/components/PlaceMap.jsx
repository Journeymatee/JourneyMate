import React from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Small OSM map for a single point. Uses CircleMarker so bundlers do not need default marker assets.
 * If a parent gives `className="h-full"` the map stretches to fill it; otherwise falls back to a fixed height.
 */
export default function PlaceMap({ lat, lng, label, accent = 'green', className = '' }) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null
  }

  const stroke = accent === 'amber' ? '#f59e0b' : '#22c55e'
  const fill   = accent === 'amber' ? '#f59e0b' : '#22c55e'
  const hasExplicitHeight = /h-\[|h-full|h-\d/.test(className)

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 ${className}`}
      style={hasExplicitHeight ? undefined : { minHeight: 200 }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={12}
        className={`z-0 w-full h-full ${hasExplicitHeight ? '' : 'h-[200px] sm:h-[220px]'}`}
        scrollWheelZoom={false}
        dragging
        doubleClickZoom={false}
        attributionControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <CircleMarker
          center={[lat, lng]}
          radius={11}
          pathOptions={{
            color: stroke,
            weight: 2.5,
            fillColor: fill,
            fillOpacity: 0.6,
          }}
        >
          {label ? (
            <Tooltip direction="top" offset={[0, -6]} opacity={1} permanent>
              <span style={{ fontWeight: 700 }}>{label}</span>
            </Tooltip>
          ) : null}
        </CircleMarker>
      </MapContainer>
    </div>
  )
}
