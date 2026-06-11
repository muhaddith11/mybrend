'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminRoot() {
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) router.replace('/dashboard')
    else router.replace('/login')
  }, [])
  return null
}
