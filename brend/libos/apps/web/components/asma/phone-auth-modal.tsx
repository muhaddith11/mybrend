'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone, User, LogIn, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/asma/store'
import { fetchOrdersByPhone } from '@/lib/asma/orders'
import { Button } from '@/components/asma/ui/button'
import { Input } from '@/components/asma/ui/input'

interface PhoneAuthModalProps {
  open: boolean
  onClose: () => void
}

export function PhoneAuthModal({ open, onClose }: PhoneAuthModalProps) {
  const { setAuth } = useStore()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState<'input' | 'loading' | 'done'>('input')
  const [error, setError] = useState('')

  const formatPhone = (val: string) => {
    // Format: +998 50 250 05 50  (3-2-3-2-2 = 12 digits)
    const digits = val.replace(/\D/g, '').slice(0, 12)
    if (digits.length === 0) return ''
    if (digits.length <= 3) return `+${digits}`
    if (digits.length <= 5) return `+${digits.slice(0, 3)} ${digits.slice(3)}`
    if (digits.length <= 8) return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`
    if (digits.length <= 10) return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanPhone = phone.replace(/\s/g, '')
    if (cleanPhone.length < 10) {
      setError("To'liq telefon raqam kiriting")
      return
    }
    setError('')
    setStep('loading')

    try {
      // Check if phone has any orders (just for UX — not real auth)
      await fetchOrdersByPhone(cleanPhone)
      setAuth(cleanPhone, name.trim() || 'Mehmon')
      setStep('done')
      setTimeout(() => {
        onClose()
        setStep('input')
        setPhone('')
        setName('')
      }, 1500)
    } catch {
      setAuth(cleanPhone, name.trim() || 'Mehmon')
      setStep('done')
      setTimeout(() => {
        onClose()
        setStep('input')
      }, 1500)
    }
  }

  const handleClose = () => {
    onClose()
    setStep('input')
    setPhone('')
    setName('')
    setError('')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50 bg-card border border-border rounded p-8 shadow-2xl"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {step === 'done' ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-7 h-7 text-green-500" />
                </div>
                <h2 className="text-xl font-serif text-foreground mb-2">Xush kelibsiz!</h2>
                <p className="text-sm text-muted-foreground">Buyurtmalaringiz yuklanmoqda...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif text-foreground">Kirish</h2>
                    <p className="text-xs text-muted-foreground">Buyurtma tarixingizni ko&apos;ring</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">
                      <User className="w-3.5 h-3.5 inline mr-1" />
                      Ismingiz (ixtiyoriy)
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ismingiz"
                      className="bg-background border-border h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">
                      <Phone className="w-3.5 h-3.5 inline mr-1" />
                      Telefon raqami <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="+998 90 123 45 67"
                      className="bg-background border-border h-11"
                      autoFocus
                    />
                    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={step === 'loading'}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
                  >
                    {step === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Tekshirilmoqda...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Kirish
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Telefon raqamingiz buyurtmalaringizni topish uchun ishlatiladi
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


