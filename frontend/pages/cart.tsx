import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';
import { useCartStore } from '@/lib/store';
import Image from 'next/image';

export default function Cart() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setCart } = useCartStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    'cart',
    async () => {
      const response = await api.get('/cart');
      return response.data.data;
    },
    {
      enabled: !!user,
      onSuccess: (data) => {
        setCart(data.items || [], data.total || 0, data.itemCount || 0);
      },
    }
  );

  const updateCartMutation = useMutation(
    (data: any) => api.put('/cart', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
      },
    }
  );

  const removeFromCartMutation = useMutation(
    (data: any) => api.delete('/cart', { data }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        toast.success('Item removed from cart');
      },
    }
  );

  if (!user) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12">Loading...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        {data?.items?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <a href="/" className="btn-primary">
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {data?.items?.map((item: any) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="card flex gap-4">
                  <div className="relative w-24 h-24">
                    <Image src={item.image} alt={item.name} fill className="object-cover rounded" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.brand}</p>
                    <p className="text-sm text-gray-600">
                      Size: {item.size} | Color: {item.color}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateCartMutation.mutate({
                              productId: item.productId,
                              size: item.size,
                              color: item.color,
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                          className="px-2 py-1 border rounded"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateCartMutation.mutate({
                              productId: item.productId,
                              size: item.size,
                              color: item.color,
                              quantity: item.quantity + 1,
                            })
                          }
                          className="px-2 py-1 border rounded"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      removeFromCartMutation.mutate({
                        productId: item.productId,
                        size: item.size,
                        color: item.color,
                      })
                    }
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="md:col-span-1">
              <div className="card sticky top-20">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{data?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>₹{data?.total > 500 ? 0 : 50}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{(data?.total || 0) + (data?.total > 500 ? 0 : 50)}</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/checkout')}
                  className="btn-primary w-full"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

