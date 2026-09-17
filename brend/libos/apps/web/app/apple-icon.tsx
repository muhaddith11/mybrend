import { ImageResponse } from 'next/og'

// iOS "Add to Home Screen" belgisi — favicon (icon.tsx) bilan bir xil dizayn,
// Apple tavsiya qilgan 180x180 o'lchamda.
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          color: '#fff',
          fontSize: 110,
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
