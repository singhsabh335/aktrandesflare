import Link from 'next/link';
import Image from 'next/image';
import { FiHeart } from 'react-icons/fi';

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
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug || product._id}`}>
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
          <button className="absolute top-2 left-2 p-2 bg-white rounded-full hover:bg-gray-100">
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

