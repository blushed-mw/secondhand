'use client'

import { useState } from 'react'
import { signUp } from '@/actions/auth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Link from 'next/link'

export default function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await signUp(formData)

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
        id="nickname"
        name="nickname"
        type="text"
        label="닉네임"
        placeholder="닉네임을 입력하세요 (2자 이상)"
        minLength={2}
        required
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="비밀번호"
        placeholder="비밀번호를 입력하세요 (6자 이상)"
        minLength={6}
        required
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        회원가입
      </Button>

      <p className="text-center text-sm text-gray-600">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-orange-500 hover:underline">
          로그인
        </Link>
      </p>
    </form>
  )
}
