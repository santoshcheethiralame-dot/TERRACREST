import { MapContainer, TileLayer, Circle, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { GeoPoint, PublicArea } from '@/domain/types'

/**
 * The map's precision is itself part of the moat: sealed, it shows only a coarse
 * area circle (the admin's "rough pin"); unlocked, the exact coordinates — which
 * the server withholds until an NDA — drop a precise pin.
 */
export function ParcelMap({ area, exact }: { area?: PublicArea; exact?: GeoPoint }) {
  if (!area && !exact) return null
  const center: [number, number] = exact ? [exact.lat, exact.lng] : [area!.lat, area!.lng]
  const zoom = exact ? 15 : 12
  const accent = '#8A7DFF'

  return (
    <div className="relative isolate h-64 overflow-hidden border border-line">
      <MapContainer
        key={exact ? 'exact' : 'area'}
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        attributionControl={false}
        className="tc-map h-full w-full"
      >
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {exact ? (
          <>
            <Circle center={[exact.lat, exact.lng]} radius={140} pathOptions={{ color: accent, weight: 1, fillColor: accent, fillOpacity: 0.16 }} />
            <CircleMarker center={[exact.lat, exact.lng]} radius={6} pathOptions={{ color: '#0e0e11', weight: 2, fillColor: accent, fillOpacity: 1 }} />
          </>
        ) : (
          area && <Circle center={[area.lat, area.lng]} radius={area.radiusKm * 1000} pathOptions={{ color: accent, weight: 1, fillColor: accent, fillOpacity: 0.07, dashArray: '4 4' }} />
        )}
      </MapContainer>
      <div className="pointer-events-none absolute bottom-0 left-0 z-[500] border-r border-t border-line bg-ink/85 px-3 py-1.5 backdrop-blur-sm">
        <span className="label text-ivory-faint">{exact ? 'Exact location' : 'Approximate area · exact on NDA'}</span>
      </div>
    </div>
  )
}
