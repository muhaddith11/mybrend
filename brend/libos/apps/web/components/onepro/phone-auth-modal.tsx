'use client'

import { PhoneAuthModal as Shared } from '@/components/shared/phone-auth-modal'
import { useStore } from '@/lib/onepro/store'
import { fetchOrdersByPhone } from '@/lib/onepro/orders'
import { Button } from '@/components/onepro/ui/button'
import { Input } from '@/components/onepro/ui/input'

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
