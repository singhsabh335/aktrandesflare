import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FiStar } from 'react-icons/fi';
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
  const [reviewPage, setReviewPage] = useState(1);

  const { data, isLoading } = useQuery(
    ['product', slug],
    async () => {
      const response = await api.get(`/products/slug/${slug}`);
      return response.data.data.product;
    },
    { enabled: !!slug }
  );

  // Fetch reviews
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery(
    ['reviews', data?._id, reviewPage],
    async () => {
      const response = await api.get(`/reviews/product/${data._id}`, {
        params: { page: reviewPage, limit: 10, sort: 'latest' },
      });
      return response.data.data;
    },
    { enabled: !!data?._id }
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    if (!reviewsData?.reviews) return {};
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.reviews.forEach((review: any) => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    return distribution;
  };

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
            <div className="flex items-center gap-3 mb-4">
              <p className="text-gray-600">{data.brand}</p>
              {data.gender && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                    {data.gender}
                  </span>
                </>
              )}
            </div>
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
              <p className="text-gray-700 whitespace-pre-line">{data.description}</p>
            </div>

            {/* Ratings & Reviews Section */}
            <div className="mt-12 border-t pt-8">
              <div className="flex items-start gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{data.rating?.toFixed(1) || '0.0'}</div>
                  {renderStars(data.rating || 0)}
                  <p className="text-sm text-gray-600 mt-2">
                    {data.reviewCount || 0} {data.reviewCount === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
                <div className="flex-1">
                  {Object.entries(getRatingDistribution())
                    .reverse()
                    .map(([rating, count]) => {
                      const total = reviewsData?.pagination?.total || 0;
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={rating} className="flex items-center gap-3 mb-2">
                          <span className="text-sm w-12">{rating} star</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
              {isLoadingReviews ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg" />
                  ))}
                </div>
              ) : reviewsData?.reviews?.length > 0 ? (
                <>
                  <div className="space-y-6">
                    {reviewsData.reviews.map((review: any) => (
                      <div key={review._id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">
                                {review.userId?.name || 'Anonymous'}
                              </span>
                              {review.isVerifiedPurchase && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && (
                          <h4 className="font-semibold mb-2">{review.title}</h4>
                        )}
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {review.images.map((img: string, idx: number) => (
                              <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden">
                                <Image src={img} alt={`Review ${idx + 1}`} fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {reviewsData.pagination?.totalPages > reviewPage && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setReviewPage(reviewPage + 1)}
                        className="btn-primary"
                      >
                        Load More Reviews
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

