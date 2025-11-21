import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    brand: string;
    price: number;
    mrp: number;
    discount: number;
    images: string[];
    slug?: string;
    requireLogin?: boolean; // Optional prop to require login
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleClick = (e: React.MouseEvent) => {
    // If login is required and user is not logged in, redirect to login
    if (product.requireLogin && !user) {
      e.preventDefault();
      router.push(`/login?redirect=/products/${product.slug || product._id}`);
    }
  };

  const productUrl = `/products/${product.slug || product._id}`;

  return (
    <Link href={productUrl} onClick={handleClick}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        <div className="relative aspect-square">
          <Image
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover"
          />
          {product.discount > 0 && (
            <span className="absolute top-2 right-2 bg-ak-accent text-ak-secondary px-2 py-1 rounded text-sm font-bold">
              {product.discount}% OFF
            </span>
          )}
          <button 
            className="absolute top-2 left-2 p-2 bg-white rounded-full hover:bg-gray-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!user) {
                router.push('/login?redirect=/wishlist');
              }
              // TODO: Add to wishlist functionality
            }}
          >
            <FiHeart className="text-gray-600" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
          <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-ak-primary">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-sm text-gray-500 line-through">₹{product.mrp}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

