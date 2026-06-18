'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/auth'

const KEY = 'zyff-onboarding-v1'

type Slide = {
  bg: string
  accent: string
  glow: string[]
  badge: string
  initial: string
  title: string
  sub: string
}

const SLIDES: Slide[] = [
  {
    bg: 'linear-gradient(135deg,#0F0C29 0%,#302B63 50%,#24243e 100%)',
    accent: '#FBBF24',
    glow: ['rgba(109,40,217,.55)', 'rgba(245,158,11,.4)', 'rgba(236,72,153,.35)'],
    badge: '✨ ZYFF',
    initial: 'Z',
    title: "Shahardagi barcha kiyim do'konlari — bir joyda",
    sub: "Eng yaxshi do'konlarni toping, narxlarni solishtiring va to'g'ridan-to'g'ri xarid qiling.",
  },
  {
    bg: 'linear-gradient(135deg,#14110b 0%,#2a2113 55%,#1a1a2e 100%)',
    accent: '#D9B45B',
    glow: ['rgba(217,180,91,.45)', 'rgba(180,140,60,.3)', 'rgba(255,215,120,.25)'],
    badge: '👔 ASMA DESIGN',
    initial: 'A',
    title: 'Premium erkaklar kiyimi',
    sub: 'Kostyum, koʻylak va palto — Italiya sifati, zamonaviy uslub. Asma Design butigi.',
  },
  {
    bg: 'linear-gradient(135deg,#0a0a0a 0%,#2b0a0a 55%,#000 100%)',
    accent: '#EF4444',
    glow: ['rgba(239,68,46,.5)', 'rgba(255,77,46,.35)', 'rgba(255,160,120,.25)'],
    badge: '🔥 BOOSNER',
    initial: 'B',
    title: '100% Original brendlar',
    sub: 'Adidas, Calvin Klein, New Balance va boshqalar — eng yaxshi narxlarda, kafolat bilan.',
  },
]

export function Onboarding() {
  const pathname = usePathname()
  const openLogin = useAuthStore(s => s.openLogin)
  const [show, setShow] = useState(false)
  const [i, setI] = useState(0)

  const isBespoke = /^\/store\/(asma|boosner|onepro)(\/|$)/.test(pathname ?? '')

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch {}
  }, [])

  if (!show || isBespoke) return null

  const mark = () => { try { localStorage.setItem(KEY, '1') } catch {} }
  const skip = () => { mark(); setShow(false) }
  const finish = () => { mark(); setShow(false); openLogin() }
  const next = () => { if (i < SLIDES.length - 1) setI(i + 1); else finish() }

  const s = SLIDES[i]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, overflow: 'hidden' }}>
      {/* Animated slide visual layer (bg + orbs + content) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{ position: 'absolute', inset: 0, background: s.bg, overflow: 'hidden' }}
        >
          {s.glow.map((g, k) => (
            <motion.div
              key={k}
              animate={{ y: [0, -24, 0], x: [0, 12, 0] }}
              transition={{ duration: 4 + k, repeat: Infinity, ease: 'easeInOut', delay: k * 0.5 }}
              style={{
                position: 'absolute',
                width: [220, 140, 90][k],
                height: [220, 140, 90][k],
                borderRadius: '50%',
                background: `radial-gradient(circle, ${g} 0%, transparent 70%)`,
                top: [`-40px`, `30%`, `60%`][k],
                right: [`6%`, `20%`, `12%`][k],
                pointerEvents: 'none',
              }}
            />
          ))}
          <div style={{
            position: 'absolute', right: '-4%', bottom: '-12%',
            fontSize: 'min(60vw, 420px)', fontWeight: 900,
            color: 'rgba(255,255,255,.04)', lineHeight: 1, userSelect: 'none',
          }}>{s.initial}</div>
          <div style={{
            position: 'relative', zIndex: 2, height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '0 1.5rem', maxWidth: 640, margin: '0 auto', textAlign: 'center',
          }}>
            <span style={{
              alignSelf: 'center', padding: '6px 16px', borderRadius: 999,
              background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)',
              color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '.15em', marginBottom: 24,
            }}>{s.badge}</span>
            <h1 style={{ color: '#fff', fontSize: 'clamp(28px,6vw,48px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
              {s.title.split(' — ').map((part, idx) => (
                <span key={idx} style={idx === 1 ? { color: s.accent, textShadow: `0 0 30px ${s.accent}66` } : {}}>
                  {idx === 1 ? ' — ' : ''}{part}
                </span>
              ))}
            </h1>
            <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 'clamp(15px,2.5vw,18px)', lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>{s.sub}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Static controls — har doim interaktiv (animatsiyadan tashqarida) */}
      <button
        onClick={skip}
        style={{
          position: 'absolute', top: 20, right: 20, zIndex: 4,
          background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)',
          color: '#fff', border: 'none', borderRadius: 999,
          padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Keyinga qoldirish →
      </button>

      <div style={{
        position: 'absolute', bottom: 'max(32px, env(safe-area-inset-bottom))', left: 0, right: 0, zIndex: 4,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '0 1.5rem',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {SLIDES.map((_, k) => (
            <span key={k} style={{
              width: k === i ? 28 : 8, height: 8, borderRadius: 999,
              background: k === i ? s.accent : 'rgba(255,255,255,.35)', transition: 'all .3s',
            }} />
          ))}
        </div>
        <button
          onClick={next}
          style={{
            width: '100%', maxWidth: 420, padding: '16px', borderRadius: 14,
            background: s.accent, color: '#111', border: 'none',
            fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: `0 8px 30px ${s.accent}55`,
          }}
        >
          {i < SLIDES.length - 1 ? 'Keyingi →' : 'Kirish / Ro‘yxatdan o‘tish'}
        </button>
      </div>
    </div>
  )
}
