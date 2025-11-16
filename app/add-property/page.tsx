'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { Property } from '@/data/mockData'
import BottomNav from '@/components/BottomNav'

export default function AddPropertyPage() {
  const router = useRouter()
  const [step, setStep] = useState(2)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [beds, setBeds] = useState('')
  const [baths, setBaths] = useState('')
  const [squareFeet, setSquareFeet] = useState('')
  const [address, setAddress] = useState('')
  const [price, setPrice] = useState('')
  const [priceDaily, setPriceDaily] = useState('')
  const [images, setImages] = useState<string[]>([])

  const emojiOptions = ['🏠', '🏡', '🏢', '🏘️', '🛋️', '🍳', '🛏️', '🚿', '🌳', '🌊']

  const handleAddImage = (emoji: string) => {
    if (images.length < 10) {
      setImages([...images, emoji])
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    let user: any = storage.get(STORAGE_KEYS.USER, null)
    if (!user) {
      // Создаем дефолтного пользователя если его нет
      import('@/data/mockData').then(({ initialUsers }) => {
        storage.set(STORAGE_KEYS.USER, initialUsers[0])
        user = initialUsers[0]
        submitProperty(user)
      })
      return
    }
    submitProperty(user)
  }

  const submitProperty = (user: any) => {

    const properties = storage.get<Property[]>(STORAGE_KEYS.PROPERTIES, [])
    const newProperty: Property = {
      id: Date.now().toString(),
      title,
      description,
      address,
      city: address.split(',')[0] || '',
      state: address.split(',')[1] || '',
      price: parseInt(price) || 0,
      priceDaily: priceDaily ? parseInt(priceDaily) : undefined,
      type: 'rent',
      beds: parseInt(beds) || 0,
      baths: parseInt(baths) || 0,
      squareFeet: parseInt(squareFeet) || 0,
      images: images.length > 0 ? images : ['🏠'],
      facilities: [],
      ownerId: user.id,
      available: true,
    }

    properties.push(newProperty)
    storage.set(STORAGE_KEYS.PROPERTIES, properties)

    alert('Объект успешно добавлен!')
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="text-[#0078D4] font-medium hover:underline"
          >
            ← Назад
          </button>
          <span className="text-sm text-gray-600">{step}/2</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Добавить детали объекта
        </h1>

        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название (например: 2-комн. кв. · 65 м² · 3/9 этаж)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4] bg-white"
                placeholder="2-комн. кв. · 65 м² · 3/9 этаж"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4] bg-white"
                placeholder="Описание объекта"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-medium">Спальни</label>
                <input
                  type="number"
                  value={beds}
                  onChange={(e) => setBeds(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
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
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
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
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Полный адрес
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4] bg-white"
                placeholder="Москва, ул. Тверская, д. 15"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена за месяц, ₽
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4] bg-white"
                  placeholder="25000"
                  min="25000"
                  max="150000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена посуточно, ₽ (необязательно)
                </label>
                <input
                  type="number"
                  value={priceDaily}
                  onChange={(e) => setPriceDaily(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4] bg-white"
                  placeholder="1500"
                  min="1500"
                  max="5000"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Изображения объекта (Макс. 10 фото)
          </h2>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative h-24 bg-gray-100 rounded-lg flex items-center justify-center text-4xl"
              >
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
                {img}
              </div>
            ))}
            {images.length < 10 && (
              <button
                onClick={() => {
                  const randomEmoji = emojiOptions[Math.floor(Math.random() * emojiOptions.length)]
                  handleAddImage(randomEmoji)
                }}
                className="h-24 bg-gray-100 rounded-lg flex items-center justify-center text-3xl hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300"
              >
                +
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleAddImage(emoji)}
                disabled={images.length >= 10}
                className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-[#0078D4] text-white font-medium rounded-lg hover:bg-[#0066B2] transition-colors"
        >
          Отправить
        </button>
      </div>

      <BottomNav />
    </div>
  )
}

