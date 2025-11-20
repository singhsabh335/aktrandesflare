import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function Orders() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery(
    'orders',
    async () => {
      const response = await api.get('/orders');
      return response.data.data.orders;
    },
    { enabled: !!user }
  );

  if (!user) {
    router.push('/login');
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      case 'shipped':
      case 'out_for_delivery':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : data?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No orders found</p>
            <Link href="/" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.map((order: any) => (
              <div key={order._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span>
                        {item.productId?.name || 'Product'} - {item.variant.size} /{' '}
                        {item.variant.color} x {item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t pt-4">
                  <div>
                    <p className="text-sm text-gray-600">Total: ₹{order.finalAmount}</p>
                  </div>
                  <Link href={`/orders/${order._id}`} className="btn-primary text-sm">
                    View Details
                  </Link>
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

