'use client'

// Strukturali manzil kiritish: Kvartira / Hovli ikki rejimi.
//  • Kvartira → mahalla, dom (bino), padez, etaj, kvartira raqami
//  • Hovli    → mahalla, uy raqami
// Maydonlar bitta o'qiladigan `address` matniga jamlanadi (backend `address String?`
// saqlaydi — schema o'zgarmaydi). Xarita (lat/lng) alohida boshqariladi.

export type AddressKind = 'apartment' | 'house'

export interface AddressValue {
  kind: AddressKind
  mahalla: string
  dom: string
  padez: string
  etaj: string
  kvartira: string
  uy: string
}

export const EMPTY_ADDRESS: AddressValue = {
  kind: 'apartment',
  mahalla: '',
  dom: '',
  padez: '',
  etaj: '',
  kvartira: '',
  uy: '',
}

// Strukturali maydonlardan inson o'qiy oladigan manzil satrini quradi.
export function composeAddress(v: AddressValue): string {
  const parts: string[] = []
  if (v.mahalla.trim()) parts.push(`Mahalla: ${v.mahalla.trim()}`)
  if (v.kind === 'apartment') {
    if (v.dom.trim()) parts.push(`Dom: ${v.dom.trim()}`)
    if (v.padez.trim()) parts.push(`Padez: ${v.padez.trim()}`)
    if (v.etaj.trim()) parts.push(`Etaj: ${v.etaj.trim()}`)
    if (v.kvartira.trim()) parts.push(`Kv: ${v.kvartira.trim()}`)
  } else {
    if (v.uy.trim()) parts.push(`Uy: ${v.uy.trim()}`)
  }
  return parts.join(', ')
}

// Manzil to'ldirilgan-to'ldirilmaganini tekshiradi (validatsiya uchun).
export function isAddressFilled(v: AddressValue): boolean {
  if (!v.mahalla.trim()) return false
  return v.kind === 'apartment' ? !!v.kvartira.trim() : !!v.uy.trim()
}

interface Props {
  value: AddressValue
  onChange: (v: AddressValue) => void
  /** Har bir input uchun CSS klassi (brend uslubiga moslash uchun). */
  inputClassName?: string
  /** Faol tugma/aksent rangi. */
  accent?: string
}

export function AddressForm({ value, onChange, inputClassName, accent = '#534AB7' }: Props) {
  const set = (patch: Partial<AddressValue>) => onChange({ ...value, ...patch })

  const toggleBtn = (kind: AddressKind, label: string) => {
    const active = value.kind === kind
    return (
      <button
        type="button"
        onClick={() => set({ kind })}
        style={{
          flex: 1,
          padding: '0.6rem 0.5rem',
          borderRadius: 8,
          border: `1px solid ${active ? accent : 'rgba(127,127,127,0.35)'}`,
          background: active ? accent : 'transparent',
          color: active ? '#fff' : 'inherit',
          fontWeight: active ? 600 : 400,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {label}
      </button>
    )
  }

  const field = (
    key: keyof AddressValue,
    placeholder: string,
    opts: { inputMode?: 'numeric' | 'text'; span?: boolean } = {},
  ) => (
    <input
      className={inputClassName}
      placeholder={placeholder}
      value={String(value[key] ?? '')}
      inputMode={opts.inputMode}
      onChange={(e) => set({ [key]: e.target.value } as Partial<AddressValue>)}
      style={{ width: '100%', gridColumn: opts.span ? '1 / -1' : undefined }}
    />
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Kvartira / Hovli tanlovi */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {toggleBtn('apartment', '🏢 Kvartira')}
        {toggleBtn('house', '🏠 Hovli')}
      </div>

      {/* Maydonlar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {field('mahalla', 'Mahalla', { span: true })}
        {value.kind === 'apartment' ? (
          <>
            {field('dom', 'Dom (bino)')}
            {field('padez', 'Padez', { inputMode: 'numeric' })}
            {field('etaj', 'Etaj', { inputMode: 'numeric' })}
            {field('kvartira', 'Kvartira raqami', { inputMode: 'numeric' })}
          </>
        ) : (
          field('uy', 'Uy raqami', { span: true })
        )}
      </div>
    </div>
  )
}
