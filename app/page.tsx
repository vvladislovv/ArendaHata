'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { storage, STORAGE_KEYS } from '@/lib/storage'

export default function SplashPage() {
  const router = useRouter()
  const [showLogo, setShowLogo] = useState(true)

  useEffect(() => {
    const isInitialized = storage.get('initialized', false)
    
    if (!isInitialized) {
      import('@/data/mockData').then(({ initialUsers, initialProperties, initialChats }) => {
        // Сохраняем пользователя только если его нет
        const currentUser = storage.get(STORAGE_KEYS.USER, null)
        if (!currentUser) {
          storage.set(STORAGE_KEYS.USER, initialUsers[0])
        }
        
        // Всегда обновляем список пользователей и объекты
        storage.set(STORAGE_KEYS.USERS, initialUsers)
        storage.set(STORAGE_KEYS.PROPERTIES, initialProperties)
        storage.set(STORAGE_KEYS.CHATS, initialChats)
        
        // Сохраняем бронирования только если их нет
        const currentBookings = storage.get(STORAGE_KEYS.BOOKINGS, [])
        if (currentBookings.length === 0) {
          storage.set(STORAGE_KEYS.BOOKINGS, [])
        }
        
        storage.set('initialized', true)
      })
    }

    // Показываем логотип 2 секунды, затем переходим на главную
    const timer = setTimeout(() => {
      setShowLogo(false)
      setTimeout(() => {
        router.push('/home')
      }, 500)
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  if (showLogo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F5F5]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-in">🏠</div>
          <h1 className="text-4xl font-bold text-gray-900">Аренда Недвижимости</h1>
        </div>
      </div>
    )
  }

  return null
}

