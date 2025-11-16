'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { User, Booking, Property } from '@/data/mockData'
import BottomNav from '@/components/BottomNav'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const currentUser = storage.get<User | null>(STORAGE_KEYS.USER, null)
    if (!currentUser) {
      // Если пользователя нет, создаем дефолтного
      import('@/data/mockData').then(({ initialUsers }) => {
        storage.set(STORAGE_KEYS.USER, initialUsers[0])
        setUser(initialUsers[0])
        setEditName(initialUsers[0].name)
        setEditEmail(initialUsers[0].email)
        const allBookings = storage.get<Booking[]>(STORAGE_KEYS.BOOKINGS, [])
        setBookings(allBookings.filter((b) => b.userId === initialUsers[0].id))
      })
      return
    }
    setUser(currentUser)
    setEditName(currentUser.name)
    setEditEmail(currentUser.email)

    const allBookings = storage.get<Booking[]>(STORAGE_KEYS.BOOKINGS, [])
    const userBookings = allBookings.filter((b) => b.userId === currentUser.id)
    setBookings(userBookings)
  }, [])

  const handleSaveEdit = () => {
    if (!editName.trim() || !editEmail.trim()) {
      alert('Пожалуйста, заполните все поля')
      return
    }

    if (!user) return

    const updatedUser: User = {
      ...user,
      name: editName.trim(),
      email: editEmail.trim(),
    }

    storage.set(STORAGE_KEYS.USER, updatedUser)
    
    // Обновляем также в списке всех пользователей
    const allUsers = storage.get<User[]>(STORAGE_KEYS.USERS, [])
    const updatedUsers = allUsers.map((u) => (u.id === user.id ? updatedUser : u))
    storage.set(STORAGE_KEYS.USERS, updatedUsers)

    setUser(updatedUser)
    setIsEditing(false)
    alert('Профиль успешно обновлен!')
  }

  const handleCancelEdit = () => {
    if (user) {
      setEditName(user.name)
      setEditEmail(user.email)
    }
    setIsEditing(false)
  }

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      storage.remove(STORAGE_KEYS.USER)
      router.push('/home')
    }
  }

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Вы уверены, что хотите отменить бронирование?')) {
      const allBookings = storage.get<Booking[]>(STORAGE_KEYS.BOOKINGS, [])
      const updated = allBookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
      )
      storage.set(STORAGE_KEYS.BOOKINGS, updated)
      setBookings(updated.filter((b) => b.userId === user?.id))
      alert('Бронирование отменено')
    }
  }

  if (!user) {
    return <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">Загрузка...</div>
  }

  const properties = storage.get<Property[]>(STORAGE_KEYS.PROPERTIES, [])

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Профиль</h1>

        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
          {!isEditing ? (
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="text-[#0078D4] font-medium hover:underline active:scale-95 transition-all"
              >
                Редактировать
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                  placeholder="Введите имя"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                  placeholder="Введите email"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-2 bg-[#0078D4] text-white rounded-lg font-medium hover:bg-[#0066B2] active:scale-95 transition-all"
                >
                  Сохранить
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 active:scale-95 transition-all"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Мои бронирования</h2>
          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const property = properties.find((p) => p.id === booking.propertyId)
                return (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-sm">
                        {property?.title || 'Объект'}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {booking.status === 'confirmed'
                          ? 'Подтверждено'
                          : booking.status === 'pending'
                          ? 'Ожидание'
                          : 'Отменено'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Дата: {new Date(booking.date).toLocaleDateString('ru-RU')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Взрослых: {booking.adults}
                    </p>
                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Отменить бронирование
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">Нет бронирований</p>
          )}
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => setShowHelp(true)}
            className="w-full py-3 bg-white rounded-lg text-left px-4 font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 active:scale-98 transition-all"
          >
            ❓ Помощь
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 active:scale-98 transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Модальное окно помощи */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Помощь и поддержка</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Контакты</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Email:</strong> support@arenda.ru
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Телефон:</strong> +7 (495) 123-45-67
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Время работы:</strong> Пн-Пт: 9:00 - 20:00
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Часто задаваемые вопросы</h3>
                <div className="space-y-2">
                  <details className="border border-gray-200 rounded-lg p-3">
                    <summary className="font-medium text-gray-900 cursor-pointer">
                      Как забронировать объект?
                    </summary>
                    <p className="text-sm text-gray-600 mt-2">
                      Выберите объект, нажмите "Забронировать сейчас", выберите дату и количество гостей, затем подтвердите бронирование.
                    </p>
                  </details>
                  <details className="border border-gray-200 rounded-lg p-3">
                    <summary className="font-medium text-gray-900 cursor-pointer">
                      Можно ли отменить бронирование?
                    </summary>
                    <p className="text-sm text-gray-600 mt-2">
                      Да, вы можете отменить бронирование в разделе "Мои бронирования" в профиле.
                    </p>
                  </details>
                  <details className="border border-gray-200 rounded-lg p-3">
                    <summary className="font-medium text-gray-900 cursor-pointer">
                      Как связаться с владельцем?
                    </summary>
                    <p className="text-sm text-gray-600 mt-2">
                      Используйте функцию чата в приложении для связи с владельцем объекта.
                    </p>
                  </details>
                </div>
              </div>

              <button
                onClick={() => {
                  window.location.href = 'mailto:support@arenda.ru'
                }}
                className="w-full py-3 bg-[#0078D4] text-white rounded-lg font-medium hover:bg-[#0066B2] active:scale-95 transition-all"
              >
                Написать в поддержку
              </button>

              <button
                onClick={() => {
                  window.location.href = 'tel:+74951234567'
                }}
                className="w-full py-3 bg-white border-2 border-[#0078D4] text-[#0078D4] rounded-lg font-medium hover:bg-blue-50 active:scale-95 transition-all"
              >
                Позвонить в поддержку
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
