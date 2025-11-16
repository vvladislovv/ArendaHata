'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { Property } from '@/data/mockData'
import BottomNav from '@/components/BottomNav'
import { formatPrice, formatPriceBuy } from '@/lib/formatPrice'

export default function MapPage() {
  const router = useRouter()
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [searchLocation, setSearchLocation] = useState('Москва, Россия')
  const [rentType, setRentType] = useState<'monthly' | 'daily'>('monthly')
  const [viewType, setViewType] = useState<'rent' | 'buy'>('rent')
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [mapCenter, setMapCenter] = useState({ lat: 55.7558, lng: 37.6173 }) // Москва по умолчанию
  const [touchStartDistance, setTouchStartDistance] = useState(0)
  const [touchStartZoom, setTouchStartZoom] = useState(1)

  useEffect(() => {
    // Проверяем версию данных и обновляем если нужно
    const DATA_VERSION = '5.0'
    const currentVersion = storage.get('dataVersion', '1.0')
    
    if (currentVersion !== DATA_VERSION) {
      import('@/data/mockData').then(({ initialProperties }) => {
        storage.set(STORAGE_KEYS.PROPERTIES, initialProperties)
        storage.set('dataVersion', DATA_VERSION)
        setAllProperties(initialProperties.filter((p) => p.available))
      })
    } else {
      const allProps = storage.get<Property[]>(STORAGE_KEYS.PROPERTIES, [])
      setAllProperties(allProps.filter((p) => p.available))
    }
  }, [])

  // Фильтруем объекты по типу (аренда/покупка)
  useEffect(() => {
    const filtered = allProperties.filter((p) => p.type === viewType)
    setProperties(filtered)
    
    // Вычисляем центр всех квартир для автоматического фокуса
    const propertiesWithCoords = filtered.filter((p) => p.latitude && p.longitude)
    if (propertiesWithCoords.length > 0) {
      const avgLat = propertiesWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) / propertiesWithCoords.length
      const avgLng = propertiesWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) / propertiesWithCoords.length
      setMapCenter({ lat: avgLat, lng: avgLng })
      
      // Вычисляем оптимальный zoom на основе разброса координат
      const lats = propertiesWithCoords.map(p => p.latitude!)
      const lngs = propertiesWithCoords.map(p => p.longitude!)
      const latRange = Math.max(...lats) - Math.min(...lats)
      const lngRange = Math.max(...lngs) - Math.min(...lngs)
      const maxRange = Math.max(latRange, lngRange)
      
      // Устанавливаем zoom так, чтобы все квартиры были видны
      // Чем больше разброс, тем меньше zoom
      let optimalZoom = 1
      if (maxRange > 10) optimalZoom = 0.3
      else if (maxRange > 5) optimalZoom = 0.5
      else if (maxRange > 2) optimalZoom = 0.7
      else if (maxRange > 1) optimalZoom = 1
      else if (maxRange > 0.5) optimalZoom = 1.5
      else optimalZoom = 2
      
      setZoom(optimalZoom)
      setMapPosition({ x: 0, y: 0 }) // Сбрасываем позицию при изменении фильтра
    }
  }, [allProperties, viewType])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    if (e.button !== 0) return // Только левая кнопка мыши
    setIsDragging(true)
    setDragStart({ x: e.clientX - mapPosition.x, y: e.clientY - mapPosition.y })
  }
  
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.3, Math.min(3, zoom + delta))
    setZoom(newZoom)
  }, [zoom])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    // Используем requestAnimationFrame для плавности
    requestAnimationFrame(() => {
      setMapPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    })
  }, [isDragging, dragStart])

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    
    if (e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      setTouchStartDistance(distance)
      setTouchStartZoom(zoom)
      setIsDragging(false)
    } else if (e.touches.length === 1) {
      // Обычное перетаскивание
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({ x: touch.clientX - mapPosition.x, y: touch.clientY - mapPosition.y })
    }
  }

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      e.preventDefault()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      if (touchStartDistance > 0) {
        const scale = distance / touchStartDistance
        const newZoom = Math.max(0.3, Math.min(3, touchStartZoom * scale))
        setZoom(newZoom)
      }
      setIsDragging(false)
    } else if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0]
      requestAnimationFrame(() => {
        setMapPosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        })
      })
    }
  }, [isDragging, dragStart, touchStartDistance, touchStartZoom])

  const handleTouchEnd = () => {
    setIsDragging(false)
    setTouchStartDistance(0)
  }

  // Преобразуем координаты в позиции на карте с учетом зума и центра
  const getPositionFromCoordinates = useCallback((lat: number, lng: number) => {
    // Используем центр карты как точку отсчета
    const latDiff = lat - mapCenter.lat
    const lngDiff = lng - mapCenter.lng
    
    // Масштабируем разницу координат (примерно 1 градус = 111 км)
    // При zoom = 1, 1 градус = примерно 50% экрана
    const scale = 50 * zoom
    
    // Вычисляем позицию относительно центра (50%, 50%)
    const topPercent = 50 - (latDiff * scale)
    const leftPercent = 50 + (lngDiff * scale)
    
    return {
      top: `${Math.max(0, Math.min(100, topPercent))}%`,
      left: `${Math.max(0, Math.min(100, leftPercent))}%`,
    }
  }, [mapCenter, zoom])

  // Мемоизируем маркеры с позициями
  const markersWithPositions = useMemo(() => {
    return properties
      .filter((p) => p.latitude && p.longitude)
      .map((property) => ({
        property,
        position: getPositionFromCoordinates(property.latitude!, property.longitude!),
      }))
  }, [properties, getPositionFromCoordinates])

  const handleMarkerClick = useCallback((property: Property, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Находим все объекты в этой же точке
    if (property.latitude && property.longitude) {
      const group = markersWithPositions
        .filter((m) => 
          Math.round(m.property.latitude! * 1000) / 1000 === Math.round(property.latitude! * 1000) / 1000 &&
          Math.round(m.property.longitude! * 1000) / 1000 === Math.round(property.longitude! * 1000) / 1000
        )
        .map((m) => m.property)
      
      if (group.length > 1) {
        setSelectedProperties(group)
        setSelectedProperty(group[0])
      } else {
        setSelectedProperties([property])
        setSelectedProperty(property)
      }
    } else {
      setSelectedProperties([property])
      setSelectedProperty(property)
    }
  }, [markersWithPositions])

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20 relative overflow-hidden">
      {/* Поисковая строка и переключатели */}
      <div className="absolute top-4 left-4 right-4 z-10 space-y-2">
        <div className="bg-white rounded-lg shadow-md px-4 py-2 flex items-center space-x-2 border border-gray-200">
          <span className="text-lg">🔍</span>
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="flex-1 text-sm font-medium text-gray-700 focus:outline-none"
            placeholder="Поиск локации..."
          />
        </div>
        
        {/* Переключатель Аренда/Купить */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-md border border-gray-200">
          <button
            onClick={() => setViewType('rent')}
            className={`flex-1 py-2 rounded-md font-medium text-xs transition-all active:scale-95 ${
              viewType === 'rent'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Аренда
          </button>
          <button
            onClick={() => setViewType('buy')}
            className={`flex-1 py-2 rounded-md font-medium text-xs transition-all active:scale-95 ${
              viewType === 'buy'
                ? 'bg-[#0078D4] text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Купить
          </button>
        </div>
        
        {/* Переключатель На месяц/Посуточно (только для аренды) */}
        {viewType === 'rent' && (
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-md border border-gray-200">
            <button
              onClick={() => setRentType('monthly')}
              className={`flex-1 py-2 rounded-md font-medium text-xs transition-all active:scale-95 ${
                rentType === 'monthly'
                  ? 'bg-[#0078D4] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              На месяц
            </button>
            <button
              onClick={() => setRentType('daily')}
              className={`flex-1 py-2 rounded-md font-medium text-xs transition-all active:scale-95 ${
                rentType === 'daily'
                  ? 'bg-[#0078D4] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Посуточно
            </button>
          </div>
        )}
      </div>

      {/* Интерактивная карта */}
      <div 
        className="h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 via-gray-50 to-blue-100 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Контейнер карты с позицией и зумом */}
        <div 
          className="absolute inset-0"
          style={{
            transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            willChange: isDragging ? 'transform' : 'auto',
          }}
        >
          {/* Упрощенная сетка карты - только линии, без отдельных элементов */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="6.25%" height="6.25%" patternUnits="userSpaceOnUse">
                  <path d="M 0 0 L 0 100 L 100 100 L 100 0 Z" fill="none" stroke="rgb(209, 213, 219)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Улицы на карте */}
          <div className="absolute top-1/4 left-0 right-0 h-1 bg-gray-300 opacity-20"></div>
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300 opacity-20"></div>
          <div className="absolute top-3/4 left-0 right-0 h-1 bg-gray-300 opacity-20"></div>
          <div className="absolute top-0 bottom-0 left-1/4 w-1 bg-gray-300 opacity-20"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-300 opacity-20"></div>
          <div className="absolute top-0 bottom-0 left-3/4 w-1 bg-gray-300 opacity-20"></div>
          <div className="absolute top-1/8 left-0 right-0 h-1 bg-gray-300 opacity-15"></div>
          <div className="absolute top-3/8 left-0 right-0 h-1 bg-gray-300 opacity-15"></div>
          <div className="absolute top-5/8 left-0 right-0 h-1 bg-gray-300 opacity-15"></div>
          <div className="absolute top-7/8 left-0 right-0 h-1 bg-gray-300 opacity-15"></div>
          <div className="absolute top-0 bottom-0 left-1/8 w-1 bg-gray-300 opacity-15"></div>
          <div className="absolute top-0 bottom-0 left-3/8 w-1 bg-gray-300 opacity-15"></div>
          <div className="absolute top-0 bottom-0 left-5/8 w-1 bg-gray-300 opacity-15"></div>
          <div className="absolute top-0 bottom-0 left-7/8 w-1 bg-gray-300 opacity-15"></div>

          {/* Маркеры объектов на карте с реальными координатами - оптимизированный рендеринг */}
          {markersWithPositions.map(({ property, position }) => {
            const isSelected = selectedProperties.some((p) => p.id === property.id)
            
            return (
              <button
                key={property.id}
                onClick={(e) => handleMarkerClick(property, e)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-110 z-20"
                style={position}
              >
                <div className="relative">
                  {/* Иконка дома */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-md border-2 transition-transform ${
                      isSelected
                        ? 'bg-[#0078D4] border-[#0078D4] scale-125'
                        : 'bg-white border-[#0078D4]'
                    }`}
                  >
                    {property.images[0] || '🏠'}
                  </div>
                  {/* Цена */}
                  <div
                    className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-lg text-xs font-bold shadow-md ${
                      isSelected
                        ? 'bg-[#0078D4] text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    {property.type === 'buy' 
                      ? formatPriceBuy(property.priceBuy || property.price)
                      : rentType === 'daily' 
                        ? formatPrice(property.priceDaily || property.price / 30)
                        : formatPrice(property.price)
                    }
                    {property.type === 'buy' 
                      ? '' 
                      : rentType === 'daily' ? '/сутки' : '/мес'
                    }
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Легенда карты */}
        <div className="absolute bottom-24 right-4 bg-white rounded-lg shadow-md p-3 z-10 border border-gray-200 pointer-events-none">
          <p className="text-xs font-bold text-gray-700 mb-2">Доступно:</p>
          <p className="text-sm text-[#0078D4] font-medium">
            {properties.length} {viewType === 'buy' ? 'на продажу' : 'в аренду'}
          </p>
        </div>
        
        {/* Кнопки управления зумом */}
        <div className="absolute bottom-24 left-4 z-10 flex flex-col gap-2">
          <button
            onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
            className="w-10 h-10 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
          >
            +
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.3, prev - 0.2))}
            className="w-10 h-10 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
          >
            −
          </button>
          <button
            onClick={() => {
              // Сброс к центру всех квартир
              const propertiesWithCoords = properties.filter((p) => p.latitude && p.longitude)
              if (propertiesWithCoords.length > 0) {
                const avgLat = propertiesWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) / propertiesWithCoords.length
                const avgLng = propertiesWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) / propertiesWithCoords.length
                setMapCenter({ lat: avgLat, lng: avgLng })
                setMapPosition({ x: 0, y: 0 })
                
                // Вычисляем оптимальный zoom
                const lats = propertiesWithCoords.map(p => p.latitude!)
                const lngs = propertiesWithCoords.map(p => p.longitude!)
                const latRange = Math.max(...lats) - Math.min(...lats)
                const lngRange = Math.max(...lngs) - Math.min(...lngs)
                const maxRange = Math.max(latRange, lngRange)
                
                let optimalZoom = 1
                if (maxRange > 10) optimalZoom = 0.3
                else if (maxRange > 5) optimalZoom = 0.5
                else if (maxRange > 2) optimalZoom = 0.7
                else if (maxRange > 1) optimalZoom = 1
                else if (maxRange > 0.5) optimalZoom = 1.5
                else optimalZoom = 2
                
                setZoom(optimalZoom)
              }
            }}
            className="w-10 h-10 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center text-lg hover:bg-gray-50 active:scale-95 transition-all"
            title="Центрировать на всех квартирах"
          >
            🎯
          </button>
        </div>
      </div>

      {/* Карточка выбранного объекта или список объектов */}
      {selectedProperties.length > 0 ? (
        <div className="absolute bottom-20 left-0 right-0 p-4 z-30 animate-slide-up">
          {selectedProperties.length === 1 ? (
            // Один объект - показываем детальную карточку
            <div
              onClick={() => router.push(`/property/${selectedProperty?.id}`)}
              className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                  {selectedProperty?.images[0] || '🏠'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-gray-900 text-sm flex-1">
                      {selectedProperty?.title}
                    </h3>
                  </div>
                  <div className="text-right mb-2">
                    <div className="text-lg font-bold text-gray-900">
                      {selectedProperty?.type === 'buy' 
                        ? formatPriceBuy(selectedProperty.priceBuy || selectedProperty.price)
                        : rentType === 'daily' 
                          ? formatPrice(selectedProperty.priceDaily || selectedProperty.price! / 30)
                          : formatPrice(selectedProperty?.price || 0)
                      }
                      <span className="text-sm font-normal text-gray-600">
                        {selectedProperty?.type === 'buy' 
                          ? '' 
                          : rentType === 'daily' ? '/сутки' : '/мес'
                        }
                      </span>
                    </div>
                    {selectedProperty?.type === 'rent' && rentType === 'monthly' && selectedProperty.priceDaily && (
                      <div className="text-xs text-gray-500 mt-1">
                        {formatPrice(selectedProperty.priceDaily)}/сутки
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2 truncate">
                    {selectedProperty?.address}, {selectedProperty?.city}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span>🛏️ {selectedProperty?.beds}</span>
                    <span>🚿 {selectedProperty?.baths}</span>
                    <span>📐 {selectedProperty?.squareFeet} м²</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/property/${selectedProperty?.id}`)
                }}
                className="w-full mt-3 py-2 bg-[#0078D4] text-white rounded-lg font-medium hover:bg-[#0066B2] active:scale-95 transition-all shadow-md text-sm"
              >
                Посмотреть детали
              </button>
            </div>
          ) : (
            // Несколько объектов - показываем список
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">
                  {selectedProperties.length} объектов в этой точке
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {selectedProperties.map((prop) => (
                  <div
                    key={prop.id}
                    onClick={() => {
                      setSelectedProperty(prop)
                      setSelectedProperties([prop])
                    }}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                        {prop.images[0] || '🏠'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm mb-1">
                          {prop.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-1 truncate">
                          {prop.address}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <span>🛏️ {prop.beds}</span>
                            <span>🚿 {prop.baths}</span>
                            <span>📐 {prop.squareFeet} м²</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            {prop.type === 'buy' 
                              ? formatPriceBuy(prop.priceBuy || prop.price)
                              : rentType === 'daily' 
                                ? formatPrice(prop.priceDaily || prop.price / 30)
                                : formatPrice(prop.price)
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      <BottomNav />
    </div>
  )
}
