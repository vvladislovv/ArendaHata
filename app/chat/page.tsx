'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { Chat, Message, User } from '@/data/mockData'
import BottomNav from '@/components/BottomNav'

export default function ChatPage() {
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [message, setMessage] = useState('')
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const allChats = storage.get<Chat[]>(STORAGE_KEYS.CHATS, [])
    const allUsers = storage.get<User[]>(STORAGE_KEYS.USERS, [])
    setChats(allChats)
    setUsers(allUsers)
  }, [])

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return

    const user = storage.get<User | null>(STORAGE_KEYS.USER, null)
    if (!user) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      senderId: user.id,
      timestamp: new Date().toISOString(),
    }

    const updatedChats = chats.map((chat) =>
      chat.id === selectedChat.id
        ? {
            ...chat,
            messages: [...chat.messages, newMessage],
          }
        : chat
    )

    storage.set(STORAGE_KEYS.CHATS, updatedChats)
    setChats(updatedChats)
    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
    })
    setMessage('')
  }

  const getChatUser = (chat: Chat) => {
    return users.find((u) => u.id === chat.userId) || users[1] || { id: '2', name: 'Бесси Купер', email: '' }
  }

  if (selectedChat) {
    const chatUser = getChatUser(selectedChat)
    const currentUser = storage.get<User | null>(STORAGE_KEYS.USER, null)

    return (
      <div className="h-screen bg-[#F5F5F5] flex flex-col overflow-hidden">
        <div className="bg-white p-4 flex items-center space-x-3 border-b border-gray-200 flex-shrink-0">
          <button onClick={() => setSelectedChat(null)} className="text-[#0078D4] hover:text-[#0066B2]">
            ←
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900">{chatUser.name}</h2>
            <p className="text-xs text-[#0078D4]">В сети</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedChat.messages.map((msg) => {
            const isOwn = msg.senderId === currentUser?.id
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-[#0078D4] text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-white p-4 border-t border-gray-200 flex items-center space-x-2 flex-shrink-0">
          <button className="text-xl text-gray-600 hover:text-gray-900">➕</button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
            placeholder="Написать ответ..."
          />
          <button
            onClick={handleSendMessage}
            className="w-10 h-10 bg-[#0078D4] rounded-full flex items-center justify-center text-white font-bold hover:bg-[#0066B2] transition-colors"
          >
            →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Чаты</h1>

        <div className="space-y-0">
          {chats.map((chat) => {
            const chatUser = getChatUser(chat)
            const lastMessage = chat.messages[chat.messages.length - 1]
            return (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className="w-full bg-white border-b border-gray-200 p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-[#0078D4] rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                  {chatUser.name.charAt(0)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900">{chatUser.name}</h3>
                    <span className="text-xs text-[#0078D4]">● В сети</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {lastMessage?.text || 'Нет сообщений'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {chats.length === 0 && (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-600">Нет чатов</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

