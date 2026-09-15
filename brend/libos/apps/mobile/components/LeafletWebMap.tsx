import { useMemo, useRef, useEffect, createElement } from 'react'
import { View, StyleSheet, Linking, Platform, ActivityIndicator } from 'react-native'
import { WebView } from 'react-native-webview'
import type { Lang } from '@libos/shared'
import { useLangStore } from '../store/lang'
import { telHref } from '../lib/links'

// WebView ichida Leaflet (OpenStreetMap/CARTO) — web bilan bir xil xarita,
// Google Maps API kaliti kerak emas, Expo Go'da ishlaydi.
// Ikki rejim:
//   picker  — bosib joy tanlash → onSelect(lat, lng, address)  (checkout)
//   display — do'kon markerlari; pin bosilganda do'kon kartochkasi:
//             holat, baho, manzil, yetkazish, "Do'konga o'tish", yo'nalish  (bosh sahifa)

const QOQON_CENTER: [number, number] = [40.5282, 70.9428]

export interface MapStore {
  id: string
  name: string
  lat: number
  lng: number
  isOpen?: boolean
  // Kartochka uchun (ixtiyoriy — bo'lmasa o'sha qator ko'rsatilmaydi)
  slug?: string
  address?: string
  logo?: string          // to'liq URL (resolveImg orqali)
  rating?: number
  reviewCount?: number
  hasDelivery?: boolean
  deliveryTime?: number
  hasPickup?: boolean
  productCount?: number
  phone?: string
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
  /** Kartochkadagi "Do'konga o'tish" bosilganda */
  onOpenStore?: (slug: string) => void
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
    .replace(/\\u2028/g, '\\u2028')
    .replace(/\\u2029/g, '\\u2029')
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
    openStore: L("Do'konga o'tish", 'В магазин', 'Open store'),
    open: L('Ochiq', 'Открыто', 'Open'),
    closed: L('Yopiq', 'Закрыто', 'Closed'),
    isNew: L('Yangi', 'Новый', 'New'),
    products: L('mahsulot', 'товаров', 'products'),
    min: L('daq', 'мин', 'min'),
    pickup: L('Olib ketish', 'Самовывоз', 'Pickup'),
    call: L("Qo'ng'iroq", 'Позвонить', 'Call'),
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
  // Kartochka ranglari — ilova mavzusi (store/theme.ts) bilan bir xil. Asosiy tugma
  // light'da navy; dark'da oq, matni quyuq (onBrand). "Yangi" — light'da ko'k, dark'da oq.
  const P = dark
    ? { bg: '#161933', text: '#F2F2FA', muted: 'rgba(242,242,250,0.6)', chip: '#1E2140', line: 'rgba(255,255,255,0.16)', primary: '#FFFFFF', onPrimary: '#12142E', accent: '#FFFFFF' }
    : { bg: '#FFFFFF', text: '#10122B', muted: '#6B6E8A', chip: '#EFEEF9', line: 'rgba(16,18,43,0.14)', primary: '#1B1F4B', onPrimary: '#FFFFFF', accent: '#3B6CFF' }

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

    /* ── Do'kon kartochkasi (display rejimi) ── */
    .zyffPopup .leaflet-popup-content-wrapper { background: ${P.bg}; color: ${P.text}; border-radius: 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
    .zyffPopup .leaflet-popup-tip { background: ${P.bg}; }
    .zyffPopup .leaflet-popup-content { margin: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.35; }
    .zyffPopup a.leaflet-popup-close-button { color: ${P.muted}; top: 6px; right: 6px; }
    .pHead { display: flex; align-items: center; gap: 10px; padding-right: 16px; }
    .pLogo { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; flex: none; background: ${P.chip}; }
    .pInit { display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 17px; color: #fff; background: #1B1F4B; }
    .pTitle { min-width: 0; }
    .pName { font-weight: 700; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .pSub { display: flex; align-items: center; gap: 4px; margin-top: 3px; font-size: 12px; white-space: nowrap; }
    .dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
    .dot.on { background: #22C55E; }
    .dot.off { background: #9CA3AF; }
    .sep { color: ${P.muted}; margin: 0 2px; }
    .star { color: #E3A008; }
    .muted { color: ${P.muted}; }
    .new { color: ${P.accent}; font-weight: 600; }
    .pAddr { display: flex; align-items: flex-start; gap: 5px; margin-top: 10px; color: ${P.muted}; font-size: 12px; }
    .pAddr svg { flex: none; margin-top: 1px; }
    .pChips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 999px; background: ${P.chip}; color: ${P.text}; font-size: 11.5px; }
    .pBtns { display: flex; gap: 6px; margin-top: 12px; }
    .btn { flex: 1; display: flex; align-items: center; justify-content: center; height: 34px; border-radius: 10px; border: 1px solid ${P.line}; color: ${P.text}; font-weight: 600; font-size: 12.5px; cursor: pointer; user-select: none; -webkit-user-select: none; }
    .btn.primary { background: ${P.primary}; border-color: ${P.primary}; color: ${P.onPrimary}; }
    .btn.iconBtn { flex: 0 0 34px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var TXT = ${txtJson};
    var LANG = ${langJson};
    var RN = window.ReactNativeWebView;
    // Native'da WebView ko'prigi; web'da (iframe) — ota sahifaga postMessage.
    var post = function (obj) {
      var s = JSON.stringify(obj);
      if (RN) RN.postMessage(s);
      else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
    };
    // HTML injeksiyasidan himoya (do'kon ma'lumotlari kartochkada ko'rsatiladi).
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
      var ICON_PIN = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
      var ICON_CLOCK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
      var ICON_BAG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>';
      var ICON_PHONE = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>';

      var popupHtml = function (s, i) {
        var initialLetter = esc(String(s.name || '?').charAt(0).toUpperCase());
        var logo = s.logo
          ? '<img class="pLogo" src="' + esc(s.logo) + '" alt="" />'
          : '<div class="pLogo pInit">' + initialLetter + '</div>';
        var status = s.isOpen === false
          ? '<span class="dot off"></span>' + esc(TXT.closed)
          : '<span class="dot on"></span>' + esc(TXT.open);
        var rating = s.reviewCount
          ? '<span class="star">★</span>' + Number(s.rating || 0).toFixed(1) + ' <span class="muted">(' + Number(s.reviewCount) + ')</span>'
          : '<span class="new">' + esc(TXT.isNew) + '</span>';
        var chips = [];
        if (s.hasDelivery && s.deliveryTime) chips.push(ICON_CLOCK + '~' + Number(s.deliveryTime) + ' ' + esc(TXT.min));
        if (s.productCount) chips.push(ICON_BAG + Number(s.productCount) + ' ' + esc(TXT.products));
        if (s.hasPickup) chips.push(esc(TXT.pickup));
        return '<div class="pCard">'
          + '<div class="pHead">' + logo
          +   '<div class="pTitle"><div class="pName">' + esc(s.name) + '</div>'
          +   '<div class="pSub">' + status + '<span class="sep">·</span>' + rating + '</div></div>'
          + '</div>'
          + (s.address ? '<div class="pAddr">' + ICON_PIN + '<span>' + esc(s.address) + '</span></div>' : '')
          + (chips.length ? '<div class="pChips">' + chips.map(function (c) { return '<span class="chip">' + c + '</span>'; }).join('') + '</div>' : '')
          + '<div class="pBtns">'
          +   (s.slug ? '<div class="btn primary" onclick="window.openStore(' + i + ')">' + esc(TXT.openStore) + '</div>' : '')
          +   '<div class="btn" onclick="window.dir(' + i + ')">' + esc(TXT.directions) + '</div>'
          +   (s.phone ? '<div class="btn iconBtn" title="' + esc(TXT.call) + '" onclick="window.callStore(' + i + ')">' + ICON_PHONE + '</div>' : '')
          + '</div>'
          + '</div>';
      };

      stores.forEach(function (s, i) {
        if (typeof s.lat !== 'number' || typeof s.lng !== 'number') return;
        pts.push([s.lat, s.lng]);
        var m = L.marker([s.lat, s.lng], { icon: storeIcon() }).addTo(map);
        m.bindPopup(popupHtml(s, i), { className: 'zyffPopup', minWidth: 230, maxWidth: 260, autoPanPadding: [16, 16] });
      });
      if (pts.length > 1) { map.fitBounds(pts, { padding: [40,40] }); }
      else if (pts.length === 1) { map.setView(pts[0], 15); }
      window.dir = function (i) { var s = stores[i]; if (s) post({ type: 'directions', lat: s.lat, lng: s.lng }); };
      window.openStore = function (i) { var s = stores[i]; if (s && s.slug) post({ type: 'openStore', slug: s.slug }); };
      window.callStore = function (i) { var s = stores[i]; if (s && s.phone) post({ type: 'call', phone: s.phone }); };
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

export function LeafletWebMap({ mode, height = 260, dark = false, initial, onSelect, stores = [], onOpenStore }: Props) {
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
      } else if (msg.type === 'openStore' && typeof msg.slug === 'string') {
        onOpenStore?.(msg.slug)
      } else if (msg.type === 'call' && typeof msg.phone === 'string') {
        const href = telHref(msg.phone)
        if (href) Linking.openURL(href)
      }
    } catch {
      // e'tiborsiz
    }
  }

  // Web'da xarita iframe ichida: undagi tugmalar ota sahifaga postMessage yuboradi.
  // Faqat O'Z iframe'imizdan kelgan xabarni qabul qilamiz (boshqa oynalardan emas).
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const handlerRef = useRef(handleMessage)
  handlerRef.current = handleMessage
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return
    const onMsg = (e: MessageEvent) => {
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return
      if (typeof e.data === 'string') handlerRef.current({ nativeEvent: { data: e.data } })
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  // Web (brauzer) — react-native-webview ishlamaydi, iframe orqali ko'rsatamiz
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrap, { height }]}>
        {createElement('iframe', {
          ref: iframeRef,
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
  loading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
})
