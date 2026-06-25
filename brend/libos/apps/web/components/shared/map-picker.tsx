'use client'

// Xaritadan aniq joyni belgilash (checkout). Bu komponent ASOSIY ilovada
// (globals.css) ishlaydi — u yerda Tailwind YO'Q, shuning uchun barcha o'lcham/
// uslublar inline beriladi (avval `w-full h-full` kabi Tailwind klasslarga
// tayanardi → checkout'da xarita 0 balandlik bo'lib, bosib bo'lmасdi).
// Leaflet CSS statik import qilinadi (runtime dynamic import ishonchsiz edi).

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapPin, Loader2 } from 'lucide-react'

interface MapPickerProps {
  onAddressSelect: (address: string, lat: number, lng: number) => void
  initialAddress?: string
}

// Qo'qon city center
const QOQON_CENTER: [number, number] = [40.5282, 70.9428]

export function MapPicker({ onAddressSelect, initialAddress }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || '')
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    let cancelled = false

    import('leaflet').then((mod) => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return
      const Leaflet: any = (mod as any).default || mod

      // Fix default marker icon (Leaflet asset paths)
      delete (Leaflet.Icon.Default.prototype as any)._getIconUrl
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = Leaflet.map(mapRef.current, {
        center: QOQON_CENTER,
        zoom: 14,
        zoomControl: true,
      })

      Leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map
      setMapReady(true)
      // Konteyner o'lchami aniqlangach xaritani qayta o'lchaymiz (aks holda
      // ba'zan kulrang/yarim yuklangan ko'rinadi).
      setTimeout(() => map.invalidateSize(), 0)

      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng

        if (markerRef.current) markerRef.current.remove()
        markerRef.current = Leaflet.marker([lat, lng]).addTo(map)

        setLoading(true)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=uz`,
            { headers: { 'Accept-Language': 'uz,ru,en' } },
          )
          const data = await res.json()
          const shortAddr = buildShortAddress(data)
          setSelectedAddress(shortAddr)
          onAddressSelect(shortAddr, lat, lng)
          markerRef.current.bindPopup(shortAddr).openPopup()
        } catch {
          const coords = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
          setSelectedAddress(coords)
          onAddressSelect(coords, lat, lng)
        } finally {
          setLoading(false)
        }
      })
    })

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  function buildShortAddress(data: any): string {
    const addr = data.address || {}
    const parts: string[] = []
    if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village)
    if (addr.suburb || addr.neighbourhood) parts.push(addr.suburb || addr.neighbourhood)
    if (addr.road) parts.push(addr.road)
    if (addr.house_number) parts.push(addr.house_number)
    return parts.length > 0 ? parts.join(', ') : data.display_name
  }

  const pill: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(6px)',
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: 12,
    color: '#111',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    zIndex: 500,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          position: 'relative',
          height: 280,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
      >
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {!mapReady && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--surface-2, #f5f5f5)',
              zIndex: 500,
            }}
          >
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-3)' }} />
          </div>
        )}

        {loading && (
          <div style={{ ...pill, bottom: 12 }}>
            <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Manzil aniqlanmoqda...
          </div>
        )}

        {mapReady && !markerRef.current && !loading && (
          <div style={{ ...pill, top: 12, pointerEvents: 'none' }}>
            <MapPin size={13} style={{ color: '#534AB7' }} /> Xaritadan uyingizni tanlang
          </div>
        )}
      </div>

      {selectedAddress && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            padding: '8px 12px',
            background: 'rgba(83,74,183,0.06)',
            border: '1px solid rgba(83,74,183,0.20)',
            borderRadius: 8,
          }}
        >
          <MapPin size={16} style={{ color: '#534AB7', marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: 14, color: 'var(--text)', margin: 0 }}>{selectedAddress}</p>
        </div>
      )}
    </div>
  )
}
