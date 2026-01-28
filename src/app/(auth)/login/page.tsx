import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'

export const metadata = {
  title: '로그인 - 고구마마켓',
  description: '고구마마켓에 로그인하세요',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-orange-500">
            고구마마켓
          </Link>
          <p className="mt-2 text-gray-600">내 근처의 중고 직거래</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
