'use client'

import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F5E9] to-white p-6 flex flex-col justify-between">
      <div className="mt-12">
        <h1 className="text-3xl font-bold text-[#2E7D32] mb-4">
          All-In-One Real Estate Platform
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          Откройте для себя наши исключительные объекты, созданные как шедевры с долговременной ценностью для клиента.
        </p>
      </div>
      
      <div className="flex justify-center mb-8">
        <div className="text-8xl">🏢</div>
      </div>

      <button
        onClick={() => router.push('/home')}
        className="w-16 h-16 rounded-full bg-[#FFC107] flex items-center justify-center text-white text-2xl font-bold ml-auto shadow-lg hover:shadow-xl transition-shadow"
      >
        →
      </button>
    </div>
  )
}

