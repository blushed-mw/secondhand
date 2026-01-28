export type ProductStatus = 'selling' | 'reserved' | 'sold'

export interface Profile {
  id: string
  created_at: string
  updated_at: string | null
  email: string | null
  nickname: string
  avatar_url: string | null
}

export interface Category {
  id: number
  name: string
  slug: string
  icon: string | null
  created_at: string
}

export interface Product {
  id: number
  created_at: string
  updated_at: string | null
  seller_id: string
  title: string
  description: string
  price: number
  category_id: number
  status: ProductStatus
  images: string[]
  view_count: number
}

export interface ProductWithSeller extends Product {
  seller: Profile
  category: Category
}

export interface Conversation {
  id: number
  created_at: string
  updated_at: string | null
  product_id: number | null
  buyer_id: string
  seller_id: string
  last_message_at: string | null
}

export interface ConversationWithDetails extends Conversation {
  product: Product | null
  buyer: Profile
  seller: Profile
  last_message?: Message | null
  unread_count?: number
}

export interface Message {
  id: number
  created_at: string
  conversation_id: number
  sender_id: string
  content: string
  is_read: boolean
}
