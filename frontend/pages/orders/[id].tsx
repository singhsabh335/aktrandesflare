import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';

export default function OrderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery(
    ['order', id],
    async () => {
      const response = await api.get(`/orders/${id}`);
      return response.data.data.order;
    },
    { enabled: !!id && !!user }
  );

  const { data: trackingData } = useQuery(
    ['tracking', id],
    async () => {
      const response = await api.get(`/orders/${id}/track`);
      return response.data.data.tracking;
    },
    { enabled: !!id && !!user }
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

  if (!data) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <p>Order not found</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Order Details</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Order Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Order Number:</span> {data.orderNumber}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {data.status}
              </p>
              <p>
                <span className="font-semibold">Payment Status:</span> {data.paymentStatus}
              </p>
              <p>
                <span className="font-semibold">Payment Method:</span> {data.paymentMethod}
              </p>
              <p>
                <span className="font-semibold">Placed on:</span>{' '}
                {new Date(data.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            <div className="space-y-1">
              <p>{data.shippingAddress.name}</p>
              <p>{data.shippingAddress.addressLine1}</p>
              {data.shippingAddress.addressLine2 && <p>{data.shippingAddress.addressLine2}</p>}
              <p>
                {data.shippingAddress.city}, {data.shippingAddress.state} -{' '}
                {data.shippingAddress.pincode}
              </p>
              <p>Phone: {data.shippingAddress.phone}</p>
            </div>
          </div>
        </div>
        <div className="card mt-8">
          <h2 className="text-xl font-bold mb-4">Items</h2>
          <div className="space-y-4">
            {data.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between border-b pb-4">
                <div>
                  <p className="font-semibold">{item.productId?.name || 'Product'}</p>
                  <p className="text-sm text-gray-600">
                    {item.variant.size} / {item.variant.color} x {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{data.totalAmount}</span>
            </div>
            {data.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-₹{data.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span>₹{data.deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{data.finalAmount}</span>
            </div>
          </div>
        </div>
        {trackingData && (
          <div className="card mt-8">
            <h2 className="text-xl font-bold mb-4">Tracking</h2>
            <div className="space-y-4">
              {trackingData.timeline?.map((status: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-ak-primary"></div>
                    {index < trackingData.timeline.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-300"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{status.status}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(status.timestamp).toLocaleString()}
                    </p>
                    {status.note && <p className="text-sm text-gray-600">{status.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

