'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import type { Store } from '@libos/shared'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Branded ZYFF sariq marker
const storeIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width:36px; height:36px;
      background:#F59E0B;
      border:3px solid #fff;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
    ">
      <div style="
        position:absolute; inset:0;
        display:flex; align-items:center; justify-content:center;
        transform:rotate(45deg);
        font-size:16px;
      ">🏪</div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -38],
})

const QOQON_CENTER: [number, number] = [40.5283, 70.9423]

function FitBounds({ stores }: { stores: Store[] }) {
  const map = useMap()
  useEffect(() => {
    const withCoords = stores.filter(s => s.lat && s.lng)
    if (withCoords.length > 1) {
      const bounds = L.latLngBounds(withCoords.map(s => [s.lat!, s.lng!]))
      map.fitBounds(bounds, { padding: [50, 50] })
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

  const t = {
    open:       lang === 'ru' ? 'Открыто'    : lang === 'en' ? 'Open'       : 'Ochiq',
    closed:     lang === 'ru' ? 'Закрыто'    : lang === 'en' ? 'Closed'     : 'Yopiq',
    route:      lang === 'ru' ? 'Маршрут'    : lang === 'en' ? 'Directions' : "Yo'nalish",
    products:   lang === 'ru' ? 'товаров'    : lang === 'en' ? 'products'   : 'mahsulot',
    viewStore:  lang === 'ru' ? 'Магазин'    : lang === 'en' ? 'Store'      : "Do'kon",
  }

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
          icon={storeIcon}
        >
          <Popup minWidth={200} maxWidth={240}>
            <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2px 0' }}>

              {/* Header: logo + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                {store.logo ? (
                  <img
                    src={store.logo}
                    alt={store.name}
                    style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: store.themeBg || '#F59E0B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>🏪</div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2, color: '#111' }}>
                    {store.name}
                  </div>
                  {store.rating && (
                    <div style={{ fontSize: 12, color: '#F59E0B', marginTop: 2 }}>
                      {'★'.repeat(Math.round(store.rating))}{'☆'.repeat(5 - Math.round(store.rating))}
                      <span style={{ color: '#888', marginLeft: 4 }}>{store.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              {store.address && (
                <div style={{ fontSize: 12, color: '#555', marginBottom: 6, display: 'flex', gap: 4 }}>
                  <span>📍</span>
                  <span>{store.address}</span>
                </div>
              )}

              {/* Open/closed + product count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                {store.isOpen !== undefined && (
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    background: store.isOpen ? '#DCFCE7' : '#FEE2E2',
                    color: store.isOpen ? '#16A34A' : '#DC2626',
                  }}>
                    {store.isOpen ? `● ${t.open}` : `● ${t.closed}`}
                  </span>
                )}
                {store._count?.products != null && (
                  <span style={{ fontSize: 11, color: '#888' }}>
                    {store._count.products} {t.products}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 6 }}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    padding: '7px 10px',
                    background: '#F59E0B',
                    color: '#fff',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  🗺️ {t.route}
                </a>
                <a
                  href={`/store/${store.slug}`}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    padding: '7px 10px',
                    background: '#F3F4F6',
                    color: '#111',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  🏪 {t.viewStore}
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
