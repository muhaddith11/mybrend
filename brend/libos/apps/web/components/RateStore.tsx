'use client'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@libos/shared'
import { useLangStore } from '../store/lang'
import { useT } from '../lib/i18n'
import styles from './RateStore.module.css'

const STARS = [1, 2, 3, 4, 5]

// Do'kon bahosi — buyurtma yetkazilgandan keyin ko'rinadi. Mobil ilova
// (components/RateStore.tsx) bilan bir xil: faqat yulduzcha, matn yo'q,
// bir marta yuborilgach minnatdorchilik holatiga o'tadi.
export function RateStore({ orderId }: { orderId: string }) {
  const tr = useT(useLangStore(s => s.lang))
  const qc = useQueryClient()
  const [selected, setSelected] = useState(0)
  const [done, setDone] = useState(false)

  const send = useMutation({
    mutationFn: (rating: number) => api.orders.review(orderId, rating),
    onSuccess: () => {
      setDone(true)
      qc.invalidateQueries({ queryKey: ['my-orders'] })
    },
  })

  if (done) {
    return (
      <div className={`${styles.card} ${styles.thanksCard}`}>
        <span>✅</span>
        <span className={styles.thanks}>{tr.mRateThanks}</span>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <p className={styles.title}>{tr.mRateStore}</p>
      <p className={styles.sub}>{tr.mRateStoreSub}</p>

      <div className={styles.stars}>
        {STARS.map(n => (
          <button
            key={n}
            type="button"
            className={`${styles.starBtn} ${n <= selected ? styles.starActive : ''}`}
            onClick={() => setSelected(n)}
            disabled={send.isPending}
            aria-label={String(n)}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill={n <= selected ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 21.09a.562.562 0 01-.84-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </button>
        ))}
      </div>

      <button
        type="button"
        className={styles.btn}
        onClick={() => selected && send.mutate(selected)}
        disabled={!selected || send.isPending}
      >
        {send.isPending ? '...' : tr.mRateSend}
      </button>
    </div>
  )
}
