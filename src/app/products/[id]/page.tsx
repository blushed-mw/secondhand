import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getProduct } from '@/actions/products'
import { getProfile, getUser } from '@/actions/auth'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import DeleteButton from './DeleteButton'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const product = await getProduct(parseInt(id))

  if (!product) {
    return { title: '상품을 찾을 수 없습니다' }
  }

  return {
    title: `${product.title} - 고구마마켓`,
    description: product.description.slice(0, 160),
  }
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const statusLabels: Record<string, string> = {
  selling: '판매중',
  reserved: '예약중',
  sold: '판매완료',
}

const statusColors: Record<string, string> = {
  selling: 'bg-green-100 text-green-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-gray-100 text-gray-800',
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const [profile, user, product] = await Promise.all([
    getProfile(),
    getUser(),
    getProduct(parseInt(id)),
  ])

  if (!product) {
    notFound()
  }

  const isOwner = user?.id === product.seller_id

  return (
    <>
      <Header profile={profile} />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* 이미지 갤러리 */}
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-6">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-contain"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* 추가 이미지 썸네일 */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {product.images.map((image: string, index: number) => (
                <div
                  key={index}
                  className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200"
                >
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 판매자 정보 */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                {product.seller?.avatar_url ? (
                  <Image
                    src={product.seller.avatar_url}
                    alt={product.seller.nickname}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-gray-500 text-lg">
                    {product.seller?.nickname?.[0]}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium">{product.seller?.nickname}</p>
              </div>
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="py-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[product.status]}`}>
                {statusLabels[product.status]}
              </span>
              <span className="text-sm text-gray-500">
                {product.category?.icon} {product.category?.name}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
            <p className="text-3xl font-bold text-orange-500 mb-4">
              {formatPrice(product.price)}
            </p>
            <div className="text-sm text-gray-500 mb-6">
              {formatDate(product.created_at)} · 조회 {product.view_count}
            </div>
            <div className="whitespace-pre-wrap text-gray-700">
              {product.description}
            </div>
          </div>

          {/* 소유자 액션 */}
          {isOwner && (
            <div className="flex gap-3 py-4 border-t border-gray-200">
              <Link
                href={`/products/${product.id}/edit`}
                className="flex-1 py-3 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                수정하기
              </Link>
              <DeleteButton productId={product.id} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
