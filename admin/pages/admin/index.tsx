import { useQuery } from 'react-query';
import AdminLayout from '@/components/AdminLayout';
import api from '@/lib/api';
import { FiPackage, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';

export default function AdminDashboard() {
  const { data: salesData } = useQuery('admin-sales-report', async () => {
    const response = await api.get('/admin/reports/sales');
    return response.data.data;
  });

  const { data: ordersData } = useQuery('admin-orders-count', async () => {
    const response = await api.get('/admin/orders', { params: { limit: 1 } });
    return response.data.data;
  });

  const { data: productsData } = useQuery('admin-products-count', async () => {
    const response = await api.get('/admin/products', { params: { limit: 1 } });
    return response.data.data;
  });

  const { data: usersData } = useQuery('admin-users-count', async () => {
    const response = await api.get('/admin/users', { params: { limit: 1 } });
    return response.data.data;
  });

  const stats = [
    {
      label: 'Total Sales',
      value: `₹${salesData?.totalSales?.toLocaleString() || 0}`,
      icon: FiDollarSign,
      color: 'bg-green-500',
    },
    {
      label: 'Total Orders',
      value: ordersData?.pagination?.total || 0,
      icon: FiShoppingBag,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Products',
      value: productsData?.pagination?.total || 0,
      icon: FiPackage,
      color: 'bg-purple-500',
    },
    {
      label: 'Total Users',
      value: usersData?.pagination?.total || 0,
      icon: FiUsers,
      color: 'bg-orange-500',
    },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full text-white`}>
                    <Icon className="text-2xl" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a href="/admin/products" className="block btn-primary text-center">
                Manage Products
              </a>
              <a href="/admin/orders" className="block btn-secondary text-center">
                View Orders
              </a>
              <a href="/admin/users" className="block btn-accent text-center">
                Manage Users
              </a>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <p className="text-gray-600">Activity feed will appear here</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

