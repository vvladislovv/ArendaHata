import type { Metadata, Viewport } from 'next'
import './globals.css'
import { TelegramProvider } from '@/components/TelegramProvider'

export const metadata: Metadata = {
  title: 'Orelax - Аренда недвижимости',
  description: 'Все-в-одном платформа для аренды недвижимости',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body suppressHydrationWarning>
        <TelegramProvider>
          {children}
        </TelegramProvider>
      </body>
    </html>
  )
}

