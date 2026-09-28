import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { userService } from '../../api/userService';
import { Users, Shield, User, Star, Trash2, Edit2, Loader2, AlertCircle, CheckCircle, Search } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers();
      setUsers(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setIsUpdating(true);
      await userService.updateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setEditingUserId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete this user?')) return;
    try {
      setIsUpdating(true);
      await userService.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return <span className="px-3 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-max"><Star className="w-3 h-3" /> Admin</span>;
      case 'police': return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-max"><Shield className="w-3 h-3" /> Officer</span>;
      default: return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-max"><User className="w-3 h-3" /> Citizen</span>;
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative flex justify-center items-center">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full h-16 w-16 animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin relative z-10" />
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
        
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-indigo-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-bold tracking-widest uppercase text-xs">Access Control Matrix</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">User Management</h1>
              <p className="text-indigo-200 text-lg max-w-xl font-medium">Control system access levels, assign officer clearances, and manage personnel records.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <Users className="w-8 h-8 text-indigo-300" />
              <div>
                <p className="text-sm font-medium text-indigo-300">Total Registered Users</p>
                <p className="text-2xl font-black text-white">{users.length}</p>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 p-6 rounded-3xl flex items-center gap-4 text-red-500">
            <AlertCircle className="w-8 h-8 shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        ) : (
          <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-2xl rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
            
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white/30 dark:bg-gray-900/30 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Personnel Directory</h2>
              
              <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-950/50 text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 tracking-widest border-b border-gray-100 dark:border-gray-800">
                    <th className="p-4 pl-6">User Profile</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Access Level</th>
                    <th className="p-4">Join Date</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/[0.02]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">No users found matching your query.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="p-4 pl-6 align-middle">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 shrink-0">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{user.name}</p>
                              <p className="text-xs font-mono text-gray-500">{user._id.substring(user._id.length - 6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{user.email}</p>
                        </td>
                        <td className="p-4 align-middle">
                          {editingUserId === user._id ? (
                            <select
                              defaultValue={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              disabled={isUpdating}
                              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm rounded-lg px-2 py-1 outline-none"
                            >
                              <option value="public">Citizen</option>
                              <option value="police">Officer</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            getRoleBadge(user.role)
                          )}
                        </td>
                        <td className="p-4 align-middle">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4 pr-6 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            {editingUserId === user._id ? (
                              <button 
                                onClick={() => setEditingUserId(null)}
                                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            ) : (
                              <button 
                                onClick={() => setEditingUserId(user._id)}
                                disabled={isUpdating}
                                className="p-2 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                                title="Edit Role"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={isUpdating}
                              className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
