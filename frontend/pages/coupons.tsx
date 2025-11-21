import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { FiTag, FiCopy } from 'react-icons/fi';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Coupons() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data, isLoading } = useQuery(
    'available-coupons',
    async () => {
      // Fetch available coupons for users
      // This endpoint would need to be created in the backend
      const response = await api.get('/coupons/available');
      return response.data.data?.coupons || [];
    },
    {
      enabled: !!user,
      retry: false,
      onError: () => {
        // If endpoint doesn't exist, return empty array
        return [];
      },
    }
  );

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  const mockCoupons = [
    {
      _id: '1',
      code: 'WELCOME20',
      description: 'Get 20% off on your first order',
      discountType: 'percentage',
      discountValue: 20,
      minCartValue: 999,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      _id: '2',
      code: 'FLAT500',
      description: 'Get flat ₹500 off on orders above ₹2999',
      discountType: 'fixed',
      discountValue: 500,
      minCartValue: 2999,
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      _id: '3',
      code: 'SAVE15',
      description: 'Get 15% off on all fashion items',
      discountType: 'percentage',
      discountValue: 15,
      minCartValue: 1500,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ];

  const coupons = data && data.length > 0 ? data : mockCoupons;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <FiTag className="text-2xl text-ak-primary" />
          <h1 className="text-3xl font-bold">My Coupons</h1>
        </div>

        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Apply coupon codes during checkout to avail discounts!
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FiTag className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Coupons Available</h2>
            <p className="text-gray-600 mb-6">Check back later for exciting offers!</p>
            <Link href="/" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon: any) => (
              <div
                key={coupon._id || coupon.code}
                className="bg-gradient-to-br from-pink-500 to-red-500 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FiTag className="text-xl" />
                      <span className="text-xl font-bold tracking-wider">{coupon.code}</span>
                    </div>
                    <p className="text-sm opacity-90 mb-2">{coupon.description}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(coupon.code)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    title="Copy code"
                  >
                    <FiCopy className="text-lg" />
                  </button>
                </div>
                <div className="border-t border-white/30 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span className="font-bold">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue} OFF`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Min. Cart Value:</span>
                    <span className="font-bold">₹{coupon.minCartValue}</span>
                  </div>
                  {coupon.validUntil && (
                    <div className="flex justify-between text-xs opacity-80">
                      <span>Valid until:</span>
                      <span>{new Date(coupon.validUntil).toLocaleDateString()}</span>
                    </div>
                  )}
                  {copiedCode === coupon.code && (
                    <div className="mt-2 text-xs bg-white/20 rounded px-2 py-1 text-center">
                      ✓ Copied!
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

