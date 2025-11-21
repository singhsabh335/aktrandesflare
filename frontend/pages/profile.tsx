import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { FiPackage, FiHeart, FiGift, FiPhone, FiTag, FiCreditCard, FiMapPin, FiLogOut } from 'react-icons/fi';

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

  // Don't redirect if not logged in - show login prompt instead
  const isLoggedIn = !!user;

  const menuItems = [
    { icon: FiPackage, label: 'Orders', href: '/orders', requireAuth: true },
    { icon: FiHeart, label: 'Wishlist', href: '/wishlist', requireAuth: true },
    { icon: FiGift, label: 'Gift Cards', href: '/gift-cards', requireAuth: false },
    { icon: FiPhone, label: 'Contact Us', href: '/contact', requireAuth: false },
    { icon: FiTag, label: 'Coupons', href: '/coupons', requireAuth: true },
    { icon: FiCreditCard, label: 'Saved Cards', href: '/saved-cards', requireAuth: true },
    { icon: FiMapPin, label: 'Saved Addresses', href: '/addresses', requireAuth: true },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {isLoggedIn ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-ak-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {(data?.name || user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome</h2>
                    <p className="text-gray-600">{data?.name || user?.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{data?.email || user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiLogOut className="text-xl" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome</h2>
                <p className="text-gray-600 mb-4">To access account and manage orders</p>
                <div className="flex gap-4 justify-center">
                  <Link href="/login" className="btn-primary">
                    Login
                  </Link>
                  <Link href="/register" className="btn-secondary">
                    Signup
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Menu Items Grid */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Account</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const canAccess = !item.requireAuth || isLoggedIn;
                
                return (
                  <Link
                    key={index}
                    href={canAccess ? item.href : '/login'}
                    className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-ak-primary hover:bg-ak-primary/5 transition-all group"
                  >
                    <Icon className="text-3xl text-gray-600 group-hover:text-ak-primary mb-3 transition-colors" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-ak-primary text-center">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Personal Information Section (for logged in users) */}
          {isLoggedIn && !isLoading && data && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                  <p className="text-gray-900 font-medium">{data?.name || user?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900 font-medium">{data?.email || user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-gray-900 font-medium">{data?.phone || user?.phone || 'Not provided'}</p>
                </div>
                {user?.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                    <p className="text-gray-900 font-medium capitalize">{user.role}</p>
                  </div>
                )}
              </div>
              {user?.role === 'admin' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link href="/admin" className="btn-accent">
                    Go to Admin Panel
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

