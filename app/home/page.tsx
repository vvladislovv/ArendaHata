'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { User, Property } from '@/data/mockData'
import BottomNav from '@/components/BottomNav'
import { formatPrice, formatPriceBuy } from '@/lib/formatPrice'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [searchLocation, setSearchLocation] = useState('')
  const [beds, setBeds] = useState('')
  const [baths, setBaths] = useState('')
  const [squareFeet, setSquareFeet] = useState('')
  const [type, setType] = useState<'buy' | 'rent'>('rent')
  const [recommendedProperties, setRecommendedProperties] = useState<Property[]>([])

  useEffect(() => {
    // Инициализация пользователя без проверки авторизации
    const currentUser = storage.get<User | null>(STORAGE_KEYS.USER, null)
    if (!currentUser) {
      // Если пользователя нет, создаем дефолтного
      import('@/data/mockData').then(({ initialUsers }) => {
        storage.set(STORAGE_KEYS.USER, initialUsers[0])
        setUser(initialUsers[0])
      })
    } else {
      setUser(currentUser)
    }

    // Проверяем версию данных и загружаем рекомендуемые объекты
    const DATA_VERSION = '5.0'
    const currentVersion = storage.get('dataVersion', '1.0')
    
    if (currentVersion !== DATA_VERSION) {
      import('@/data/mockData').then(({ initialProperties }) => {
        storage.set(STORAGE_KEYS.PROPERTIES, initialProperties)
        storage.set('dataVersion', DATA_VERSION)
        const featured = initialProperties.filter((p) => p.featured && p.available).slice(0, 10)
        setRecommendedProperties(featured)
      })
    } else {
      const allProperties = storage.get<Property[]>(STORAGE_KEYS.PROPERTIES, [])
      const featured = allProperties.filter((p) => p.featured && p.available).slice(0, 10)
      setRecommendedProperties(featured)
    }
  }, [])

  const handleSearch = () => {
    router.push(`/discover?location=${searchLocation}&beds=${beds}&baths=${baths}&squareFeet=${squareFeet}&type=${type}`)
  }

  if (!user) {
    return <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">Загрузка...</div>
  }

  const userName = user?.name || 'Гость'

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20" suppressHydrationWarning>
      <div className="max-w-2xl mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Привет {userName}, Давайте начнем исследовать
        </h1>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setType('buy')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95 ${
              type === 'buy'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Купить
          </button>
          <button
            onClick={() => setType('rent')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95 ${
              type === 'rent'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Арендовать
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4] focus:border-transparent mb-4 text-gray-700"
            placeholder="Город, адрес, метро, район..."
          />

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">Спальни</label>
              <input
                type="number"
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4] text-gray-700"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">Ванные</label>
              <input
                type="number"
                value={baths}
                onChange={(e) => setBaths(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4] text-gray-700"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1 font-medium">Площадь, м²</label>
              <input
                type="number"
                value={squareFeet}
                onChange={(e) => setSquareFeet(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4] text-gray-700"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="w-full py-3 bg-[#0078D4] text-white font-medium rounded-lg hover:bg-[#0066B2] active:scale-95 transition-all shadow-md"
        >
          Найти
        </button>

        {/* Рекомендуемые объекты */}
        {recommendedProperties.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Рекомендуемые объекты</h2>
            <div className="space-y-3">
              {recommendedProperties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => router.push(`/property/${property.id}`)}
                  className="bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer active:scale-[0.98] shadow-sm"
                >
                  <div className="flex p-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-4xl flex-shrink-0 mr-4">
                      {property.images[0] || '🏠'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-sm font-bold text-gray-900 flex-1">
                          {property.title}
                        </h3>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded font-medium ml-2">
                          ⭐
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600 mb-1">
                        <span className="mr-2">🚇</span>
                        <span className="text-gray-900 font-medium">{property.metro || property.city}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 truncate">
                        {property.address}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-gray-600">
                          <span>🛏️ {property.beds}</span>
                          <span>🚿 {property.baths}</span>
                          <span>📐 {property.squareFeet} м²</span>
                        </div>
                        <span className="text-base font-bold text-gray-900">
                          {property.type === 'buy' 
                            ? formatPriceBuy(property.priceBuy || property.price)
                            : formatPrice(property.price) + '/мес'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

