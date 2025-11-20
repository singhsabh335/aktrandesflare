import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/store';
import { FiHome, FiPackage, FiShoppingBag, FiUsers, FiTag, FiBarChart2, FiLogOut } from 'react-icons/fi';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: FiHome },
    { href: '/admin/products', label: 'Products', icon: FiPackage },
    { href: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
    { href: '/admin/users', label: 'Users', icon: FiUsers },
    { href: '/admin/coupons', label: 'Coupons', icon: FiTag },
    { href: '/admin/reports', label: 'Reports', icon: FiBarChart2 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8">AkTrendFlare</h1>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-ak-primary text-white'
                      : 'text-gray-300 hover:bg-ak-primary/20 hover:text-white'
                  }`}
                >
                  <Icon className="text-xl" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
          <div className="mb-4">
            <p className="text-sm text-gray-300">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-gray-300 hover:bg-ak-primary/20 hover:text-white rounded-lg transition-colors"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

