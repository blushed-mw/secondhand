'use client'

import { useState } from 'react'
import { deleteProduct } from '@/actions/products'

interface DeleteButtonProps {
  productId: number
}

export default function DeleteButton({ productId }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('정말 삭제하시겠습니까?')) return

    setIsDeleting(true)
    await deleteProduct(productId)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex-1 py-3 text-center text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {isDeleting ? '삭제 중...' : '삭제하기'}
    </button>
  )
}
