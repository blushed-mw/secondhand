'use client'

import { useState } from 'react'
import { signIn } from '@/actions/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Link from 'next/link'

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await signIn(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <Input
        id="email"
        name="email"
        type="email"
        label="이메일"
        placeholder="example@email.com"
        required
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="비밀번호"
        placeholder="비밀번호를 입력하세요"
        required
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        로그인
      </Button>

      <p className="text-center text-sm text-gray-600">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="text-orange-500 hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  )
}
