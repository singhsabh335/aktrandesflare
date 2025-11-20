import { useQuery } from 'react-query';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';

export default function AdminReports() {
  const { data: salesData } = useQuery('admin-sales-report', async () => {
    const response = await api.get('/admin/reports/sales');
    return response.data.data;
  });

  const { data: topProducts } = useQuery('admin-top-products', async () => {
    const response = await api.get('/admin/reports/top-products');
    return response.data.data;
  });

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Sales Reports</h1>

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
        <div className="overflow-x-auto">
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
    </AdminLayout>
  );
}

