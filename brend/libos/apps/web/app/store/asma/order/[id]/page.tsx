'use client'

import { use } from 'react'
import { OrderTracking } from '@/components/shared/order-tracking'
import { fetchOrderById } from '@/lib/asma/orders'

export default function OrderTrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <OrderTracking slug="asma" orderId={id} fetchOrderById={fetchOrderById} />
}
