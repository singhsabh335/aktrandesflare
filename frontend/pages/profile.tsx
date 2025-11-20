import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const { data, isLoading } = useQuery(
    'profile',
    async () => {
      const response = await api.get('/auth/profile');
      return response.data.data.user;
    },
    { enabled: !!user }
  );

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 card">
              <h2 className="text-xl font-bold mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <p className="text-gray-700">{data?.name || user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <p className="text-gray-700">{data?.email || user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <p className="text-gray-700">{data?.phone || user.phone}</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Quick Links</h2>
                <div className="space-y-2">
                  <Link href="/orders" className="block btn-primary text-center">
                    My Orders
                  </Link>
                  <Link href="/cart" className="block btn-secondary text-center">
                    Shopping Cart
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="block btn-accent text-center">
                      Admin Panel
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

