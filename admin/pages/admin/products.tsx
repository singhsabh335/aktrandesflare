import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { data, isLoading } = useQuery('admin-products', async () => {
    const response = await api.get('/admin/products');
    return response.data.data;
  });

  const createMutation = useMutation(
    (data: any) => api.post('/admin/products', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-products');
        toast.success('Product created successfully!');
        setShowAddModal(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error?.message || 'Failed to create product');
      },
    }
  );

  const deleteMutation = useMutation(
    (id: string) => api.delete(`/admin/products/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-products');
        toast.success('Product deleted successfully!');
      },
    }
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          + Add Product
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
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Brand</th>
                  <th className="text-left p-4">Price</th>
                  <th className="text-left p-4">Stock</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.products?.map((product: any) => (
                  <tr key={product._id} className="border-b">
                    <td className="p-4">{product.name}</td>
                    <td className="p-4">{product.brand}</td>
                    <td className="p-4">₹{product.price}</td>
                    <td className="p-4">
                      {product.variants?.reduce((sum: number, v: any) => sum + v.stock, 0) || 0}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-ak-primary mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this product?')) {
                            deleteMutation.mutate(product._id);
                          }
                        }}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(showAddModal || editingProduct) && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSubmit={(data) => {
            if (editingProduct) {
              api.put(`/admin/products/${editingProduct._id}`, data)
                .then(() => {
                  queryClient.invalidateQueries('admin-products');
                  toast.success('Product updated!');
                  setEditingProduct(null);
                })
                .catch((error: any) => {
                  toast.error(error.response?.data?.error?.message || 'Failed to update');
                });
            } else {
              createMutation.mutate(data);
            }
          }}
          isLoading={createMutation.isLoading}
        />
      )}
    </AdminLayout>
  );
}

function ProductModal({ product, onClose, onSubmit, isLoading }: any) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    product?.categories || []
  );
  
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: product
      ? {
          name: product.name,
          brand: product.brand,
          gender: product.gender || 'Unisex',
          description: product.description,
          price: product.price,
          mrp: product.mrp,
          discount: product.discount,
          customCategories: '',
          images: product.images?.join('\n') || '',
          size: product.variants?.[0]?.size || 'M',
          color: product.variants?.[0]?.color || 'Black',
          stock: product.variants?.[0]?.stock || 0,
        }
      : {
          name: '',
          brand: '',
          gender: 'Unisex',
          description: '',
          price: '',
          mrp: '',
          discount: 0,
          customCategories: '',
          images: '',
          size: 'M',
          color: 'Black',
          stock: 0,
        },
  });

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleFormSubmit = (data: any) => {
    // Get custom categories
    const customCategories = data.customCategories 
      ? data.customCategories.split(',').map((c: string) => c.trim()).filter(Boolean)
      : [];
    
    // Combine all categories
    const allCategories = [...new Set([...selectedCategories, ...customCategories])];
    
    if (allCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }
    
    const productData = {
      name: data.name,
      brand: data.brand,
      gender: data.gender,
      description: data.description,
      price: parseFloat(data.price),
      mrp: parseFloat(data.mrp),
      discount: parseFloat(data.discount) || 0,
      categories: allCategories,
      images: data.images.split('\n').map((img: string) => img.trim()).filter(Boolean),
      variants: [
        {
          size: data.size,
          color: data.color,
          stock: parseInt(data.stock),
          sku: `${data.brand.substring(0, 3).toUpperCase()}-${Date.now()}`,
        },
      ],
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      specs: {},
      tags: allCategories.map((c: string) => c.trim().toLowerCase()),
    };
    onSubmit(productData);
  };

  const CLOTHING_CATEGORIES = [
    'T-Shirts', 'Shirts', 'Jeans', 'Dresses', 'Sweaters', 'Jackets', 
    'Shoes', 'Accessories', 'Shorts', 'Pants', 'Skirts', 'Tops',
    'Hoodies', 'Sweatshirts', 'Blazers', 'Coats', 'Sneakers', 'Boots'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product Name *</label>
            <input {...register('name', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Brand *</label>
            <input {...register('brand', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Gender *</label>
            <select {...register('gender', { required: true })} className="input-field">
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              {...register('description', { required: true })}
              className="input-field"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price (₹) *</label>
              <input type="number" {...register('price', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">MRP (₹) *</label>
              <input type="number" {...register('mrp', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Discount (%)</label>
              <input type="number" {...register('discount')} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Categories *</label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {CLOTHING_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <label key={cat} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryToggle(cat)}
                      className="mr-2"
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Or enter custom categories (comma-separated):</p>
            <input
              {...register('customCategories')}
              placeholder="Custom Category 1, Custom Category 2"
              className="input-field mt-1"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Size *</label>
              <select {...register('size', { required: true })} className="input-field">
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Color *</label>
              <input {...register('color', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stock *</label>
              <input
                type="number"
                {...register('stock', { required: true })}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Image URLs (one per line) *</label>
            <textarea
              {...register('images', { required: true })}
              placeholder="https://example.com/image1.jpg"
              className="input-field"
              rows={3}
            />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
              {isLoading ? 'Saving...' : product ? 'Update' : 'Create'}
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

