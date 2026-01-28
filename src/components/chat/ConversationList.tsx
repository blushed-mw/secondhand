'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { ConversationWithDetails, Profile } from '@/types'

interface ConversationListProps {
  conversations: ConversationWithDetails[]
  currentUserId: string
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '어제'
  } else if (days < 7) {
    return `${days}일 전`
  } else {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }
}

export default function ConversationList({ conversations, currentUserId }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p>채팅 내역이 없습니다.</p>
        <p className="text-sm mt-1">상품 페이지에서 채팅을 시작해보세요!</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conv) => {
        const otherUser: Profile = conv.buyer_id === currentUserId ? conv.seller : conv.buyer
        const hasUnread = conv.unread_count && conv.unread_count > 0

        return (
          <Link
            key={conv.id}
            href={`/chat/${conv.id}`}
            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
          >
            {/* 상대방 아바타 */}
            <div className="relative w-12 h-12 flex-shrink-0">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {otherUser.avatar_url ? (
                  <Image
                    src={otherUser.avatar_url}
                    alt={otherUser.nickname}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-lg font-medium">
                    {otherUser.nickname?.[0]}
                  </span>
                )}
              </div>
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {conv.unread_count! > 9 ? '9+' : conv.unread_count}
                </span>
              )}
            </div>

            {/* 대화 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`font-medium truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                  {otherUser.nickname}
                </span>
                {conv.last_message && (
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {formatTime(conv.last_message.created_at)}
                  </span>
                )}
              </div>
              <p className={`text-sm truncate ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                {conv.last_message?.content || '대화를 시작해보세요'}
              </p>
              {conv.product && (
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {conv.product.title}
                </p>
              )}
            </div>

            {/* 상품 이미지 */}
            {conv.product?.images?.[0] && (
              <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={conv.product.images[0]}
                  alt={conv.product.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </Link>
        )
      })}
    </div>
  )
}
