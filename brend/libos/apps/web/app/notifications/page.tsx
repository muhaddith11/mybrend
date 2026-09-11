'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@libos/shared'
import type { Notification } from '@libos/shared'
import { useAuthStore } from '../../store/auth'
import { useLangStore } from '../../store/lang'
import { useT } from '../../lib/i18n'
import styles from './page.module.css'

const TYPE_ICON: Record<string, string> = {
  ORDER_STATUS: '📦',
  STORE_ANNOUNCEMENT: '📣',
}

export default function NotificationsPage() {
  const router = useRouter()
  const { isLoggedIn, openLogin } = useAuthStore()
  const tr = useT(useLangStore(s => s.lang))
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.list(),
    enabled: isLoggedIn,
  })
  const notifications: Notification[] = data?.notifications ?? []
  const hasUnread = notifications.some(n => !n.read)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
    queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
  }

  const markAllRead = useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: invalidate,
  })

  function open(n: Notification) {
    if (!n.read) api.notifications.markRead(n.id).then(invalidate).catch(() => {})
    if (n.data?.orderId) router.push('/orders')
    else if (n.data?.storeSlug) router.push(`/store/${n.data.storeSlug}`)
  }

  if (!isLoggedIn) {
    return (
      <div className={styles.center}>
        <p>{tr.ntLoginView}</p>
        <button className={styles.loginBtn} onClick={openLogin}>{tr.login}</button>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      <div className={styles.head}>
        <h1 className={styles.title}>{tr.ntTitle}</h1>
        {hasUnread && (
          <button
            className={styles.markAll}
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            {tr.ntMarkAllRead}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loading}>{tr.mLoading}</div>
      ) : notifications.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🔔</div>
          <p>{tr.ntEmpty}</p>
          <span className={styles.emptyHint}>{tr.ntEmptyHint}</span>
        </div>
      ) : (
        <div className={styles.list}>
          {notifications.map(n => (
            <button
              key={n.id}
              className={`${styles.card} ${n.read ? '' : styles.unread}`}
              onClick={() => open(n)}
            >
              <span className={styles.icon}>{TYPE_ICON[n.type] ?? '🔔'}</span>
              <span className={styles.body}>
                <span className={styles.cardTitle}>{n.title}</span>
                <span className={styles.text}>{n.body}</span>
                <span className={styles.date}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </span>
              {!n.read && <span className={styles.dot} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
