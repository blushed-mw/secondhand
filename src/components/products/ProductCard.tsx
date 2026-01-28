import Link from 'next/link'
import Image from 'next/image'
import type { ProductWithSeller } from '@/types'

interface ProductCardProps {
  product: ProductWithSeller
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원'
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 30) return `${diffDays}일 전`
  return date.toLocaleDateString('ko-KR')
}

const statusLabels = {
  selling: '',
  reserved: '예약중',
  sold: '판매완료',
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0] || '/placeholder.png'

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
        <div className="relative aspect-square bg-gray-100">
          {product.images?.[0] ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {product.status !== 'selling' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {statusLabels[product.status]}
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-gray-900 truncate">{product.title}</h3>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {formatPrice(product.price)}
          </p>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{formatTimeAgo(product.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
