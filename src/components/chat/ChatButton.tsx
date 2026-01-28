'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { startConversation } from '@/actions/chat'
import Button from '@/components/ui/Button'

interface ChatButtonProps {
  sellerId: string
  productId: number
  isLoggedIn: boolean
}

export default function ChatButton({ sellerId, productId, isLoggedIn }: ChatButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    setIsLoading(true)
    try {
      const result = await startConversation(sellerId, productId)
      if (result.error) {
        alert(result.error)
        return
      }
      if (result.conversationId) {
        router.push(`/chat/${result.conversationId}`)
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
      alert('채팅을 시작할 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={isLoading} className="w-full mt-3">
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          처리중...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          채팅하기
        </span>
      )}
    </Button>
  )
}
