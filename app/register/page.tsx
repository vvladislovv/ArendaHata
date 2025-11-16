'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { storage, STORAGE_KEYS } from '@/lib/storage'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('Саиф Уддин')
  const [email, setEmail] = useState('orbix.design@mail.com')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(true)

  const handleRegister = () => {
    if (password !== confirmPassword) {
      alert('Пароли не совпадают')
      return
    }
    if (!agreeToTerms) {
      alert('Необходимо согласиться с условиями')
      return
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
    }

    storage.set(STORAGE_KEYS.USER, newUser)
    storage.set(STORAGE_KEYS.IS_LOGGED_IN, true)
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-[#E8F5E9] p-6">
      <h1 className="text-2xl font-bold text-[#2E7D32] mb-8 mt-8">
        Создать аккаунт
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Имя
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-white"
            placeholder="Имя"
          />
        </div>

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
            Введите пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-white"
            placeholder="Пароль"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Подтвердите пароль
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] bg-white"
            placeholder="Подтвердите пароль"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="w-5 h-5 text-[#4CAF50] rounded focus:ring-[#4CAF50]"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            Я согласен с{' '}
            <span className="text-[#4CAF50]">Условиями использования</span> и{' '}
            <span className="text-[#4CAF50]">Политикой конфиденциальности</span>
          </label>
        </div>

        <button
          onClick={handleRegister}
          className="w-full py-4 bg-[#FFC107] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow mt-6"
        >
          Зарегистрироваться
        </button>

        <p className="text-center text-gray-600 mt-4">
          Уже есть аккаунт?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-[#4CAF50] font-medium"
          >
            Войти
          </button>
        </p>
      </div>
    </div>
  )
}

