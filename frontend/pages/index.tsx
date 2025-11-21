import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import HeroBanner from '@/components/HeroBanner';
import BannerSlider from '@/components/BannerSlider';
import { useAuthStore } from '@/lib/store';

const CLOTHING_CATEGORIES = [
  { name: 'T-Shirts', icon: '👕', link: '/search?category=T-Shirts' },
  { name: 'Shirts', icon: '👔', link: '/search?category=Shirts' },
  { name: 'Jeans', icon: '👖', link: '/search?category=Jeans' },
  { name: 'Dresses', icon: '👗', link: '/search?category=Dresses' },
  { name: 'Sweaters', icon: '🧥', link: '/search?category=Sweaters' },
  { name: 'Jackets', icon: '🧥', link: '/search?category=Jackets' },
  { name: 'Shoes', icon: '👟', link: '/search?category=Shoes' },
  { name: 'Accessories', icon: '👜', link: '/search?category=Accessories' },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);

  // Fetch latest arrivals
  const { data: latestArrivals, isLoading: isLoadingLatest } = useQuery(
    ['products', 'latest', page],
    async () => {
      const response = await api.get('/products', {
        params: { page, limit: 8, sort: 'newest' },
      });
      return response.data.data;
    },
    { keepPreviousData: true }
  );

  // Fetch products on sale/offers
  const { data: offersData, isLoading: isLoadingOffers } = useQuery(
    'products-offers',
    async () => {
      const response = await api.get('/products', {
        params: { limit: 8, sort: 'discount', page: 1 },
      });
      return response.data.data;
    }
  );

  // Fetch featured/promotional products for banners
  const { data: featuredProducts } = useQuery(
    'featured-products',
    async () => {
      const response = await api.get('/products', {
        params: { limit: 3, sort: 'newest' },
      });
      return response.data.data?.products || [];
    },
    { retry: false }
  );

  // Fetch categories
  const { data: categoriesData } = useQuery(
    'categories',
    async () => {
      const response = await api.get('/products/categories');
      return response.data.data?.categories || [];
    }
  );

  return (
    <>
      <Head>
        <title>AkTrendFlare - Fashion for Everyone</title>
        <meta name="description" content="Shop the latest fashion trends at AkTrendFlare" />
      </Head>

      <Header />
      <main className="min-h-screen">
        <HeroBanner />
        
        {/* Categories Section */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {CLOTHING_CATEGORIES.map((category) => (
              <Link
                key={category.name}
                href={category.link}
                className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
              >
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {category.icon}
                </span>
                <span className="text-sm font-semibold text-gray-700 text-center">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Promotional Banners Slider Section */}
        <section className="container mx-auto px-4 py-8">
          <BannerSlider
            banners={[
              // Offer Banner
              {
                type: 'offer',
                title: 'Get Extra 20% Off',
                description: 'Use code WELCOME20 on your first order',
                gradient: 'from-orange-500 to-red-600',
                link: '/',
              },
              // Free Shipping Banner
              {
                type: 'info',
                title: 'Free Shipping',
                description: 'On orders above ₹999',
                gradient: 'from-blue-500 to-indigo-600',
                link: '/',
              },
              // Product Banner - Show featured product or placeholder
              featuredProducts && featuredProducts.length > 0
                ? {
                    type: 'product' as const,
                    title: featuredProducts[0]?.name || 'New Arrivals',
                    description: featuredProducts[0]?.brand || 'Check out our latest collection',
                    product: {
                      _id: featuredProducts[0]?._id,
                      slug: featuredProducts[0]?.slug,
                      name: featuredProducts[0]?.name,
                      image: featuredProducts[0]?.images?.[0] || '/placeholder.jpg',
                      price: featuredProducts[0]?.price,
                      mrp: featuredProducts[0]?.mrp,
                      discount: featuredProducts[0]?.discount,
                    },
                    gradient: 'from-purple-500 to-pink-600',
                  }
                : {
                    type: 'product' as const,
                    title: 'New Arrivals',
                    description: 'Check out our latest collection',
                    gradient: 'from-green-500 to-teal-600',
                    link: '/search?sort=newest',
                  },
              // Additional banners can be added here
              {
                type: 'offer' as const,
                title: 'Flash Sale!',
                description: 'Limited time offers on select items',
                gradient: 'from-red-500 to-pink-600',
                link: '/search?sort=discount',
              },
            ]}
            autoPlay={true}
            autoPlayInterval={5000}
            showDots={true}
            showArrows={true}
          />
        </section>

        {/* Latest Arrivals Section */}
        <section className="container mx-auto px-4 py-12 bg-gray-50">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Latest Arrivals</h2>
            <Link href="/search?sort=newest" className="text-ak-primary hover:underline font-semibold">
              View All →
            </Link>
          </div>
          {isLoadingLatest ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {latestArrivals?.products?.slice(0, 8).map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Offers Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Special Offers</h2>
            <Link href="/search?sort=discount" className="text-ak-primary hover:underline font-semibold">
              View All →
            </Link>
          </div>
          {isLoadingOffers ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {offersData?.products?.filter((p: any) => p.discount > 0).slice(0, 8).map((product: any) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

