'use client'

import { useState } from 'react'
import { createProduct, updateProduct } from '@/actions/products'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ImageUploader from './ImageUploader'
import type { Category, Product, ProductStatus } from '@/types'

interface ProductFormProps {
  categories: Category[]
  product?: Product
}

const statusOptions: { value: ProductStatus; label: string }[] = [
  { value: 'selling', label: '판매중' },
  { value: 'reserved', label: '예약중' },
  { value: 'sold', label: '판매완료' },
]

export default function ProductForm({ categories, product }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isEditing = !!product

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    formData.append('images', JSON.stringify(images))

    try {
      const result = isEditing
        ? await updateProduct(product.id, formData)
        : await createProduct(formData)

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
    } catch {
      setError('오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <ImageUploader images={images} onChange={setImages} />

      <Input
        id="title"
        name="title"
        label="제목"
        placeholder="상품 제목을 입력하세요"
        defaultValue={product?.title}
        required
      />

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
          카테고리
        </label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={product?.category_id}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">카테고리 선택</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      <Input
        id="price"
        name="price"
        type="number"
        label="가격"
        placeholder="0"
        min={0}
        defaultValue={product?.price}
        required
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          설명
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          placeholder="상품에 대한 설명을 입력하세요"
          defaultValue={product?.description}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        />
      </div>

      {isEditing && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            판매 상태
          </label>
          <select
            id="status"
            name="status"
            defaultValue={product?.status}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
        {isEditing ? '수정하기' : '등록하기'}
      </Button>
    </form>
  )
}
