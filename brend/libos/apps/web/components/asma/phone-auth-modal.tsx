'use client'

import { PhoneAuthModal as Shared } from '@/components/shared/phone-auth-modal'
import { useStore } from '@/lib/asma/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PhoneAuthModalProps {
  open: boolean
  onClose: () => void
}

export function PhoneAuthModal(props: PhoneAuthModalProps) {
  return (
    <Shared
      {...props}
      useStore={useStore}
      Button={Button}
      Input={Input}
    />
  )
}
