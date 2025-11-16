'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { Property } from '@/data/mockData'
import BottomNav from '@/components/BottomNav'
import { formatPrice, formatPriceBuy } from '@/lib/formatPrice'

const RUSSIAN_CITIES = [
  'Все города',
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Екатеринбург',
  'Новосибирск',
  'Нижний Новгород',
  'Краснодар',
  'Сочи',
  'Ростов-на-Дону',
  'Уфа',
]

export default function DiscoverPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [rentType, setRentType] = useState<'monthly' | 'daily'>('monthly') // 'monthly' - на месяц, 'daily' - посуточно
  const [viewType, setViewType] = useState<'rent' | 'buy'>('rent') // 'rent' - аренда, 'buy' - покупка
  const [selectedCity, setSelectedCity] = useState<string>('Все города')
  const [showCityPicker, setShowCityPicker] = useState(false)

  useEffect(() => {
    // Проверяем версию данных и обновляем если нужно
    const DATA_VERSION = '5.0'
    const currentVersion = storage.get('dataVersion', '1.0')
    
    const loadProperties = (props: Property[]) => {
      setProperties(props)
      
      const location = searchParams.get('location') || ''
      const beds = searchParams.get('beds') || ''
      const baths = searchParams.get('baths') || ''
      const squareFeet = searchParams.get('squareFeet') || ''
      const type = searchParams.get('type') || 'rent'
      const city = searchParams.get('city') || ''

      // Устанавливаем выбранный тип из URL
      if (type === 'buy' || type === 'rent') {
        setViewType(type)
      }

      // Устанавливаем выбранный город из URL
      if (city && city !== selectedCity) {
        setSelectedCity(city)
      } else if (!city && selectedCity !== 'Все города') {
        setSelectedCity('Все города')
      }

      let filtered = props.filter((p) => p.type === type && p.available)

      if (city && city !== 'Все города') {
        filtered = filtered.filter((p) => p.city === city)
      }

      if (location) {
        filtered = filtered.filter(
          (p) =>
            p.address.toLowerCase().includes(location.toLowerCase()) ||
            p.city.toLowerCase().includes(location.toLowerCase())
        )
      }
      if (beds) {
        filtered = filtered.filter((p) => p.beds >= parseInt(beds))
      }
      if (baths) {
        filtered = filtered.filter((p) => p.baths >= parseInt(baths))
      }
      if (squareFeet) {
        filtered = filtered.filter((p) => p.squareFeet >= parseInt(squareFeet))
      }

      setFilteredProperties(filtered)
    }
    
    if (currentVersion !== DATA_VERSION) {
      import('@/data/mockData').then(({ initialProperties }) => {
        storage.set(STORAGE_KEYS.PROPERTIES, initialProperties)
        storage.set('dataVersion', DATA_VERSION)
        loadProperties(initialProperties)
      })
    } else {
      const allProperties = storage.get<Property[]>(STORAGE_KEYS.PROPERTIES, [])
      loadProperties(allProperties)
    }
  }, [searchParams, selectedCity])

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    setShowCityPicker(false)
    const params = new URLSearchParams(searchParams.toString())
    if (city === 'Все города') {
      params.delete('city')
    } else {
      params.set('city', city)
    }
    router.push(`/discover?${params.toString()}`)
  }

  const handleTypeChange = (type: 'rent' | 'buy') => {
    setViewType(type)
    const params = new URLSearchParams(searchParams.toString())
    params.set('type', type)
    router.push(`/discover?${params.toString()}`)
  }

  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.city-picker-container')) {
        setShowCityPicker(false)
      }
    }

    if (showCityPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCityPicker])

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24" suppressHydrationWarning>
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Заголовок и переключатель */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Рекомендуемые объекты</h1>
          <button
            onClick={() => router.push('/map')}
            className="text-[#0078D4] font-medium text-sm hover:underline flex items-center space-x-1 active:scale-95 transition-transform"
          >
            <span>🗺️</span>
            <span>Карта</span>
          </button>
        </div>

        {/* Переключатель Аренда/Купить */}
        <div className="flex space-x-1 mb-4 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => handleTypeChange('rent')}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all active:scale-95 ${
              viewType === 'rent'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Аренда
          </button>
          <button
            onClick={() => handleTypeChange('buy')}
            className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all active:scale-95 ${
              viewType === 'buy'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Купить
          </button>
        </div>

        {/* Выбор города */}
        <div className="relative mb-4 city-picker-container">
          <button
            onClick={() => setShowCityPicker(!showCityPicker)}
            className="w-full bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm flex items-center justify-between hover:bg-gray-50 active:scale-98 transition-all"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">📍</span>
              <span className="font-medium text-gray-900">{selectedCity}</span>
            </div>
            <span className={`text-gray-400 transition-transform duration-300 ${showCityPicker ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {showCityPicker && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-64 overflow-y-auto animate-fade-in">
              {RUSSIAN_CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCityChange(city)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-all ${
                    selectedCity === city ? 'bg-[#0078D4]/10 text-[#0078D4] font-medium' : 'text-gray-900'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Переключатель Посуточно/На месяц в стиле ЦИАН (только для аренды) */}
        {viewType === 'rent' && (
          <div className="flex space-x-1 mb-4 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setRentType('monthly')}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all active:scale-95 ${
                rentType === 'monthly'
                  ? 'bg-[#0078D4] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              На месяц
            </button>
            <button
              onClick={() => setRentType('daily')}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all active:scale-95 ${
                rentType === 'daily'
                  ? 'bg-[#0078D4] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Посуточно
            </button>
          </div>
        )}

        {/* Список объектов в стиле ЦИАН */}
        <div className="space-y-0">
          {filteredProperties.map((property, index) => (
            <div
              key={property.id}
              onClick={() => router.push(`/property/${property.id}`)}
              className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-all cursor-pointer active:scale-[0.98]"
            >
              <div className="flex p-4">
                {/* Изображение слева */}
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-5xl flex-shrink-0 mr-4">
                  {property.images[0] || '🏠'}
                </div>
                
                {/* Информация справа */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg font-bold text-gray-900">
                          {property.type === 'buy' 
                            ? formatPriceBuy(property.priceBuy || property.price)
                            : rentType === 'daily' 
                              ? formatPrice(property.priceDaily || property.price / 30)
                              : formatPrice(property.price)
                          }
                          <span className="text-sm font-normal text-gray-600">
                            {property.type === 'buy' 
                              ? '' 
                              : rentType === 'daily' ? '/сутки' : '/мес'
                            }
                          </span>
                        </span>
                        {property.featured && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded font-medium">
                            ⭐ РЕКОМЕНДУЕТСЯ
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {property.title}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-600 mb-2">
                    <span className="mr-2">🚇 Метро</span>
                    <span className="text-gray-900 font-medium">{property.metro || property.city}</span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 truncate">
                    {property.address}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span>🛏️ {property.beds}</span>
                    <span>🚿 {property.baths}</span>
                    <span>📐 {property.squareFeet} м²</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600">Объекты не найдены</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

