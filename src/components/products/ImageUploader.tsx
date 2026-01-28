'use client'

import { useState } from 'react'
import Image from 'next/image'
import { uploadProductImage } from '@/actions/products'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUploader({ images, onChange, maxImages = 5 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const newImages: string[] = []

      for (const file of Array.from(files)) {
        if (images.length + newImages.length >= maxImages) break

        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadProductImage(formData)
        if (result.url) {
          newImages.push(result.url)
        }
      }

      onChange([...images, ...newImages])
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  function handleRemove(index: number) {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        상품 이미지 ({images.length}/{maxImages})
      </label>
      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={image}
              alt={`상품 이미지 ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {index === 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-xs text-center py-0.5">
                대표
              </div>
            )}
          </div>
        ))}
        {images.length < maxImages && (
          <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
            {isUploading ? (
              <svg className="animate-spin h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-gray-500 mt-1">사진 추가</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}
      </div>
    </div>
  )
}
