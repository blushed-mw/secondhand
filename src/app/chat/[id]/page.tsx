import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ChatRoom from '@/components/chat/ChatRoom'
import { getProfile, getUser } from '@/actions/auth'
import { getConversation, getMessages } from '@/actions/chat'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Profile } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const conversation = await getConversation(parseInt(id))

  if (!conversation) {
    return { title: '채팅 - 고구마마켓' }
  }

  const user = await getUser()
  const otherUser: Profile = conversation.buyer_id === user?.id
    ? conversation.seller
    : conversation.buyer

  return {
    title: `${otherUser.nickname}님과의 대화 - 고구마마켓`,
  }
}

export default async function ChatRoomPage({ params }: Props) {
  const { id } = await params
  const conversationId = parseInt(id)

  const [profile, user] = await Promise.all([
    getProfile(),
    getUser(),
  ])

  if (!user) {
    redirect('/login')
  }

  const [conversation, messages] = await Promise.all([
    getConversation(conversationId),
    getMessages(conversationId),
  ])

  if (!conversation) {
    notFound()
  }

  const otherUser: Profile = conversation.buyer_id === user.id
    ? conversation.seller
    : conversation.buyer

  return (
    <>
      <Header profile={profile} />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/chat"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {otherUser.avatar_url ? (
                  <img
                    src={otherUser.avatar_url}
                    alt={otherUser.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-lg">
                    {otherUser.nickname?.[0]}
                  </span>
                )}
              </div>
              <h1 className="font-bold text-lg">{otherUser.nickname}</h1>
            </div>
          </div>

          {/* 채팅방 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <ChatRoom
              conversation={conversation}
              initialMessages={messages}
              currentUserId={user.id}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
