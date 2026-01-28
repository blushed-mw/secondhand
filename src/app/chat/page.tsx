import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ConversationList from '@/components/chat/ConversationList'
import { getProfile, getUser } from '@/actions/auth'
import { getMyConversations } from '@/actions/chat'
import { redirect } from 'next/navigation'

export const metadata = {
  title: '채팅 - 고구마마켓',
  description: '대화 목록',
}

export default async function ChatListPage() {
  const [profile, user] = await Promise.all([
    getProfile(),
    getUser(),
  ])

  if (!user) {
    redirect('/login')
  }

  const conversations = await getMyConversations()

  return (
    <>
      <Header profile={profile} />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">채팅</h1>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <ConversationList conversations={conversations} currentUserId={user.id} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
