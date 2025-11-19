'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { Property, Booking, User } from '@/data/mockData'

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [adults, setAdults] = useState(1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [rentType, setRentType] = useState<'monthly' | 'daily'>('monthly')

  useEffect(() => {
    const properties = storage.get<Property[]>(STORAGE_KEYS.PROPERTIES, [])
    const found = properties.find((p) => p.id === params.id)
    setProperty(found || null)
  }, [params.id])

  const handleBooking = () => {
    if (!selectedDate) {
      alert('Пожалуйста, выберите дату')
      return
    }

    const bookingDate = selectedDate
    let user = storage.get<User | null>(STORAGE_KEYS.USER, null)
    if (!user) {
      // Создаем дефолтного пользователя если его нет
      import('@/data/mockData').then(({ initialUsers }) => {
        const defaultUser = initialUsers[0]
        storage.set(STORAGE_KEYS.USER, defaultUser)
        createBooking(defaultUser, bookingDate)
      })
      return
    }
    createBooking(user, bookingDate)
  }

  const createBooking = (user: User, bookingDate: string) => {
    const bookings = storage.get<Booking[]>(STORAGE_KEYS.BOOKINGS, [])
    const newBooking: Booking = {
      id: Date.now().toString(),
      propertyId: property!.id,
      userId: user.id,
      date: bookingDate,
      adults,
      status: 'pending',
      rentType,
    }

    bookings.push(newBooking)
    storage.set(STORAGE_KEYS.BOOKINGS, bookings)

    router.push(`/checkout/${newBooking.id}?rentType=${rentType}`)
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        Загрузка...
      </div>
    )
  }

  // Генерация дат для календаря (июнь 2023)
  const dates = Array.from({ length: 30 }, (_, i) => i + 1)
  const availableDates = [2, 9, 15, 22, 28]

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          className="mb-4 text-[#0078D4] font-medium hover:underline"
        >
          ← Назад
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Запланировать бронирование
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          Мы нашли 6 мест рядом с вами
        </p>

        {/* Выбор типа аренды */}
        {property.type === 'rent' && (
          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Тип аренды</h2>
            <div className="flex space-x-1 bg-gray-50 rounded-lg p-1">
              <button
                onClick={() => setRentType('monthly')}
                className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all active:scale-95 ${
                  rentType === 'monthly'
                    ? 'bg-[#0078D4] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                На месяц
              </button>
              <button
                onClick={() => setRentType('daily')}
                className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all active:scale-95 ${
                  rentType === 'daily'
                    ? 'bg-[#0078D4] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Посуточно
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Июнь, 2023</h2>
          <div className="grid grid-cols-7 gap-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
              <div key={day} className="text-center text-xs text-gray-600 font-medium">
                {day}
              </div>
            ))}
            {dates.map((date) => {
              const isAvailable = availableDates.includes(date)
              const isSelected = selectedDate === `2023-06-${date.toString().padStart(2, '0')}`
              return (
                <button
                  key={date}
                  onClick={() => {
                    if (isAvailable) {
                      setSelectedDate(`2023-06-${date.toString().padStart(2, '0')}`)
                    }
                  }}
                  disabled={!isAvailable}
                  className={`py-2 rounded text-sm transition-colors ${
                    isSelected
                      ? 'bg-[#0078D4] text-white'
                      : isAvailable
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {date}
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Жильцы</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 text-sm">Взрослые</span>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAdults(Math.max(1, adults - 1))}
                className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                -
              </button>
              <span className="text-xl font-bold text-gray-900 w-8 text-center">
                {adults}
              </span>
              <button
                onClick={() => setAdults(adults + 1)}
                className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleBooking}
          className="w-full py-3 bg-[#0078D4] text-white font-medium rounded-lg hover:bg-[#0066B2] transition-colors"
        >
          Продолжить
        </button>
      </div>
    </div>
  )
}

