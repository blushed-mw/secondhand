import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductList from '@/components/products/ProductList'
import { getProducts, getCategories } from '@/actions/products'
import { getProfile } from '@/actions/auth'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{
    q?: string
    category?: string
    sort?: 'latest' | 'price_asc' | 'price_desc'
  }>
}

export async function generateMetadata({ searchParams }: Props) {
  const params = await searchParams
  const query = params.q

  return {
    title: query ? `"${query}" 검색 결과 - 고구마마켓` : '검색 - 고구마마켓',
  }
}

const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'price_asc', label: '낮은 가격순' },
  { value: 'price_desc', label: '높은 가격순' },
]

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams
  const query = params.q || ''
  const categoryId = params.category ? parseInt(params.category) : undefined
  const sort = params.sort || 'latest'

  const [profile, { products, count }, categories] = await Promise.all([
    getProfile(),
    getProducts({
      search: query,
      categoryId,
      sort,
      limit: 40,
    }),
    getCategories(),
  ])

  const selectedCategory = categoryId
    ? categories.find((c) => c.id === categoryId)
    : null

  function buildUrl(newParams: Record<string, string | undefined>) {
    const urlParams = new URLSearchParams()
    if (query) urlParams.set('q', query)
    if (categoryId) urlParams.set('category', categoryId.toString())
    if (sort !== 'latest') urlParams.set('sort', sort)

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        urlParams.set(key, value)
      } else {
        urlParams.delete(key)
      }
    })

    return `/search?${urlParams.toString()}`
  }

  return (
    <>
      <Header profile={profile} />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* 검색 결과 헤더 */}
          <div className="mb-6">
            {query ? (
              <h1 className="text-2xl font-bold">
                &ldquo;{query}&rdquo; 검색 결과
                <span className="text-gray-500 text-lg font-normal ml-2">
                  ({count}개)
                </span>
              </h1>
            ) : (
              <h1 className="text-2xl font-bold">전체 상품</h1>
            )}
          </div>

          {/* 필터 */}
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-gray-200">
            {/* 카테고리 필터 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">카테고리:</span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildUrl({ category: undefined })}
                  className={`px-3 py-1 rounded-full text-sm ${
                    !categoryId
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전체
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={buildUrl({ category: category.id.toString() })}
                    className={`px-3 py-1 rounded-full text-sm ${
                      categoryId === category.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.icon} {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 정렬 */}
          <div className="flex justify-between items-center mb-4">
            {selectedCategory && (
              <p className="text-gray-600">
                {selectedCategory.icon} {selectedCategory.name}
              </p>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500">정렬:</span>
              <div className="flex gap-1">
                {sortOptions.map((option) => (
                  <Link
                    key={option.value}
                    href={buildUrl({ sort: option.value })}
                    className={`px-3 py-1 rounded text-sm ${
                      sort === option.value
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 상품 목록 */}
          <ProductList products={products} />
        </div>
      </main>
      <Footer />
    </>
  )
}
