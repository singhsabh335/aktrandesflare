import { useRouter } from 'next/router';
import { useState } from 'react';
import { useQuery } from 'react-query';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

export default function Search() {
  const router = useRouter();
  const { q, category, brand, price_min, price_max, sort } = router.query;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    ['products', q, category, brand, price_min, price_max, sort, page],
    async () => {
      const response = await api.get('/products', {
        params: {
          q,
          category,
          brand,
          price_min,
          price_max,
          sort: sort || 'relevance',
          page,
          limit: 20,
        },
      });
      return response.data.data;
    },
    { keepPreviousData: true }
  );

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <div className="card">
              <h3 className="font-bold mb-4">Filters</h3>
              {/* Add filter UI here */}
            </div>
          </aside>
          <main className="md:col-span-3">
            <div className="mb-4">
              <p className="text-gray-600">
                {data?.pagination?.total || 0} products found
              </p>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data?.products?.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

