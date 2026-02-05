import React, { useState, useEffect } from 'react';
import { getUsers, searchUsers, deleteUser, signup, API_BASE_URL } from '../services/api';
// Assuming Sidebar or Layout component handles the sidebar. using standard layout from Dashboard or similar?
// Usually pages are wrapped in a Layout. Let's assume passed as children or standalone page.
// Checking Teachers.jsx context, it seems they might not use a wrapper Layout component in the page file itself, 
// or it's handled in App.jsx. I'll stick to the content structure.

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ total: 0, new: 0, pending: 0 });

    // Add User State
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [addUserData, setAddUserData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'student' // Default to student
    });
    const [creatingUser, setCreatingUser] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers(0, 100);
            setUsers(data);
            setStats({
                total: data.length,
                new: data.filter(u => new Date(u.created_at) > new Date(Date.now() - 86400000)).length, // Mock new
                pending: 0 // Mock pending
            });
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value.length > 2) {
            try {
                const data = await searchUsers(e.target.value);
                setUsers(data);
            } catch (err) { console.error(err); }
        } else if (e.target.value.length === 0) {
            fetchUsers();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(id);
                fetchUsers();
            } catch (error) {
                console.error("Failed to delete user", error);
            }
        }
    };

    const handleAddUserSubmit = async (e) => {
        e.preventDefault();
        setCreatingUser(true);
        try {
            await signup(addUserData);
            await fetchUsers();
            setIsAddUserModalOpen(false);
            setAddUserData({
                full_name: '',
                email: '',
                password: '',
                phone: '',
                role: 'student'
            });
            alert("User added successfully!");
        } catch (error) {
            console.error("Failed to add user:", error);
            alert("Failed to add user: " + (error.message || "Unknown error"));
        } finally {
            setCreatingUser(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background-light">
            {/* Header */}
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    {/* Mobile menu button omitted for now as it usually requires context/layout prop */}
                    <nav className="flex items-center text-sm">
                        <a className="text-gray-400 hover:text-gray-600 transition-colors" href="#">Admin</a>
                        <span className="material-symbols-outlined text-base text-gray-300 mx-2">chevron_right</span>
                        <h1 className="text-base font-bold text-gray-900">User Management</h1>
                    </nav>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="pl-10 pr-4 py-2 w-72 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20 focus:bg-white transition-all placeholder-gray-400"
                            placeholder="Search users..."
                            type="text"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 scroll-smooth bg-background-light">
                <div className="max-w-[1400px] mx-auto space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[16px] shadow-card border border-gray-50 hover:shadow-card-hover transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-50 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-2xl">groups</span>
                                </div>
                                <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                                    +12%
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</h3>
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                        </div>
                        {/* More stats cards... similar to HTML but adaptable */}
                        <div className="bg-white p-6 rounded-[16px] shadow-card border border-gray-50 hover:shadow-card-hover transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-2xl">person_add</span>
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.new}</h3>
                            <p className="text-sm font-medium text-gray-500">New Users (24h)</p>
                        </div>
                        <div className="bg-white p-6 rounded-[16px] shadow-card border border-gray-50 hover:shadow-card-hover transition-shadow group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-2xl">pending_actions</span>
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.pending}</h3>
                            <p className="text-sm font-medium text-gray-500">Pending Actions</p>
                        </div>
                    </div>

                    {/* Active User Directory */}
                    <div className="bg-white rounded-[16px] shadow-deep-purple border border-gray-50 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">User Directory</h3>
                                <p className="text-sm text-gray-500 mt-1">Manage all system users</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsAddUserModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-xl text-sm font-bold text-white transition-colors shadow-lg shadow-primary/20"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Add User
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-sm">
                                                        {user.full_name?.charAt(0) || user.email?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{user.full_name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded capitalize">{user.role}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
    ${user.status ? 'bg-green-50 text-green-700 border border-green-100'
                                                            : 'bg-red-50 text-red-700 border border-red-100'}`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full mr-1.5 
      ${user.status ? 'bg-green-500' : 'bg-red-500'}`}
                                                    ></span>
                                                    {user.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-xl text-[#120f1a]">Add New User</h3>
                            <button
                                onClick={() => setIsAddUserModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 rounded-full p-2 hover:bg-slate-100 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={addUserData.full_name}
                                    onChange={(e) => setAddUserData({ ...addUserData, full_name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={addUserData.email}
                                    onChange={(e) => setAddUserData({ ...addUserData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    placeholder="e.g. john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">Phone Number (Optional)</label>
                                <input
                                    type="tel"
                                    value={addUserData.phone}
                                    onChange={(e) => setAddUserData({ ...addUserData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    placeholder="e.g. +1 234 567 890"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">Role</label>
                                <select
                                    value={addUserData.role}
                                    onChange={(e) => setAddUserData({ ...addUserData, role: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={addUserData.password}
                                    onChange={(e) => setAddUserData({ ...addUserData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                    placeholder="••••••••"
                                    minLength={8}
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={creatingUser}
                                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                                >
                                    {creatingUser ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">person_add</span>
                                            Create User
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
