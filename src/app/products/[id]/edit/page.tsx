import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductForm from '@/components/products/ProductForm'
import { getProduct, getCategories } from '@/actions/products'
import { getProfile, getUser } from '@/actions/auth'
import { notFound, redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: '상품 수정 - 고구마마켓',
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const [profile, user, product, categories] = await Promise.all([
    getProfile(),
    getUser(),
    getProduct(parseInt(id)),
    getCategories(),
  ])

  if (!profile) {
    redirect('/login')
  }

  if (!product) {
    notFound()
  }

  if (user?.id !== product.seller_id) {
    redirect(`/products/${id}`)
  }

  return (
    <>
      <Header profile={profile} />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">상품 수정</h1>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <ProductForm categories={categories} product={product} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
