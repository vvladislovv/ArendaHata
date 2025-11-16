'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [ripples, setRipples] = useState<Map<string, { x: number; y: number }>>(new Map())

  const navItems = [
    { icon: '🏠', label: 'Главная', path: '/home' },
    { icon: '🔍', label: 'Поиск', path: '/discover' },
    { icon: '➕', label: 'Добавить', path: '/add-property' },
    { icon: '💬', label: 'Чат', path: '/chat' },
    { icon: '👤', label: 'Профиль', path: '/profile' },
  ]

  const handleClick = (path: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Добавляем ripple эффект
    setRipples(prev => {
      const newRipples = new Map(prev)
      newRipples.set(path, { x, y })
      return newRipples
    })
    
    // Удаляем ripple через 600ms
    setTimeout(() => {
      setRipples(prev => {
        const updatedRipples = new Map(prev)
        updatedRipples.delete(path)
        return updatedRipples
      })
    }, 600)
    
    // Переход на страницу
    setTimeout(() => {
      router.push(path)
    }, 150)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-center pb-4 px-4 pointer-events-none">
      {/* Плавающая навигация с эффектом стекла iOS 26 */}
      <div className="relative w-full max-w-md animate-nav-slide-up pointer-events-auto">
        {/* Фон с эффектом стекла */}
        <div 
          className="absolute inset-0 rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
          }}
        />
        
        {/* Навигационные элементы */}
        <div className="relative flex justify-around items-center py-3 px-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.path
            return (
              <button
                key={item.path}
                onClick={(e) => handleClick(item.path, e)}
                className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 ease-out ${
                  isActive 
                    ? 'text-[#007AFF]' 
                    : 'text-gray-600 hover:text-gray-900 active:scale-95'
                }`}
                style={{ 
                  minWidth: '60px',
                  animationDelay: `${index * 0.05}s`
                }}
              >
                {/* Ripple эффект */}
                {ripples.has(item.path) && (
                  <span
                    className="absolute w-4 h-4 bg-[#007AFF]/20 rounded-full animate-ripple pointer-events-none z-20"
                    style={{
                      left: `${ripples.get(item.path)?.x || 0}px`,
                      top: `${ripples.get(item.path)?.y || 0}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                )}

                {/* Фон для активного элемента с эффектом стекла */}
                {isActive && (
                  <div 
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'rgba(0, 122, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(0, 122, 255, 0.25)',
                    }}
                  />
                )}

                {/* Иконка */}
                <span 
                  className={`relative z-10 text-2xl transition-all duration-200 ${
                    isActive 
                      ? 'scale-105' 
                      : 'scale-100 hover:scale-105 active:scale-95'
                  }`}
                >
                  {item.icon}
                </span>

                {/* Подпись */}
                <span 
                  className={`relative z-10 text-xs font-medium mt-0.5 transition-all duration-200 ${
                    isActive 
                      ? 'font-semibold' 
                      : ''
                  }`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

