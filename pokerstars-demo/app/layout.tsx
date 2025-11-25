import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './pokerstars.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PokerStars España - Registro Premium',
  description: 'Únete a la sala de poker más grande del mundo. Verificación de identidad y edad instantánea con tecnología Open Gateway de Telefónica.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}