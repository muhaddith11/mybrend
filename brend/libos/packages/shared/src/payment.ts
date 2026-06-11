import { api } from './api'

export type PaymentProvider = 'CLICK' | 'PAYME' | 'CASH'

export interface PaymentResult {
  success: boolean
  url?: string        // Click/Payme to'lov URL
  orderId: string
  provider: PaymentProvider
}

// Mobil ilovadan to'lovni boshlash
export async function initiatePayment(
  orderId: string,
  provider: PaymentProvider
): Promise<PaymentResult> {
  if (provider === 'CASH') {
    // Naqd pul — hech qanday URL kerak emas
    return { success: true, orderId, provider: 'CASH' }
  }

  const endpoint = provider === 'CLICK' ? '/payment/click/create-url' : '/payment/payme/create-url'
  const data = await (api as any)._request(endpoint, {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  }) as { url: string; orderId: string }

  return {
    success: true,
    url: data.url,
    orderId: data.orderId,
    provider,
  }
}

// To'lov natijasini inson o'qiy oladigan matn
export function paymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Kutilmoqda",
    PAID: "To'langan",
    CANCELLED: "Bekor qilingan",
    FAILED: "Xatolik",
  }
  return labels[status] ?? status
}

export function paymentProviderLabel(provider: string): string {
  const labels: Record<string, string> = {
    CLICK: "Click",
    PAYME: "Payme",
    CASH: "Naqd pul",
  }
  return labels[provider] ?? provider
}
