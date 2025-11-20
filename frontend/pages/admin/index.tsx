import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import Header from '@/components/Header';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait a bit for auth store to initialize
    const timer = setTimeout(() => {
      setIsChecking(false);
      if (!user || user.role !== 'admin') {
        router.push('/login?redirect=/admin');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user, router]);

  if (isChecking) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="card text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need to be logged in as an admin to access this page.</p>
            <Link href="/login" className="btn-primary">
              Login as Admin
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/products" className="card hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold mb-2">Products</h2>
            <p className="text-gray-600">Manage products and inventory</p>
          </Link>
          <Link href="/admin/orders" className="card hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold mb-2">Orders</h2>
            <p className="text-gray-600">View and manage orders</p>
          </Link>
          <Link href="/admin/users" className="card hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold mb-2">Users</h2>
            <p className="text-gray-600">Manage user accounts</p>
          </Link>
          <Link href="/admin/coupons" className="card hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold mb-2">Coupons</h2>
            <p className="text-gray-600">Manage discount coupons</p>
          </Link>
          <Link href="/admin/reports" className="card hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold mb-2">Reports</h2>
            <p className="text-gray-600">View sales and analytics</p>
          </Link>
        </div>
      </div>
    </>
  );
}

