'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  const handleSubmit = () => {
    alert('Инструкции по восстановлению пароля отправлены на ваш email')
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-[#E8F5E9] p-6 flex flex-col justify-center">
      <h1 className="text-2xl font-bold text-[#2E7D32] mb-4">
        Восстановление пароля
      </h1>
      <p className="text-gray-600 mb-6">
        Введите ваш email адрес, и мы отправим вам инструкции по восстановлению пароля.
      </p>

      <div className="mb-6">
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

      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-[#FFC107] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-shadow mb-4"
      >
        Отправить
      </button>

      <button
        onClick={() => router.push('/home')}
        className="text-center text-[#4CAF50] font-medium"
      >
        Вернуться на главную
      </button>
    </div>
  )
}

