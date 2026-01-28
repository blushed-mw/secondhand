import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductList from '@/components/products/ProductList'
import { getProducts } from '@/actions/products'
import { getProfile } from '@/actions/auth'

export const metadata = {
  title: '전체 상품 - 고구마마켓',
  description: '고구마마켓의 모든 중고 물품을 확인하세요',
}

export default async function ProductsPage() {
  const [profile, { products }] = await Promise.all([
    getProfile(),
    getProducts({ limit: 40 }),
  ])

  return (
    <>
      <Header profile={profile} />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">전체 상품</h1>
          <ProductList products={products} />
        </div>
      </main>
      <Footer />
    </>
  )
}
