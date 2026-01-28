'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ConversationWithDetails, Message } from '@/types'

export async function startConversation(sellerId: string, productId: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  if (user.id === sellerId) {
    return { error: '본인 상품에는 채팅을 시작할 수 없습니다.' }
  }

  // 기존 대화가 있는지 확인
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('product_id', productId)
    .eq('buyer_id', user.id)
    .eq('seller_id', sellerId)
    .single()

  if (existing) {
    return { conversationId: existing.id }
  }

  // 새 대화 생성
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      product_id: productId,
      buyer_id: user.id,
      seller_id: sellerId,
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/chat')
  return { conversationId: data.id }
}

export async function getMyConversations(): Promise<ConversationWithDetails[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(`
      *,
      product:products(*),
      buyer:profiles!conversations_buyer_id_fkey(*),
      seller:profiles!conversations_seller_id_fkey(*)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('Error fetching conversations:', error)
    return []
  }

  // 각 대화의 마지막 메시지와 읽지 않은 메시지 수 가져오기
  const conversationsWithDetails = await Promise.all(
    (conversations || []).map(async (conv) => {
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('is_read', false)
        .neq('sender_id', user.id)

      return {
        ...conv,
        last_message: lastMessage || null,
        unread_count: unreadCount || 0,
      }
    })
  )

  return conversationsWithDetails
}

export async function getConversation(conversationId: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      product:products(*),
      buyer:profiles!conversations_buyer_id_fkey(*),
      seller:profiles!conversations_seller_id_fkey(*)
    `)
    .eq('id', conversationId)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .single()

  if (error) {
    console.error('Error fetching conversation:', error)
    return null
  }

  return data
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  // 대화 참여자인지 확인
  const { data: conv } = await supabase
    .from('conversations')
    .select('buyer_id, seller_id')
    .eq('id', conversationId)
    .single()

  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
    return []
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data || []
}

export async function sendMessage(conversationId: number, content: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  if (!content.trim()) {
    return { error: '메시지를 입력해주세요.' }
  }

  // 대화 참여자인지 확인
  const { data: conv } = await supabase
    .from('conversations')
    .select('buyer_id, seller_id')
    .eq('id', conversationId)
    .single()

  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
    return { error: '권한이 없습니다.' }
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // 대화 last_message_at 업데이트
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  revalidatePath(`/chat/${conversationId}`)
  revalidatePath('/chat')

  return { message: data }
}

export async function markMessagesAsRead(conversationId: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  // 대화 참여자인지 확인
  const { data: conv } = await supabase
    .from('conversations')
    .select('buyer_id, seller_id')
    .eq('id', conversationId)
    .single()

  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
    return { error: '권한이 없습니다.' }
  }

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/chat')
  return { success: true }
}
