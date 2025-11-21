import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

export default function Search() {
  const router = useRouter();
  const { q, category, brand, gender, size, color, price_min, price_max, sort } = router.query;
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    gender: gender || '',
    size: size || '',
    color: color || '',
    priceMin: price_min || '',
    priceMax: price_max || '',
    brand: brand || '',
  });

  // Fetch brands and other filter options
  const { data: brandsData } = useQuery('brands', async () => {
    const response = await api.get('/products/brands');
    return response.data.data?.brands || [];
  });

  const { data, isLoading } = useQuery(
    ['products', q, category, filters.brand, filters.gender, filters.size, filters.color, filters.priceMin, filters.priceMax, sort, page],
    async () => {
      const response = await api.get('/products', {
        params: {
          q,
          category,
          brand: filters.brand,
          gender: filters.gender,
          size: filters.size,
          color: filters.color,
          price_min: filters.priceMin,
          price_max: filters.priceMax,
          sort: sort || 'relevance',
          page,
          limit: 20,
        },
      });
      return response.data.data;
    },
    { keepPreviousData: true }
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    // Update URL without page reload
    const newQuery = { ...router.query, [key]: value || undefined };
    if (!value) delete newQuery[key];
    router.push({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
  };

  const clearFilters = () => {
    setFilters({
      gender: '',
      size: '',
      color: '',
      priceMin: '',
      priceMax: '',
      brand: '',
    });
    router.push({ pathname: router.pathname, query: { q: router.query.q } }, undefined, { shallow: true });
  };

  // Get unique sizes and colors from products
  const availableSizes = [...new Set(data?.products?.flatMap((p: any) => p.variants?.map((v: any) => v.size) || []) || [])].sort();
  const availableColors = [...new Set(data?.products?.flatMap((p: any) => p.variants?.map((v: any) => v.color) || []) || [])].sort();

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            {q ? `Search Results for "${q}"` : category ? category : 'All Products'}
          </h1>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Sort by:</label>
            <select
              value={sort || 'relevance'}
              onChange={(e) => {
                router.push({ pathname: router.pathname, query: { ...router.query, sort: e.target.value } }, undefined, { shallow: true });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ak-primary focus:border-transparent outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <div className="card sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-ak-primary hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Gender Filter */}
              <div className="mb-6 pb-6 border-b">
                <label className="block text-sm font-semibold mb-3">Gender</label>
                <div className="space-y-2">
                  {['Men', 'Women', 'Kids', 'Unisex'].map((g) => (
                    <label key={g} className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={filters.gender === g}
                        onChange={(e) => handleFilterChange('gender', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6 pb-6 border-b">
                <label className="block text-sm font-semibold mb-3">Brand</label>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ak-primary focus:border-transparent outline-none text-sm"
                >
                  <option value="">All Brands</option>
                  {brandsData?.map((b: string) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Size Filter */}
              <div className="mb-6 pb-6 border-b">
                <label className="block text-sm font-semibold mb-3">Size</label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleFilterChange('size', filters.size === s ? '' : s)}
                      className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                        filters.size === s
                          ? 'bg-ak-primary text-white border-ak-primary'
                          : 'bg-white border-gray-300 hover:border-ak-primary'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div className="mb-6 pb-6 border-b">
                <label className="block text-sm font-semibold mb-3">Color</label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleFilterChange('color', filters.color === c ? '' : c)}
                      className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                        filters.color === c
                          ? 'bg-ak-primary text-white border-ak-primary'
                          : 'bg-white border-gray-300 hover:border-ak-primary'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">Price Range</label>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ak-primary focus:border-transparent outline-none text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ak-primary focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </aside>

          <main className="md:col-span-3">
            <div className="mb-6">
              <p className="text-gray-600">
                {data?.pagination?.total || 0} products found
              </p>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-lg" />
                ))}
              </div>
            ) : data?.products?.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                  {data.products.map((product: any) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                {data.pagination?.totalPages > page && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setPage(page + 1)}
                      className="btn-primary"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found. Try adjusting your filters.</p>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

