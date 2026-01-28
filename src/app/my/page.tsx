import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductList from '@/components/products/ProductList'
import { getMyProducts } from '@/actions/products'
import { getProfile } from '@/actions/auth'
import { signOut } from '@/actions/auth'
import { redirect } from 'next/navigation'
import Button from '@/components/ui/Button'

export const metadata = {
  title: '마이페이지 - 고구마마켓',
}

export default async function MyPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  const myProducts = await getMyProducts()

  return (
    <>
      <Header profile={profile} />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* 프로필 정보 */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl text-orange-500 font-bold">
                  {profile.nickname[0]}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{profile.nickname}</h1>
                <p className="text-gray-500">{profile.email}</p>
              </div>
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">
                  로그아웃
                </Button>
              </form>
            </div>
          </div>

          {/* 내 상품 */}
          <section>
            <h2 className="text-lg font-bold mb-4">
              내 판매 상품 ({myProducts.length})
            </h2>
            <ProductList products={myProducts} />
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
