import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Script from 'next/script';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  const { data: cartData } = useQuery('cart', async () => {
    const response = await api.get('/cart');
    return response.data.data;
  });

  const { register, handleSubmit } = useForm();

  const createOrderMutation = useMutation(
    (data: any) => api.post('/orders', data),
    {
      onSuccess: async (response) => {
        const { order, razorpayOrderId, razorpayKeyId } = response.data.data;

        if (paymentMethod === 'COD') {
          toast.success('Order placed successfully!');
          router.push(`/orders/${order._id}`);
          return;
        }

        if (razorpayOrderId && razorpayKeyId) {
          const options = {
            key: razorpayKeyId,
            amount: order.finalAmount * 100,
            currency: 'INR',
            name: 'DevAshish',
            description: `Order #${order.orderNumber}`,
            order_id: razorpayOrderId,
            handler: async (response: any) => {
              try {
                await api.post('/orders/verify', {
                  orderId: order._id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });
                toast.success('Payment successful!');
                router.push(`/orders/${order._id}`);
              } catch (error: any) {
                toast.error('Payment verification failed');
              }
            },
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.phone,
            },
            theme: {
              color: '#2A9D8F',
            },
          };

          const razorpay = new window.Razorpay(options);
          razorpay.open();
        }
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error?.message || 'Failed to create order');
      },
    }
  );

  const onSubmit = (data: any) => {
    createOrderMutation.mutate({
      shippingAddress: data,
      paymentMethod,
      couponCode: couponCode || undefined,
    });
  };

  const handleCouponApply = async () => {
    if (!couponCode) return;

    try {
      const response = await api.post('/coupons/validate', {
        code: couponCode,
        cartValue: cartData?.total || 0,
      });
      setCouponDiscount(response.data.data.coupon.discountAmount);
      toast.success('Coupon applied!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Invalid coupon');
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  const subtotal = cartData?.total || 0;
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const total = subtotal - couponDiscount + deliveryFee;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input {...register('name', { required: true })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input {...register('phone', { required: true })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Address Line 1</label>
                  <input {...register('addressLine1', { required: true })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input {...register('city', { required: true })} className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <input {...register('state', { required: true })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Pincode</label>
                    <input {...register('pincode', { required: true })} className="input-field" />
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Online Payment (Razorpay)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Cash on Delivery
                </label>
              </div>
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="card sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleCouponApply}
                    className="btn-secondary"
                  >
                    Apply
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={createOrderMutation.isLoading}>
                {createOrderMutation.isLoading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}

