import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';

export default function AdminUsers() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery('admin-users', async () => {
    const response = await api.get('/admin/users');
    return response.data.data;
  });

  const updateStatusMutation = useMutation(
    ({ id, isActive }: any) => api.put(`/admin/users/${id}/status`, { isActive }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        toast.success('User status updated!');
      },
    }
  );

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">User Management</h1>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Phone</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.users?.map((u: any) => (
                  <tr key={u._id} className="border-b">
                    <td className="p-4">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">{u.phone}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-ak-accent rounded text-sm">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          updateStatusMutation.mutate({
                            id: u._id,
                            isActive: !u.isActive,
                          });
                        }}
                        className={`${
                          u.isActive ? 'text-red-500' : 'text-green-500'
                        } font-semibold`}
                      >
                        {u.isActive ? 'Block' : 'Unblock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

