'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import { sendMessage, markMessagesAsRead } from '@/actions/chat'
import type { ConversationWithDetails, Message, Profile } from '@/types'

interface ChatRoomProps {
  conversation: ConversationWithDetails
  initialMessages: Message[]
  currentUserId: string
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ChatRoom({ conversation, initialMessages, currentUserId }: ChatRoomProps) {
  const messages = useRealtimeMessages(conversation.id, initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const otherUser: Profile = conversation.buyer_id === currentUserId
    ? conversation.seller
    : conversation.buyer

  // 메시지 읽음 처리
  useEffect(() => {
    markMessagesAsRead(conversation.id)
  }, [conversation.id, messages])

  // 새 메시지 시 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const messageToSend = newMessage
    setNewMessage('')

    try {
      const result = await sendMessage(conversation.id, messageToSend)
      if (result.error) {
        alert(result.error)
        setNewMessage(messageToSend)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('메시지 전송에 실패했습니다.')
      setNewMessage(messageToSend)
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  // 날짜별로 메시지 그룹화
  const groupedMessages: { date: string; messages: Message[] }[] = []
  let currentDate = ''
  messages.forEach((message) => {
    const messageDate = new Date(message.created_at).toDateString()
    if (messageDate !== currentDate) {
      currentDate = messageDate
      groupedMessages.push({ date: message.created_at, messages: [message] })
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(message)
    }
  })

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px]">
      {/* 상품 정보 */}
      {conversation.product && (
        <Link
          href={`/products/${conversation.product.id}`}
          className="flex items-center gap-3 p-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
        >
          {conversation.product.images?.[0] && (
            <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={conversation.product.images[0]}
                alt={conversation.product.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{conversation.product.title}</p>
            <p className="text-orange-500 text-sm font-medium">
              {conversation.product.price.toLocaleString('ko-KR')}원
            </p>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* 날짜 구분선 */}
            <div className="flex items-center justify-center my-4">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                {formatDate(group.date)}
              </span>
            </div>

            {/* 메시지들 */}
            <div className="space-y-2">
              {group.messages.map((message) => {
                const isOwn = message.sender_id === currentUserId
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                      {!isOwn && (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {otherUser.avatar_url ? (
                            <Image
                              src={otherUser.avatar_url}
                              alt={otherUser.nickname}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-gray-500 text-sm">
                              {otherUser.nickname?.[0]}
                            </span>
                          )}
                        </div>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl break-words ${
                          isOwn
                            ? 'bg-orange-500 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        {message.content}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 메시지 입력 */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
