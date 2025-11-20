import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Header from '@/components/Header';
import Link from 'next/link';

export default function AdminReports() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: salesData } = useQuery(
    'admin-sales-report',
    async () => {
      const response = await api.get('/admin/reports/sales');
      return response.data.data;
    },
    { enabled: !!user && user.role === 'admin' }
  );

  const { data: topProducts } = useQuery(
    'admin-top-products',
    async () => {
      const response = await api.get('/admin/reports/top-products');
      return response.data.data;
    },
    { enabled: !!user && user.role === 'admin' }
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
          <h1 className="text-3xl font-bold">Sales Reports</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
            <p className="text-3xl font-bold text-ak-primary">
              ₹{salesData?.totalSales?.toLocaleString() || 0}
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-ak-primary">
              {salesData?.totalOrders || 0}
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Items Sold</h3>
            <p className="text-3xl font-bold text-ak-primary">
              {salesData?.totalItems || 0}
            </p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Top Products</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">Brand</th>
                <th className="text-left p-4">Rating</th>
                <th className="text-left p-4">Reviews</th>
              </tr>
            </thead>
            <tbody>
              {topProducts?.products?.map((product: any) => (
                <tr key={product._id} className="border-b">
                  <td className="p-4">{product.name}</td>
                  <td className="p-4">{product.brand}</td>
                  <td className="p-4">{product.rating?.toFixed(1)} ⭐</td>
                  <td className="p-4">{product.reviewCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

