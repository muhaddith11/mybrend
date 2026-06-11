'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface MapPickerProps {
  onAddressSelect: (address: string, lat: number, lng: number) => void
  initialAddress?: string
}

export function MapPicker({ onAddressSelect, initialAddress }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || '')
  const [mapReady, setMapReady] = useState(false)

  // Qo'qon city center
  const QOQON_CENTER: [number, number] = [40.5282, 70.9428]

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamic import to avoid SSR issues
    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css' as any),
    ]).then(([L]) => {
      const Leaflet = L.default || L

      // Fix default marker icon
      delete (Leaflet.Icon.Default.prototype as any)._getIconUrl
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = Leaflet.map(mapRef.current!, {
        center: QOQON_CENTER,
        zoom: 14,
        zoomControl: true,
      })

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map
      setMapReady(true)

      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng

        // Remove old marker
        if (markerRef.current) {
          markerRef.current.remove()
        }

        // Add new marker
        markerRef.current = Leaflet.marker([lat, lng]).addTo(map)

        // Reverse geocode
        setLoading(true)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=uz`,
            { headers: { 'Accept-Language': 'uz,ru,en' } }
          )
          const data = await res.json()
          const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
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

  return (
    <div className="space-y-2">
      <div className="relative rounded overflow-hidden border border-border" style={{ height: 280 }}>
        <div ref={mapRef} className="w-full h-full" />
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {loading && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded text-xs text-foreground flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Manzil aniqlanmoqda...
          </div>
        )}
        {mapReady && !markerRef.current && !loading && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded text-xs text-foreground flex items-center gap-1.5 pointer-events-none">
            <MapPin className="w-3 h-3 text-primary" />
            Xaritadan uyingizni tanlang
          </div>
        )}
      </div>
      {selectedAddress && (
        <div className="flex items-start gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded">
          <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">{selectedAddress}</p>
        </div>
      )}
    </div>
  )
}

