import { useMemo, createElement } from 'react'
import { View, StyleSheet, Linking, Platform, ActivityIndicator } from 'react-native'
import { WebView } from 'react-native-webview'

// WebView ichida Leaflet (OpenStreetMap/CARTO) — web bilan bir xil xarita,
// Google Maps API kaliti kerak emas, Expo Go'da ishlaydi.
// Ikki rejim:
//   picker  — bosib joy tanlash → onSelect(lat, lng, address)  (checkout)
//   display — do'kon markerlari, bosib yo'nalish olish          (bosh sahifa / do'kon)

const QOQON_CENTER: [number, number] = [40.5282, 70.9428]

export interface MapStore {
  id: string
  name: string
  lat: number
  lng: number
  isOpen?: boolean
}

interface Props {
  mode: 'picker' | 'display'
  height?: number
  dark?: boolean
  // picker
  initial?: { lat: number; lng: number } | null
  onSelect?: (lat: number, lng: number, address: string) => void
  // display
  stores?: MapStore[]
}

function buildHtml(opts: {
  mode: 'picker' | 'display'
  dark: boolean
  initial?: { lat: number; lng: number } | null
  stores: MapStore[]
}): string {
  const { mode, dark, initial, stores } = opts
  // Light: CARTO voyager (web checkout bilan bir xil). Dark: CARTO dark_all.
  const tileUrl = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
  const center = initial ? [initial.lat, initial.lng] : QOQON_CENTER
  const storesJson = JSON.stringify(stores)
  const initialJson = JSON.stringify(initial)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: ${dark ? '#0E0E10' : '#F3F4F6'}; }
    .pin {
      width: 34px; height: 34px; background: #F59E0B; border: 3px solid #fff;
      border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    }
    .pin > span {
      position: absolute; inset: 0; display: flex; align-items: center;
      justify-content: center; transform: rotate(45deg); font-size: 15px;
    }
    .leaflet-popup-content { font-size: 13px; }
    .dirBtn {
      display: inline-block; margin-top: 6px; padding: 5px 10px; background: #2563EB;
      color: #fff; border-radius: 6px; font-size: 12px; text-align: center; cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var RN = window.ReactNativeWebView;
    var post = function (obj) { if (RN) RN.postMessage(JSON.stringify(obj)); };
    var map = L.map('map', { zoomControl: true, attributionControl: false }).setView([${center[0]}, ${center[1]}], 14);
    L.tileLayer('${tileUrl}', { maxZoom: 19 }).addTo(map);
    setTimeout(function () { map.invalidateSize(); }, 100);

    var mode = ${JSON.stringify(mode)};
    var storeIcon = function () {
      return L.divIcon({ className: '', html: '<div class="pin"><span>🏪</span></div>', iconSize: [34,34], iconAnchor: [17,34], popupAnchor: [0,-36] });
    };

    if (mode === 'display') {
      var stores = ${storesJson};
      var pts = [];
      stores.forEach(function (s) {
        if (typeof s.lat !== 'number' || typeof s.lng !== 'number') return;
        pts.push([s.lat, s.lng]);
        var m = L.marker([s.lat, s.lng], { icon: storeIcon() }).addTo(map);
        var html = '<b>' + s.name + '</b><br/><div class="dirBtn" onclick="window.dir(' + s.lat + ',' + s.lng + ')">Yo\\'nalish</div>';
        m.bindPopup(html);
      });
      if (pts.length > 1) { map.fitBounds(pts, { padding: [40,40] }); }
      else if (pts.length === 1) { map.setView(pts[0], 15); }
      window.dir = function (lat, lng) { post({ type: 'directions', lat: lat, lng: lng }); };
    }

    if (mode === 'picker') {
      var marker = null;
      var geocoding = false;
      var initial = ${initialJson};
      if (initial) { marker = L.marker([initial.lat, initial.lng]).addTo(map); }
      map.on('click', function (e) {
        var lat = e.latlng.lat, lng = e.latlng.lng;
        if (marker) { marker.setLatLng([lat, lng]); } else { marker = L.marker([lat, lng]).addTo(map); }
        post({ type: 'picking', lat: lat, lng: lng });
        // Nominatim foydalanish siyosati: bir vaqtda bitta so'rov (spam'ni oldini olish)
        if (geocoding) {
          post({ type: 'select', lat: lat, lng: lng, address: lat.toFixed(5) + ', ' + lng.toFixed(5) });
          return;
        }
        geocoding = true;
        fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lng + '&format=json&accept-language=uz')
          .then(function (r) { return r.json(); })
          .then(function (d) {
            var a = d.address || {};
            var parts = [];
            if (a.city || a.town || a.village) parts.push(a.city || a.town || a.village);
            if (a.suburb || a.neighbourhood) parts.push(a.suburb || a.neighbourhood);
            if (a.road) parts.push(a.road);
            if (a.house_number) parts.push(a.house_number);
            var addr = parts.length ? parts.join(', ') : (d.display_name || (lat.toFixed(5) + ', ' + lng.toFixed(5)));
            marker.bindPopup(addr).openPopup();
            post({ type: 'select', lat: lat, lng: lng, address: addr });
          })
          .catch(function () {
            var addr = lat.toFixed(5) + ', ' + lng.toFixed(5);
            post({ type: 'select', lat: lat, lng: lng, address: addr });
          })
          .finally(function () { geocoding = false; });
      });
    }
  </script>
</body>
</html>`
}

export function LeafletWebMap({ mode, height = 260, dark = false, initial, onSelect, stores = [] }: Props) {
  const html = useMemo(
    () => buildHtml({ mode, dark, initial, stores }),
    [mode, dark, initial, stores]
  )

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data)
      if (msg.type === 'select' && onSelect) {
        onSelect(msg.lat, msg.lng, msg.address ?? '')
      } else if (msg.type === 'directions') {
        // Qurilma xarita ilovasida yo'nalish ochish
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${msg.lat},${msg.lng}`)
      }
    } catch {
      // e'tiborsiz
    }
  }

  // Web (brauzer) — react-native-webview ishlamaydi, iframe orqali ko'rsatamiz
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrap, { height }]}>
        {createElement('iframe', {
          srcDoc: html,
          style: { border: 0, width: '100%', height: '100%' },
        })}
      </View>
    )
  }

  return (
    <View style={[styles.wrap, { height }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        nestedScrollEnabled
        style={styles.web}
        // Leaflet CDN'dan yuklanadi — sekin tarmoqda bo'sh ekran o'rniga spinner.
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color="#F59E0B" />
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { width: '100%', borderRadius: 12, overflow: 'hidden' },
  web: { flex: 1, backgroundColor: 'transparent' },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
})
