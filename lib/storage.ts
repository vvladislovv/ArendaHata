// Утилиты для работы с localStorage

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },
};

// Ключи для хранения данных
export const STORAGE_KEYS = {
  USER: 'user',
  USERS: 'users', // Все пользователи для чатов
  PROPERTIES: 'properties',
  BOOKINGS: 'bookings',
  CHATS: 'chats',
  IS_LOGGED_IN: 'isLoggedIn',
};

