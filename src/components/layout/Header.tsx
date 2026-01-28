'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import type { Profile } from '@/types'

interface HeaderProps {
  profile: Profile | null
}

export default function Header({ profile }: HeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-orange-500">
            고구마마켓
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          <nav className="flex items-center gap-2">
            {profile ? (
              <>
                <Link href="/products/new">
                  <Button size="sm">판매하기</Button>
                </Link>
                <Link href="/chat">
                  <Button variant="ghost" size="sm">채팅</Button>
                </Link>
                <Link href="/my">
                  <Button variant="ghost" size="sm">
                    {profile.nickname}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">로그인</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">회원가입</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
