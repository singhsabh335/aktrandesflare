import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';
import { FiMapPin, FiPlus, FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Address {
  _id?: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

export default function Addresses() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const { data, isLoading } = useQuery(
    'user-addresses',
    async () => {
      const response = await api.get('/auth/profile');
      return response.data.data.user.addresses || [];
    },
    { enabled: !!user }
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Address>({
    defaultValues: editingAddress || {
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      isDefault: false,
    },
  });

  const addAddressMutation = useMutation(
    async (addressData: Address) => {
      return api.post('/auth/addresses', addressData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-addresses');
        toast.success('Address added successfully!');
        setShowAddForm(false);
        reset();
      },
      onError: () => {
        toast.error('Failed to add address');
      },
    }
  );

  const setDefaultAddressMutation = useMutation(
    async (addressIndex: number) => {
      // Update addresses with isDefault flag
      const addresses = [...(data || [])];
      addresses.forEach((addr, idx) => {
        addr.isDefault = idx === addressIndex;
      });
      
      // This would need a proper endpoint in the backend
      // For now, we'll just update locally
      return Promise.resolve();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-addresses');
        toast.success('Default address updated!');
      },
    }
  );

  if (!user) {
    router.push('/login');
    return null;
  }

  const onSubmit = (data: Address) => {
    if (editingAddress) {
      // Handle update (would need backend endpoint)
      toast.info('Update functionality coming soon');
      setEditingAddress(null);
    } else {
      addAddressMutation.mutate(data);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FiMapPin className="text-2xl text-ak-primary" />
            <h1 className="text-3xl font-bold">Saved Addresses</h1>
          </div>
          {!showAddForm && !editingAddress && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus className="text-lg" />
              Add New Address
            </button>
          )}
        </div>

        {(showAddForm || editingAddress) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="input-field"
                    placeholder="Full name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <input
                    {...register('phone', { required: 'Phone is required' })}
                    className="input-field"
                    placeholder="10-digit mobile number"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                <input
                  {...register('addressLine1', { required: 'Address is required' })}
                  className="input-field"
                  placeholder="House/Flat/Building number"
                />
                {errors.addressLine1 && (
                  <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address Line 2</label>
                <input
                  {...register('addressLine2')}
                  className="input-field"
                  placeholder="Area, Street, Sector, Village"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    {...register('city', { required: 'City is required' })}
                    className="input-field"
                    placeholder="City"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <input
                    {...register('state', { required: 'State is required' })}
                    className="input-field"
                    placeholder="State"
                  />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pincode *</label>
                  <input
                    {...register('pincode', { required: 'Pincode is required' })}
                    className="input-field"
                    placeholder="6-digit pincode"
                  />
                  {errors.pincode && (
                    <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Landmark (Optional)</label>
                <input
                  {...register('landmark')}
                  className="input-field"
                  placeholder="Nearby landmark"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('isDefault')}
                  id="isDefault"
                  className="w-4 h-4 text-ak-primary"
                />
                <label htmlFor="isDefault" className="text-sm font-medium">
                  Set as default address
                </label>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1" disabled={addAddressMutation.isLoading}>
                  {addAddressMutation.isLoading ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAddress(null);
                    reset();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FiMapPin className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Saved Addresses</h2>
            <p className="text-gray-600 mb-6">Add an address to get started!</p>
            <button onClick={() => setShowAddForm(true)} className="btn-primary">
              Add Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((address: Address, index: number) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                  address.isDefault ? 'border-ak-primary' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-ak-primary" />
                    {address.isDefault && (
                      <span className="bg-ak-primary text-white text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingAddress(address)}
                      className="p-2 text-gray-600 hover:text-ak-primary hover:bg-gray-100 rounded transition-colors"
                      title="Edit address"
                    >
                      <FiEdit2 className="text-sm" />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete address"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-gray-900">{address.name}</p>
                  <p className="text-gray-600">{address.phone}</p>
                  <p className="text-gray-600">
                    {address.addressLine1}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                  </p>
                  <p className="text-gray-600">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  {address.landmark && (
                    <p className="text-gray-500 text-xs">Landmark: {address.landmark}</p>
                  )}
                </div>
                {!address.isDefault && (
                  <button
                    onClick={() => setDefaultAddressMutation.mutate(index)}
                    className="mt-4 w-full text-sm py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiCheck className="text-sm" />
                    Set as Default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

