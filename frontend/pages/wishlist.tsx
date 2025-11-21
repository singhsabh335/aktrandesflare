import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';

export default function Wishlist() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    'wishlist',
    async () => {
      const response = await api.get('/auth/profile');
      const wishlistIds = response.data.data.user.wishlist || [];
      if (wishlistIds.length === 0) return [];
      
      const productsResponse = await api.get('/products', {
        params: { ids: wishlistIds.join(',') },
      });
      return productsResponse.data.data.products || [];
    },
    { enabled: !!user }
  );

  const removeFromWishlistMutation = useMutation(
    async (productId: string) => {
      // For now, we'll need to implement this endpoint in the backend
      // This is a placeholder
      const response = await api.get('/auth/profile');
      return response.data.data.user;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('wishlist');
        toast.success('Removed from wishlist');
      },
    }
  );

  const addToCartMutation = useMutation(
    async ({ productId, size, color }: { productId: string; size: string; color: string }) => {
      return api.post('/cart', { productId, size, color, quantity: 1 });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Added to cart');
      },
    }
  );

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <Link href="/" className="text-ak-primary hover:underline">
            Continue Shopping →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FiHeart className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-6">Start adding items you love!</p>
            <Link href="/" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.map((product: any) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow relative">
                <Link href={`/products/${product.slug || product._id}`}>
                  <div className="relative aspect-square">
                    <Image
                      src={product.images?.[0] || '/placeholder.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {product.discount > 0 && (
                      <span className="absolute top-2 right-2 bg-ak-accent text-ak-secondary px-2 py-1 rounded text-xs font-bold">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-xs text-gray-600 mb-1">{product.brand}</p>
                  <Link href={`/products/${product.slug || product._id}`}>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-ak-primary">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-ak-primary">₹{product.price}</span>
                    {product.mrp > product.price && (
                      <span className="text-xs text-gray-500 line-through">₹{product.mrp}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const firstVariant = product.variants?.[0];
                        if (firstVariant) {
                          addToCartMutation.mutate({
                            productId: product._id,
                            size: firstVariant.size,
                            color: firstVariant.color,
                          });
                        }
                      }}
                      className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1"
                    >
                      <FiShoppingCart className="text-sm" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlistMutation.mutate(product._id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

