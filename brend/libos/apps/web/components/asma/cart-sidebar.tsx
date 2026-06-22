'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useStore, formatPrice } from '@/lib/asma/store'
import { Button } from '@/components/ui/button'

export function CartSidebar() {
  const { isCartOpen, setCartOpen, cart, removeFromCart, updateQuantity, getCartTotal } = useStore()

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setCartOpen(false)}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span className="text-lg font-serif tracking-wider">Savat</span>
                <span className="text-sm text-muted-foreground">
                  ({cart.length} ta mahsulot)
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Savatni yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-6">Savatingiz bo&apos;sh</p>
                  <Button
                    onClick={() => setCartOpen(false)}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Xarid qilishni boshlang
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <motion.div
                      key={`${item.product.id}-${item.size}-${item.color}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex gap-4 pb-6 border-b border-border"
                    >
                      {/* Product Image */}
                      <div className="relative w-24 h-32 bg-muted rounded overflow-hidden shrink-0">
                        <Image
                          src={item.product.images[0] || '/asma/placeholder.jpg'}
                          alt={item.product.nameUz}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-foreground mb-1 truncate">
                          {item.product.nameUz}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          O&apos;lcham: {item.size} | Rang: {item.color}
                        </p>
                        <p className="text-primary font-medium">
                          {formatPrice(item.product.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 border border-border rounded">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.size,
                                  item.color,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Miqdorni kamaytirish"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.size,
                                  item.color,
                                  item.quantity + 1
                                )
                              }
                              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Miqdorni ko'paytirish"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() =>
                              removeFromCart(item.product.id, item.size, item.color)
                            }
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Mahsulotni o'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Jami:</span>
                  <span className="text-xl font-serif text-primary">
                    {formatPrice(getCartTotal())}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Yetkazib berish narxi buyurtma tasdiqlanganda hisoblanadi
                </p>
                <Button
                  asChild
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                  onClick={() => setCartOpen(false)}
                >
                  <Link href="/store/asma/checkout">Buyurtmani rasmiylashtirish</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}




