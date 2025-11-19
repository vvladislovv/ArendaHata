'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { storage, STORAGE_KEYS } from '@/lib/storage'
import { Property, Purchase, User } from '@/data/mockData'
import { formatPriceBuy } from '@/lib/formatPrice'

export default function PurchasePage() {
  const router = useRouter()
  const params = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'mortgage' | 'full'>('full')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const properties = storage.get<Property[]>(STORAGE_KEYS.PROPERTIES, [])
    setProperty(properties.find((p) => p.id === params.id) || null)
    const currentUser = storage.get<User | null>(STORAGE_KEYS.USER, null)
    setUser(currentUser)
  }, [params.id])

  const handlePurchase = () => {
    if (!property || !user) {
      alert('Не удалось оформить покупку. Попробуйте позже.')
      return
    }
    setIsProcessing(true)
    const purchases = storage.get<Purchase[]>(STORAGE_KEYS.PURCHASES, [])
    const newPurchase: Purchase = {
      id: Date.now().toString(),
      propertyId: property.id,
      userId: user.id,
      price: property.priceBuy || property.price,
      status: 'paid',
      createdAt: new Date().toISOString(),
    }
    storage.set(STORAGE_KEYS.PURCHASES, [...purchases, newPurchase])
    alert('Заявка на покупку отправлена агенту! Он свяжется с вами в ближайшее время.')
    router.push('/home')
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24" suppressHydrationWarning>
      <div className="max-w-2xl mx-auto px-4 py-4 pb-32">
        <button
          onClick={() => router.back()}
          className="mb-4 text-[#0078D4] font-medium hover:underline"
        >
          ← Назад
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Оформление покупки</h1>

        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-2">{property.title}</h2>
          <p className="text-sm text-gray-600 mb-3">
            {property.address}, {property.city}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Стоимость</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatPriceBuy(property.priceBuy || property.price)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Способ оплаты</h2>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setPaymentMethod('full')}
              className={`w-full p-4 rounded-lg border-2 transition-all active:scale-98 ${
                paymentMethod === 'full'
                  ? 'border-[#0078D4] bg-blue-50'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Полная оплата</p>
                  <p className="text-sm text-gray-600">Банковский перевод</p>
                </div>
                <span className="text-sm text-gray-500">1-2 рабочих дня</span>
              </div>
            </button>
            <button
              onClick={() => setPaymentMethod('mortgage')}
              className={`w-full p-4 rounded-lg border-2 transition-all active:scale-98 ${
                paymentMethod === 'mortgage'
                  ? 'border-[#0078D4] bg-blue-50'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Ипотека</p>
                  <p className="text-sm text-gray-600">Одобрение за 1 день</p>
                </div>
                <span className="text-sm text-gray-500">От 5,8% годовых</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Покупатель</h2>
          <p className="text-sm text-gray-700">
            {user?.name || 'Новый покупатель'} • {user?.email || 'email@example.com'}
          </p>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#F5F5F5] border-t border-gray-200 pt-4 pb-4 px-4"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full py-4 bg-[#0078D4] text-white font-medium rounded-lg hover:bg-[#0066B2] active:scale-95 transition-all shadow-md disabled:opacity-70"
          >
            {isProcessing ? 'Обработка...' : 'Оформить покупку'}
          </button>
        </div>
      </div>
    </div>
  )
}


