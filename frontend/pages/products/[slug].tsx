import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';

export default function ProductDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = useAuthStore();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data, isLoading } = useQuery(
    ['product', slug],
    async () => {
      const response = await api.get(`/products/slug/${slug}`);
      return response.data.data.product;
    },
    { enabled: !!slug }
  );

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      await api.post('/cart', {
        productId: data._id,
        size: selectedSize,
        color: selectedColor,
        quantity,
      });
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <p>Product not found</p>
        </div>
        <Footer />
      </>
    );
  }

  const variant = data.variants.find(
    (v: any) => v.size === selectedSize && v.color === selectedColor
  );

  const availableSizes = [...new Set(data.variants.map((v: any) => v.size))];
  const availableColors = selectedSize
    ? [...new Set(data.variants.filter((v: any) => v.size === selectedSize).map((v: any) => v.color))]
    : [...new Set(data.variants.map((v: any) => v.color))];

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="relative aspect-square mb-4">
              <Image
                src={data.images[selectedImage] || data.images[0]}
                alt={data.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              {data.images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded ${
                    selectedImage === index ? 'ring-2 ring-ak-primary' : ''
                  }`}
                >
                  <Image src={img} alt={`${data.name} ${index}`} fill className="object-cover rounded" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
            <p className="text-gray-600 mb-4">{data.brand}</p>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-ak-primary">₹{data.price}</span>
              {data.mrp > data.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">₹{data.mrp}</span>
                  <span className="bg-ak-accent text-ak-secondary px-2 py-1 rounded font-bold">
                    {data.discount}% OFF
                  </span>
                </>
              )}
            </div>
            <div className="mb-4">
              <p className="font-semibold mb-2">Size</p>
              <div className="flex gap-2">
                {availableSizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setSelectedColor('');
                    }}
                    className={`px-4 py-2 border rounded ${
                      selectedSize === size
                        ? 'border-ak-primary bg-ak-primary text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="font-semibold mb-2">Color</p>
              <div className="flex gap-2">
                {availableColors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded ${
                      selectedColor === color
                        ? 'border-ak-primary bg-ak-primary text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
            {variant && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Stock: {variant.stock > 0 ? `${variant.stock} available` : 'Out of stock'}
                </p>
              </div>
            )}
            <div className="mb-4">
              <p className="font-semibold mb-2">Quantity</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 border rounded"
                >
                  -
                </button>
                <span className="px-4">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(variant?.stock || 1, quantity + 1))}
                  className="px-3 py-1 border rounded"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={handleAddToCart} className="btn-primary flex-1">
                Add to Cart
              </button>
              <button className="btn-secondary flex-1">Buy Now</button>
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-gray-700">{data.description}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

