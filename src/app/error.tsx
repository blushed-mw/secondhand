'use client'

import Button from '@/components/ui/Button'

interface ErrorProps {
  error: Error
  reset: () => void
}

export default function Error({ reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">!</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          오류가 발생했습니다
        </h2>
        <p className="text-gray-600 mb-8">
          잠시 후 다시 시도해주세요.
        </p>
        <Button onClick={reset} size="lg">
          다시 시도
        </Button>
      </div>
    </div>
  )
}
