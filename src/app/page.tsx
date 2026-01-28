import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductList from '@/components/products/ProductList'
import { getProducts, getCategories } from '@/actions/products'
import { getProfile } from '@/actions/auth'
import Link from 'next/link'

export default async function HomePage() {
  const [profile, { products }, categories] = await Promise.all([
    getProfile(),
    getProducts({ limit: 12 }),
    getCategories(),
  ])

  return (
    <>
      <Header profile={profile} />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* 카테고리 */}
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4">카테고리</h2>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {categories.slice(0, 7).map((category) => (
                <Link
                  key={category.id}
                  href={`/search?category=${category.id}`}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl mb-1">{category.icon}</span>
                  <span className="text-xs text-gray-600 text-center">{category.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* 최신 상품 */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">최근 등록된 물품</h2>
              <Link href="/products" className="text-sm text-orange-500 hover:underline">
                더보기
              </Link>
            </div>
            <ProductList products={products} />
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
