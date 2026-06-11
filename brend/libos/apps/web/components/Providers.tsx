'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/auth'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInit>{children}</AuthInit>
    </QueryClientProvider>
  )
}

function AuthInit({ children }: { children: React.ReactNode }) {
  const init = useAuthStore(s => s.init)
  const ran = useRef(false)
  useEffect(() => {
    if (ran.current) return
    ran.current = true
    init()
  }, [])
  return <>{children}</>
}
