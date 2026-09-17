import { ImageResponse } from 'next/og'

// Google qidiruv natijasi va brauzer tab'idagi rasmcha (favicon).
// Navbar'dagi .logoMark bilan bir xil: navy fon + oq "Z" (Navy & Ko'k brend).
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1B1F4B',
          borderRadius: 14,
          color: '#fff',
          fontSize: 40,
          fontWeight: 800,
          fontFamily: 'sans-serif',
        }}
      >
        Z
      </div>
    ),
    { ...size }
  )
}
