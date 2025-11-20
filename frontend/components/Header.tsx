import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { useCartStore } from '@/lib/store';
import api from '@/lib/api';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length >= 2) {
        try {
          const response = await api.get('/products/suggestions', {
            params: { q: searchQuery },
          });
          setSuggestions(response.data.data.suggestions || []);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-ak-primary">
            DevAshish
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ak-primary focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <Link
                      key={index}
                      href={`/search?q=${encodeURIComponent(suggestion)}`}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      {suggestion}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </form>

          <div className="flex items-center gap-4">
            <Link href="/search" className="md:hidden">
              <FiSearch className="text-2xl" />
            </Link>
            <Link href="/cart" className="relative">
              <FiShoppingCart className="text-2xl" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-ak-accent text-ak-secondary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative group">
                <Link href="/profile">
                  <FiUser className="text-2xl" />
                </Link>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg hidden group-hover:block">
                  <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                    Profile
                  </Link>
                  <Link href="/orders" className="block px-4 py-2 hover:bg-gray-100">
                    Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-2 hover:bg-gray-100">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm">
                Login
              </Link>
            )}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

