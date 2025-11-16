'use client'

import { useEffect } from 'react'

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp
      tg.ready()
      tg.expand()
      
      // Настройка цветов темы (проверяем версию перед установкой)
      try {
        if (tg.version && parseFloat(tg.version) >= 6.1) {
          tg.setHeaderColor('#4CAF50')
          tg.setBackgroundColor('#E8F5E9')
        }
      } catch (e) {
        // Игнорируем ошибки версии
      }
    }
  }, [])

  return <>{children}</>
}

