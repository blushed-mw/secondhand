import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductForm from '@/components/products/ProductForm'
import { getCategories } from '@/actions/products'
import { getProfile } from '@/actions/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: '상품 등록 - 고구마마켓',
  description: '고구마마켓에 중고 물품을 등록하세요',
}

export default async function NewProductPage() {
  const [profile, categories] = await Promise.all([
    getProfile(),
    getCategories(),
  ])

  if (!profile) {
    redirect('/login')
  }

  return (
    <>
      <Header profile={profile} />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">상품 등록</h1>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <ProductForm categories={categories} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
