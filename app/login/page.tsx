'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { storage, STORAGE_KEYS } from '@/lib/storage'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('orbix.design@mail.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = () => {
    const user = storage.get(STORAGE_KEYS.USER, null)
    if (user && email === user.email) {
      storage.set(STORAGE_KEYS.IS_LOGGED_IN, true)
      router.push('/home')
    } else {
      alert('Неверный email или пароль')
    }
  }

  return (
    <div className="min-h-screen bg-[#E8F5E9] p-6 flex flex-col">
      <div className="text-center mb-8 mt-12">
        <div className="text-5xl mb-4">🏠</div>
        <h1 className="text-2xl font-bold text-[#2E7D32] mb-2">Orelax</h1>
        <h2 className="text-xl text-gray-700">
          Добро пожаловать обратно, войдите и начните исследовать
        </h2>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email адрес
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-white"
            placeholder="Email адрес"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Пароль
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-white pr-12"
              placeholder="Пароль"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push('/forgot-password')}
          className="text-sm text-[#4CAF50] text-right"
        >
          Забыли пароль?
        </button>

        <button
          onClick={handleLogin}
          className="w-full py-4 bg-[#FFC107] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          Войти
        </button>

        <div className="space-y-3">
          <button className="w-full py-3 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 flex items-center justify-center space-x-2">
            <span>🔍</span>
            <span>Войти через Google</span>
          </button>
          <button className="w-full py-3 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 flex items-center justify-center space-x-2">
            <span>🍎</span>
            <span>Войти через Apple</span>
          </button>
        </div>

        <p className="text-center text-gray-600">
          Нет аккаунта?{' '}
          <button
            onClick={() => router.push('/register')}
            className="text-[#4CAF50] font-medium"
          >
            Зарегистрироваться
          </button>
        </p>
      </div>
    </div>
  )
}

