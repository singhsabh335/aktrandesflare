import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Header from '@/components/Header';
import Link from 'next/link';

export default function AdminOrders() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery(
    ['admin-orders', statusFilter],
    async () => {
      const response = await api.get('/admin/orders', {
        params: statusFilter ? { status: statusFilter } : {},
      });
      return response.data.data;
    },
    { enabled: !!user && user.role === 'admin' }
  );

  const updateStatusMutation = useMutation(
    ({ id, status, note }: any) => api.put(`/admin/orders/${id}/status`, { status, note }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-orders');
        toast.success('Order status updated!');
      },
    }
  );

  if (!user || user.role !== 'admin') {
    router.push('/');
    return null;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/admin" className="text-ak-primary mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Order Management</h1>
        </div>

        <div className="mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-48"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            {data?.orders?.map((order: any) => (
              <div key={order._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">
                      {order.userId?.name} - {order.userId?.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-ak-primary text-white rounded">
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between mb-2">
                      <span>
                        {item.productId?.name} - {item.variant.size} / {item.variant.color} x{' '}
                        {item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">Total: ₹{order.finalAmount}</p>
                    <p className="text-sm text-gray-600">Payment: {order.paymentStatus}</p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) => {
                      updateStatusMutation.mutate({
                        id: order._id,
                        status: e.target.value,
                        note: `Status changed to ${e.target.value}`,
                      });
                    }}
                    className="input-field"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

