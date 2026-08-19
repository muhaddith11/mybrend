import { useMemo, createElement } from 'react'
import { View, StyleSheet, Linking, Platform, ActivityIndicator } from 'react-native'
import { WebView } from 'react-native-webview'
import type { Lang } from '@libos/shared'
import { useLangStore } from '../store/lang'

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

/**
 * `<script>` ichiga xavfsiz joylash uchun JSON. `JSON.stringify` `<` belgisini
 * qochirmaydi — matnda `</script>` uchrasa skript teg erta yopilib, qolgani HTML
 * sifatida bajarilardi (WebView'da RN ko'prigi bor, ya'ni oddiy XSS emas).
 * U+2028/2029 esa JS'da satr uzilishi hisoblanadi va sintaksisni buzadi.
 */
function safeJson(value: unknown): string {
  // `JSON.stringify(undefined)` satr emas, `undefined` qaytaradi — pastdagi
  // `.replace()` yiqilardi. `null`ga aylantiramiz: shablonda `var initial = null`
  // bo'lib chiqadi va truthy tekshiruvlari avvalgidek ishlaydi.
  return JSON.stringify(value ?? null)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

function buildHtml(opts: {
  mode: 'picker' | 'display'
  dark: boolean
  initial?: { lat: number; lng: number } | null
  stores: MapStore[]
  lang: Lang
}): string {
  const { mode, dark, initial, stores, lang } = opts
  // WebView ichidagi matnlar ilgari o'zbekcha qotib qolgan edi — endi ular ham
  // interfeys tiliga ergashadi. Nominatim'ga ham shu til yuboriladi, aks holda
  // ruscha/inglizcha foydalanuvchi o'zi tanlagan manzilni o'zbekcha ko'rardi.
  const L = (uz: string, ru: string, en: string) => (lang === 'ru' ? ru : lang === 'en' ? en : uz)
  const txtJson = safeJson({
    directions: L("Yo'nalish", 'Маршрут', 'Directions'),
    loadFailed: L(
      "Xarita yuklanmadi. Manzilni quyida qo'lda kiriting.",
      'Карта не загрузилась. Введите адрес вручную ниже.',
      'The map failed to load. Enter your address manually below.',
    ),
  })
  const langJson = safeJson(lang)
  // Light: CARTO voyager (web checkout bilan bir xil). Dark: CARTO dark_all.
  const tileUrl = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
  const center = initial ? [initial.lat, initial.lng] : QOQON_CENTER
  const storesJson = safeJson(stores)
  const initialJson = safeJson(initial)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
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
    var TXT = ${txtJson};
    var LANG = ${langJson};
    var RN = window.ReactNativeWebView;
    var post = function (obj) { if (RN) RN.postMessage(JSON.stringify(obj)); };
    // HTML injeksiyasidan himoya (do'kon nomi popup'da ko'rsatiladi).
    var esc = function (s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };

    // Leaflet'ni bir nechta CDN'dan ketma-ket yuklaymiz — biri bloklangan/uzilgan
    // bo'lsa keyingisiga o'tadi. Yagona CDN nosozligida xarita "oq ekran" bo'lmaydi.
    var CSS_URLS = [
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
      'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    ];
    var JS_URLS = [
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
      'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    ];
    function loadCss(urls, i) {
      i = i || 0;
      if (i >= urls.length) return;
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = urls[i];
      link.onerror = function () { loadCss(urls, i + 1); };
      document.head.appendChild(link);
    }
    function loadJs(urls, i, cb) {
      if (i >= urls.length) { cb(new Error('leaflet-load-failed')); return; }
      var s = document.createElement('script');
      s.src = urls[i];
      s.onload = function () { cb(); };
      s.onerror = function () { loadJs(urls, i + 1, cb); };
      document.head.appendChild(s);
    }
    loadCss(CSS_URLS, 0);
    loadJs(JS_URLS, 0, function (err) {
      if (err || !window.L) {
        document.getElementById('map').innerHTML =
          '<div style="display:flex;height:100%;align-items:center;justify-content:center;padding:16px;text-align:center;font-family:sans-serif;color:#888;font-size:13px;">' + esc(TXT.loadFailed) + '</div>';
        post({ type: 'maperror' });
        return;
      }
      initMap();
    });

    function initMap() {
    var map = L.map('map', { zoomControl: true, attributionControl: false }).setView([${center[0]}, ${center[1]}], 14);
    L.tileLayer('${tileUrl}', { maxZoom: 19 }).addTo(map);
    setTimeout(function () { map.invalidateSize(); }, 100);

    var mode = ${safeJson(mode)};
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
        var html = '<b>' + esc(s.name) + '</b><br/><div class="dirBtn" onclick="window.dir(' + s.lat + ',' + s.lng + ')">' + esc(TXT.directions) + '</div>';
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
        fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lng + '&format=json&accept-language=' + encodeURIComponent(LANG))
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
    } // initMap tugadi
  </script>
</body>
</html>`
}

export function LeafletWebMap({ mode, height = 260, dark = false, initial, onSelect, stores = [] }: Props) {
  const lang = useLangStore(s => s.lang)
  const html = useMemo(
    () => buildHtml({ mode, dark, initial, stores, lang }),
    [mode, dark, initial, stores, lang]
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
