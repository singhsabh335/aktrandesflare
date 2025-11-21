import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';
import { FiShoppingBag, FiTag, FiTruck } from 'react-icons/fi';
import { useState } from 'react';

interface BannerProduct {
  _id?: string;
  slug?: string;
  name: string;
  image: string;
  price: number;
  mrp?: number;
  discount?: number;
}

interface PromotionalBannerProps {
  type: 'offer' | 'product' | 'info';
  title: string;
  description: string;
  image?: string;
  product?: BannerProduct;
  link?: string;
  gradient?: string;
  icon?: React.ReactNode;
}

export default function PromotionalBanner({
  type,
  title,
  description,
  image,
  product,
  link,
  gradient = 'from-pink-500 to-red-500',
  icon,
}: PromotionalBannerProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // If it's a product banner and user is not logged in, redirect to login
    if (type === 'product' && product && !user) {
      e.preventDefault();
      e.stopPropagation();
      const redirectUrl = `/products/${product.slug || product._id}`;
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return false;
    }
  };

  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'offer':
        return <FiTag className="text-3xl" />;
      case 'product':
        return <FiShoppingBag className="text-3xl" />;
      case 'info':
        return <FiTruck className="text-3xl" />;
      default:
        return null;
    }
  };

  const bannerContent = (
    <div
      className={`relative bg-gradient-to-r ${gradient} rounded-xl p-6 text-white overflow-hidden cursor-pointer transition-all duration-300 ${
        isHovered ? 'shadow-2xl scale-[1.02]' : 'shadow-lg'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...(type === 'product' && product && !user ? { onClick: handleClick } : {})}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
      </div>

      <div className="relative z-10 flex items-center gap-6">
        {/* Icon/Product Image */}
        <div className="flex-shrink-0">
          {type === 'product' && product?.image ? (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-white/20 backdrop-blur-sm">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-lg">
              {getIcon()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-bold mb-1">{title}</h3>
          <p className="text-sm md:text-base opacity-90 mb-2">{description}</p>
          {type === 'product' && product && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-bold">₹{product.price}</span>
              {product.mrp && product.mrp > product.price && (
                <span className="text-sm line-through opacity-75">₹{product.mrp}</span>
              )}
              {product.discount && (
                <span className="bg-white/30 px-2 py-1 rounded text-xs font-semibold">
                  {product.discount}% OFF
                </span>
              )}
            </div>
          )}
        </div>

        {/* CTA Arrow */}
        <div className="flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform ${
              isHovered ? 'translate-x-2' : ''
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Overlay for non-logged users on product banners */}
      {type === 'product' && product && !user && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center rounded-xl pointer-events-none">
          <span className="bg-white/95 text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm shadow-lg">
            Login to View Product
          </span>
        </div>
      )}
    </div>
  );

  // Handle different banner types
  if (type === 'product' && product) {
    if (user) {
      // User is logged in, allow navigation to product
      return <Link href={`/products/${product.slug || product._id}`}>{bannerContent}</Link>;
    } else {
      // User not logged in, clicking will trigger login redirect (handled by onClick)
      return <div>{bannerContent}</div>;
    }
  }

  // For offer and info banners, use link if provided
  if (link) {
    return <Link href={link}>{bannerContent}</Link>;
  }

  return bannerContent;
}

