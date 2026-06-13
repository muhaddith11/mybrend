'use client'
import { useEffect } from 'react'
import { useThemeStore } from '../store/theme'

export function ThemeProvider() {
  const dark = useThemeStore(s => s.dark)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  return null
}
