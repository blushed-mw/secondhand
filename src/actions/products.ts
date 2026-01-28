'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { ProductStatus } from '@/types'

interface ProductResult {
  error?: string
  productId?: number
}

export async function createProduct(formData: FormData): Promise<ProductResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseInt(formData.get('price') as string)
  const categoryId = parseInt(formData.get('categoryId') as string)
  const imagesJson = formData.get('images') as string
  const images = imagesJson ? JSON.parse(imagesJson) : []

  if (!title || !description || isNaN(price) || isNaN(categoryId)) {
    return { error: '모든 필드를 입력해주세요.' }
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: user.id,
      title,
      description,
      price,
      category_id: categoryId,
      images,
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/products')
  redirect(`/products/${data.id}`)
}

export async function updateProduct(productId: number, formData: FormData): Promise<ProductResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseInt(formData.get('price') as string)
  const categoryId = parseInt(formData.get('categoryId') as string)
  const status = formData.get('status') as ProductStatus
  const imagesJson = formData.get('images') as string
  const images = imagesJson ? JSON.parse(imagesJson) : []

  if (!title || !description || isNaN(price) || isNaN(categoryId)) {
    return { error: '모든 필드를 입력해주세요.' }
  }

  const { error } = await supabase
    .from('products')
    .update({
      title,
      description,
      price,
      category_id: categoryId,
      status,
      images,
    })
    .eq('id', productId)
    .eq('seller_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/products')
  revalidatePath(`/products/${productId}`)
  redirect(`/products/${productId}`)
}

export async function deleteProduct(productId: number): Promise<ProductResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('seller_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/products')
  redirect('/')
}

export async function getProducts(options?: {
  limit?: number
  offset?: number
  categoryId?: number
  search?: string
  sort?: 'latest' | 'price_asc' | 'price_desc'
}) {
  const supabase = await createClient()
  const { limit = 20, offset = 0, categoryId, search, sort = 'latest' } = options || {}

  let query = supabase
    .from('products')
    .select(`
      *,
      seller:profiles(*),
      category:categories(*)
    `, { count: 'exact' })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching products:', error)
    return { products: [], count: 0 }
  }

  return { products: data || [], count: count || 0 }
}

export async function getProduct(id: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      seller:profiles(*),
      category:categories(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  // Increment view count
  await supabase
    .from('products')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', id)

  return data
}

export async function getCategories() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('id')

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadProductImage(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '로그인이 필요합니다.' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { error: '파일이 없습니다.' }
  }

  // 서버 사이드 파일 유효성 검사
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { error: '지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 가능)' }
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { error: '파일 크기가 너무 큽니다. (최대 5MB)' }
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase()
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
  if (!fileExt || !allowedExtensions.includes(fileExt)) {
    return { error: '지원하지 않는 파일 확장자입니다.' }
  }

  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file)

  if (error) {
    return { error: error.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return { url: publicUrl }
}

export async function getMyProducts() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      seller:profiles(*),
      category:categories(*)
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching my products:', error)
    return []
  }

  return data || []
}
