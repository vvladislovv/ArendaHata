'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { Booking, Property } from '@/data/mockData'
import { formatPrice, formatPriceWithDiscount } from '@/lib/formatPrice'

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('citi')
  const [redeemCode, setRedeemCode] = useState('Orelax@437')
  const [rentType, setRentType] = useState<'monthly' | 'daily'>('monthly')

  useEffect(() => {
    const bookings = storage.get<Booking[]>(STORAGE_KEYS.BOOKINGS, [])
    const found = bookings.find((b) => b.id === params.id)
    setBooking(found || null)

    let initialRentType: 'monthly' | 'daily' = 'monthly'
    if (found) {
      if (found.rentType) {
        initialRentType = found.rentType
      }
      const properties = storage.get<Property[]>(STORAGE_KEYS.PROPERTIES, [])
      const prop = properties.find((p) => p.id === found.propertyId)
      setProperty(prop || null)
    }
    
    const rentTypeParam = searchParams.get('rentType')
    if (rentTypeParam === 'daily' || rentTypeParam === 'monthly') {
      initialRentType = rentTypeParam
    }
    setRentType(initialRentType)
  }, [params.id, searchParams])

  const handleRentTypeChange = (type: 'monthly' | 'daily') => {
    if (type === rentType) return
    setRentType(type)
    setBooking((prev) => {
      if (!prev) return prev
      const updatedBooking = { ...prev, rentType: type }
      const bookings = storage.get<Booking[]>(STORAGE_KEYS.BOOKINGS, [])
      const updatedList = bookings.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
      storage.set(STORAGE_KEYS.BOOKINGS, updatedList)
      return updatedBooking
    })
  }

  const handlePayment = () => {
    if (booking) {
      const bookings = storage.get<Booking[]>(STORAGE_KEYS.BOOKINGS, [])
      const updated = bookings.map((b) =>
        b.id === booking.id ? { ...b, status: 'confirmed' as const, rentType } : b
      )
      storage.set(STORAGE_KEYS.BOOKINGS, updated)
      alert('Бронирование подтверждено!')
      router.push('/home')
    }
  }

  if (!booking || !property) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-32" suppressHydrationWarning>
      <div className="max-w-2xl mx-auto px-4 py-4 pb-32">
        <button
          onClick={() => router.back()}
          className="mb-4 text-[#0078D4] font-medium hover:underline"
        >
          ← Назад
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Оформление заказа</h1>

        {property.type === 'rent' && property.priceDaily && (
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Тип аренды</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => handleRentTypeChange('monthly')}
                className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
                  rentType === 'monthly'
                    ? 'bg-[#0078D4] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                На месяц
              </button>
              <button
                onClick={() => handleRentTypeChange('daily')}
                className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
                  rentType === 'daily'
                    ? 'bg-[#0078D4] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Посуточно
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Оплата</h2>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('citi')}
              className={`w-full p-4 rounded-lg border-2 transition-all active:scale-98 ${
                paymentMethod === 'citi'
                  ? 'border-[#0078D4] bg-blue-50'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Сбербанк</p>
                  <p className="text-sm text-gray-600">Баланс: {formatPrice(83298)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">**** 4383</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Промокод</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
              placeholder="Введите промокод"
            />
            <button className="px-4 sm:px-6 py-3 bg-[#0078D4] text-white rounded-lg font-medium hover:bg-[#0066B2] active:scale-95 transition-all shadow-md whitespace-nowrap flex-shrink-0">
              Применить
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600">Стоимость</span>
            <span className="font-bold text-gray-900">
              {rentType === 'daily' && property.priceDaily
                ? `${formatPrice(property.priceDaily)}/сутки`
                : `${formatPrice(property.price)}/мес`}
            </span>
          </div>
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600">Скидка (15%)</span>
            <span className="font-bold text-[#0078D4]">
              -{formatPrice(Math.round((rentType === 'daily' && property.priceDaily ? property.priceDaily : property.price) * 0.15))}
            </span>
          </div>
          <div className="border-t border-gray-300 pt-2 mt-2 mb-4">
            <div className="flex justify-between">
              <span className="text-lg font-bold text-gray-900">Итого</span>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(Math.round((rentType === 'daily' && property.priceDaily ? property.priceDaily : property.price) * 0.85))}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Фиксированная кнопка оплаты внизу экрана */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#F5F5F5] border-t border-gray-200 pt-4 pb-4 px-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handlePayment}
            className="w-full py-4 bg-[#0078D4] text-white font-medium rounded-lg hover:bg-[#0066B2] active:scale-95 transition-all shadow-md"
          >
            Оплатить
          </button>
        </div>
      </div>
    </div>
  )
}

