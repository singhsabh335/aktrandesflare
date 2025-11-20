import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';

export default function AdminCoupons() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading } = useQuery('admin-coupons', async () => {
    const response = await api.get('/admin/coupons');
    return response.data.data;
  });

  const createMutation = useMutation(
    (data: any) => api.post('/admin/coupons', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-coupons');
        toast.success('Coupon created successfully!');
        setShowAddModal(false);
      },
    }
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Coupon Management</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          + Add Coupon
        </button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Code</th>
                  <th className="text-left p-4">Description</th>
                  <th className="text-left p-4">Discount</th>
                  <th className="text-left p-4">Min Cart</th>
                  <th className="text-left p-4">Used</th>
                  <th className="text-left p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.coupons?.map((coupon: any) => (
                  <tr key={coupon._id} className="border-b">
                    <td className="p-4 font-bold">{coupon.code}</td>
                    <td className="p-4">{coupon.description}</td>
                    <td className="p-4">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </td>
                    <td className="p-4">₹{coupon.minCartValue}</td>
                    <td className="p-4">
                      {coupon.usedCount} / {coupon.usageLimit || '∞'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          coupon.isActive ? 'bg-green-100' : 'bg-gray-100'
                        }`}
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && (
        <CouponModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isLoading}
        />
      )}
    </AdminLayout>
  );
}

function CouponModal({ onClose, onSubmit, isLoading }: any) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      minCartValue: 500,
      maxDiscount: null,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      usageLimit: 100,
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Add New Coupon</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Coupon Code *</label>
            <input {...register('code', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              {...register('description', { required: true })}
              className="input-field"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Discount Type *</label>
            <select {...register('discountType')} className="input-field">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Discount Value *</label>
            <input
              type="number"
              {...register('discountValue', { required: true, valueAsNumber: true })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Minimum Cart Value (₹) *</label>
            <input
              type="number"
              {...register('minCartValue', { required: true, valueAsNumber: true })}
              className="input-field"
            />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

