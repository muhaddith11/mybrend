'use client'

import { PhoneAuthModal as Shared } from '@/components/shared/phone-auth-modal'
import { useStore } from '@/lib/boosner/store'
import { fetchOrdersByPhone } from '@/lib/boosner/orders'
import { Button } from '@/components/boosner/ui/button'
import { Input } from '@/components/boosner/ui/input'

interface PhoneAuthModalProps {
  open: boolean
  onClose: () => void
}

export function PhoneAuthModal(props: PhoneAuthModalProps) {
  return (
    <Shared
      {...props}
      useStore={useStore}
      fetchOrdersByPhone={fetchOrdersByPhone}
      Button={Button}
      Input={Input}
    />
  )
}
