'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import type { Store } from '@libos/shared'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icon (Next.js webpack issue)
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

// Qo'qon shahar markazi
const QOQON_CENTER: [number, number] = [40.5283, 70.9423]

function FitBounds({ stores }: { stores: Store[] }) {
  const map = useMap()
  useEffect(() => {
    const withCoords = stores.filter(s => s.lat && s.lng)
    if (withCoords.length > 1) {
      const bounds = L.latLngBounds(withCoords.map(s => [s.lat!, s.lng!]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [stores, map])
  return null
}

interface Props {
  stores: Store[]
  lang: string
}

export default function LeafletMap({ stores, lang }: Props) {
  const withCoords = stores.filter(s => s.lat && s.lng)

  return (
    <MapContainer
      center={QOQON_CENTER}
      zoom={14}
      style={{ width: '100%', height: '100%', borderRadius: '16px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.length > 1 && <FitBounds stores={stores} />}
      {withCoords.map(store => (
        <Marker
          key={store.id}
          position={[store.lat!, store.lng!]}
          icon={markerIcon}
        >
          <Popup>
            <div style={{ minWidth: 160 }}>
              <strong style={{ fontSize: 14 }}>{store.name}</strong>
              {store.address && (
                <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>📍 {store.address}</p>
              )}
              {store.isOpen !== undefined && (
                <p style={{ fontSize: 12, margin: '2px 0', color: store.isOpen ? '#16A34A' : '#DC2626' }}>
                  {store.isOpen
                    ? (lang === 'ru' ? 'Открыто' : lang === 'en' ? 'Open' : 'Ochiq')
                    : (lang === 'ru' ? 'Закрыто' : lang === 'en' ? 'Closed' : 'Yopiq')}
                </p>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: 8,
                  padding: '6px 12px',
                  background: '#F59E0B',
                  color: '#fff',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                🗺️ {lang === 'ru' ? 'Маршрут' : lang === 'en' ? 'Directions' : "Yo'nalish"}
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
