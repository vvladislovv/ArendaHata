// Функция для форматирования цены в рубли

export function formatPrice(price: number): string {
  // Форматируем число с пробелами для тысяч
  const formatted = price.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return `${formatted} ₽`
}

// Функция для форматирования цены покупки в миллионах
export function formatPriceBuy(priceInMillions: number): string {
  // Форматируем число с одним знаком после запятой
  const formatted = priceInMillions.toLocaleString('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  return `${formatted} млн ₽`
}

export function formatPriceWithDiscount(price: number, discount: number = 0): string {
  const finalPrice = price - (price * discount / 100)
  return formatPrice(finalPrice)
}

