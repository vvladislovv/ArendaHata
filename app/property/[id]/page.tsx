'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { Property } from '@/data/mockData'
import BottomNav from '@/components/BottomNav'
import { formatPrice, formatPriceBuy } from '@/lib/formatPrice'

export default function PropertyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [property, setProperty] = useState<Property | null>(null)

  useEffect(() => {
    const properties = storage.get<Property[]>(STORAGE_KEYS.PROPERTIES, [])
    const found = properties.find((p) => p.id === params.id)
    setProperty(found || null)
  }, [params.id])

  if (!property) {
    return (
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <p>Объект не найден</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      <div className="bg-white border-b border-gray-200">
        <div className="relative">
          <div className="h-64 bg-gray-100 flex items-center justify-center text-8xl">
            {property.images[0] || '🏠'}
          </div>
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
          >
            ←
          </button>
          <button className="absolute top-4 right-4 bg-white rounded-lg px-4 py-2 shadow-lg font-medium text-sm hover:bg-gray-50">
            3D Тур
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {property.title}
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            {property.address}, {property.city}
          </p>

          {/* Цены в стиле ЦИАН */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            {property.type === 'buy' ? (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Цена покупки:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPriceBuy(property.priceBuy || property.price)}
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">На месяц:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(property.price)}/мес
                  </span>
                </div>
                {property.priceDaily && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Посуточно:</span>
                    <span className="text-lg font-bold text-[#0078D4]">
                      {formatPrice(property.priceDaily)}/сутки
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span>🛏️ {property.beds} спальни</span>
            <span>🚿 {property.baths} ванные</span>
            <span>📐 {property.squareFeet} м²</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Описание объекта
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{property.description}</p>
        </div>

        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Удобства</h2>
          <div className="grid grid-cols-2 gap-3">
            {property.facilities.map((facility, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <span className="text-[#0078D4]">✓</span>
                <span className="text-gray-700">{facility}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Фотографии</h2>
          <div className="grid grid-cols-3 gap-2">
            {property.images.map((img, index) => (
              <div
                key={index}
                className="h-24 bg-gray-100 flex items-center justify-center text-4xl rounded-lg"
              >
                {img}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {property.type === 'buy' ? (
            <div className="space-y-2">
              <button
                onClick={() => router.push(`/purchase/${property.id}`)}
                className="w-full py-3 bg-[#0078D4] text-white font-medium rounded-lg hover:bg-[#0066B2] active:scale-95 transition-all shadow-md"
              >
                Купить
              </button>
              <button
                onClick={() => {
                  const phone = '+7 (495) 123-45-67'
                  if (window.confirm(`Позвонить по телефону: ${phone}?`)) {
                    window.location.href = `tel:${phone}`
                  }
                }}
                className="w-full py-3 bg-white border border-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
              >
                📞 Связаться с агентом
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push(`/booking/${property.id}`)}
              className="w-full py-3 bg-[#0078D4] text-white font-medium rounded-lg hover:bg-[#0066B2] active:scale-95 transition-all shadow-md"
            >
              Забронировать сейчас
            </button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

