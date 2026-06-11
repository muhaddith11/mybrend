import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Libos Admin',
  description: "Do'kon boshqaruv paneli",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f8f8f8' }}>
        {children}
      </body>
    </html>
  )
}
