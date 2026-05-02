import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllUsers, updateUserRole } from '../../api/userApi';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    getAllUsers()
      .then((res) => setUsers(res.data.data.users))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleToggle = async (u) => {
    const newRole = u.role === 'admin' ? 'member' : 'admin';
    if (!confirm(`Change ${u.name}'s role to ${newRole}?`)) return;
    setUpdatingId(u._id);
    try {
      const res = await updateUserRole(u._id, newRole);
      setUsers((prev) => prev.map((x) => (x._id === u._id ? res.data.data.user : x)));
      toast.success(`${u.name} is now a ${newRole}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">User Management</h1>
          <p className="text-sm text-on-surface-variant mt-1">{users.length} registered users</p>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input
            className="w-64 pl-10 pr-4 h-10 bg-white border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="group" title="No users found" />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="text-left px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Joined</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-container text-white flex items-center justify-center font-bold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{u.name}</p>
                        <p className="text-xs text-on-surface-variant">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-xs">
                    {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors disabled:opacity-50"
                      onClick={() => handleRoleToggle(u)}
                      disabled={updatingId === u._id}
                    >
                      {updatingId === u._id ? <Spinner size="sm" /> : <span className="material-symbols-outlined text-[14px]">swap_horiz</span>}
                      Make {u.role === 'admin' ? 'Member' : 'Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
