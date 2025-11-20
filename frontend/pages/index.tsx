import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from 'react-query';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import HeroBanner from '@/components/HeroBanner';

export default function Home() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    ['products', page],
    async () => {
      const response = await api.get('/products', {
        params: { page, limit: 20, sort: 'newest' },
      });
      return response.data.data;
    },
    { keepPreviousData: true }
  );

  return (
    <>
      <Head>
        <title>DevAshish - Fashion for Everyone</title>
        <meta name="description" content="Shop the latest fashion trends at DevAshish" />
      </Head>

      <Header />
      <main>
        <HeroBanner />
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data?.products?.map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          {data?.pagination?.totalPages > page && (
            <div className="text-center mt-8">
              <button
                onClick={() => setPage(page + 1)}
                className="btn-primary"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

