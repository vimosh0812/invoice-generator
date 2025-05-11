import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lightspeed Labs',
  description: 'Lightspeed Labs Invoice Generator',
  generator: 'lightspeedlabs',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
