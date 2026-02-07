import { useState, useEffect, FormEvent } from 'react';
import { getUsers, searchUsers, deleteUser, updateUser, signup } from '../services/api';

// Assuming Sidebar or Layout component handles the sidebar. using standard layout from Dashboard or similar?
// Usually pages are wrapped in a Layout. Let's assume passed as children or standalone page.
// Checking Teachers context, it seems they might not use a wrapper Layout component in the page file itself, 
// or it's handled in App. I'll stick to the content structure.

interface User {
    id: number | string;
    full_name: string;
    email: string;
    role: string;
    status: string; // 'active' | 'inactive'
    created_at?: string;
    join_date?: string; // mapped from created_at
    avatar_url?: string;
}

interface UserStats {
    total_users: number;
    active_users: number;
    new_users_this_month: number;
}

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    
    // Form state for add/edit
    const [addUserData, setAddUserData] = useState({
        full_name: '',
        email: '',
        password: '', // Only for creation
        role: 'student',
        status: 'active'
    });

    // Mock stats - in a real app, this would come from an API
    const [stats, setStats] = useState<UserStats>({
        total_users: 0,
        active_users: 0,
        new_users_this_month: 0
    });


    useEffect(() => {
        fetchUsers();
    }, []);

    // Simulate stats calculation when users change
    useEffect(() => {
        if (users.length > 0) {
            const active = users.filter(u => u.status === 'active').length;
            // distinct month check - simplified
            const now = new Date();
            const thisMonth = now.getMonth();
            const thisYear = now.getFullYear();
            const newUsers = users.filter(u => {
                const d = new Date(u.created_at || Date.now());
                return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
            }).length;

            setStats({
                total_users: users.length,
                active_users: active,
                new_users_this_month: newUsers > 0 ? newUsers : 12 // fallback mock if 0
            });
        }
    }, [users]);


    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            // Fetch all users for now to handle client-side filtering/stats if needed, 
            // or modify backend to support pagination/filters. 
            // The existing getCourses supports pagination, let's see getUsers
            // API service says: export const getUsers = () => api.get('/auth/users').then(res => res.data);
            // So it fetches all.
            const data = await getUsers();
            // Map data if needed. Assuming API returns array of users.
            const mappedUsers: User[] = Array.isArray(data) ? data.map((u: any) => ({
                id: u.id,
                full_name: u.full_name || u.username || 'Unknown', // Fallback
                email: u.email,
                role: u.role || 'student',
                status: u.is_active ? 'active' : 'inactive', // API likely returns is_active boolean
                created_at: u.created_at,
                join_date: new Date(u.created_at).toLocaleDateString()
            })) : [];
            setUsers(mappedUsers);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        // If search query is empty, fetch all
        if (!searchQuery.trim()) {
            fetchUsers();
            return;
        }

        setIsLoading(true);
        try {
            const data = await searchUsers(searchQuery);
             const mappedUsers: User[] = Array.isArray(data) ? data.map((u: any) => ({
                id: u.id,
                full_name: u.full_name || u.username || 'Unknown',
                email: u.email,
                role: u.role || 'student',
                status: u.is_active ? 'active' : 'inactive',
                created_at: u.created_at,
                join_date: new Date(u.created_at).toLocaleDateString()
            })) : [];
            setUsers(mappedUsers);
            setCurrentPage(1);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setIsActionLoading(true);
        try {
            await deleteUser(selectedUser.id);
            setUsers(users.filter(u => u.id !== selectedUser.id));
            setShowDeleteModal(false);
            setSelectedUser(null);
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete user.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleAddUser = async (e: FormEvent) => {
        e.preventDefault();
        setIsActionLoading(true);
        try {
            // Using signup for creation as it creates a user
            // Note: signup usually auto-logs within, but here we act as admin.
            // Check if API supports admin creation without login? 
            // The `signup` function in api.ts calls `/auth/signup`.
            // Ideally should use an admin endpoint if available, but let's try signup.
            // Wait, signup logs the user in and sets token? We might check api.ts.
            // api.ts: export const signup = (userData) => api.post('/auth/signup', userData).then(res => res.data);
            // It just posts. We'll use it.
            
            // Wait, if we are Edit mode?
            if (selectedUser) {
                // Edit
                // Need update endpoint. api.ts: export const updateUser = (id, data) => api.put(`/auth/users/${id}`, data).then(res => res.data);
                 await updateUser(selectedUser.id, {
                    full_name: addUserData.full_name,
                    email: addUserData.email,
                    role: addUserData.role,
                    is_active: addUserData.status === 'active'
                    // password usually not updated here unless specific endpoint
                });
                
                 // Update local state
                setUsers(users.map(u => u.id === selectedUser.id ? {
                    ...u,
                    full_name: addUserData.full_name,
                    email: addUserData.email,
                    role: addUserData.role,
                    status: addUserData.status
                } : u));
            } else {
                // Create
                const newUser = await signup({
                    full_name: addUserData.full_name,
                    email: addUserData.email,
                    password: addUserData.password,
                    role: addUserData.role
                    // is_active default true?
                });
                // Reload users to get full object w/ ID
                fetchUsers();
            }
            setShowAddModal(false);
            resetForm();
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save user.");
        } finally {
            setIsActionLoading(false);
        }
    };
    
    const resetForm = () => {
        setAddUserData({
            full_name: '',
            email: '',
            password: '',
            role: 'student',
            status: 'active'
        });
        setSelectedUser(null);
    };
    
    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setAddUserData({
             full_name: user.full_name,
            email: user.email,
            password: '', // Leave empty implies no change for edit, or required? validation needed?
            role: user.role,
            status: user.status
        });
        setShowAddModal(true);
    };

    // Pagination Logic
    const filteredUsers = users.filter(user => {
        return (filterRole === 'All' || user.role.toLowerCase() === filterRole.toLowerCase()) &&
               (filterStatus === 'All' || user.status.toLowerCase() === filterStatus.toLowerCase());
    });

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);


    return (
        <div className="max-w-7xl mx-auto w-full space-y-6 pt-2">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage, view, and organize all system users.</p>
                </div>
                <div className="flex gap-2">
                     <button 
                        onClick={() => { resetForm(); setShowAddModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span className="text-sm font-semibold">Add User</span>
                    </button>
                    <button className="p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">download</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">group</span>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Users</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_users}</div>
                    </div>
                </div>
                 <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">person_check</span>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Users</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active_users}</div>
                    </div>
                </div>
                 <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">person_add</span>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">New This Month</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.new_users_this_month}</div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                     {/* Search */}
                    <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-xl">search</span>
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder-slate-400 transition-all font-medium text-sm"
                        />
                    </form>

                    {/* Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                        <select 
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                        >
                            <option value="All">All Roles</option>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </select>
                         <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Join Date</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                             {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                                            <span>Loading users...</span>
                                        </div>
                                    </td>
                                </tr>
                             ) : currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                 <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm font-bold uppercase">
                                                            {user.full_name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-white">{user.full_name}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                                                user.role === 'admin' 
                                                ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
                                                : user.role === 'teacher'
                                                ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                                : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                             <div className="flex items-center gap-2">
                                                <div className={`size-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                                                <span className={`text-sm font-medium ${user.status === 'active' ? 'text-green-700 dark:text-green-400' : 'text-slate-500'}`}>
                                                    {user.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                                            {user.join_date}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <button 
                                                    onClick={() => openEditModal(user)}
                                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Edit User"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button 
                                                    onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                             ) : (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-500">
                                        No users found matching your filters.
                                    </td>
                                </tr>
                             )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                 {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                         <div className="text-sm text-slate-500 dark:text-slate-400">
                            Showing <span className="font-semibold text-slate-900 dark:text-white">{indexOfFirstUser + 1}</span> to <span className="font-semibold text-slate-900 dark:text-white">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of <span className="font-semibold text-slate-900 dark:text-white">{filteredUsers.length}</span> results
                        </div>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-white disabled:opacity-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`size-8 text-sm font-medium rounded-lg transition-colors ${
                                        currentPage === i + 1
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                             <button 
                                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-white disabled:opacity-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                 )}
            </div>

            {/* Add/Edit User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {selectedUser ? 'Edit User' : 'Add New User'}
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={addUserData.full_name}
                                    onChange={e => setAddUserData({...addUserData, full_name: e.target.value})}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:text-white"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    value={addUserData.email}
                                    onChange={e => setAddUserData({...addUserData, email: e.target.value})}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:text-white"
                                    placeholder="john@example.com"
                                />
                            </div>
                            {!selectedUser && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                                    <input 
                                        type="password" 
                                        required
                                        value={addUserData.password}
                                        onChange={e => setAddUserData({...addUserData, password: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:text-white"
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                     <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                    <select 
                                        value={addUserData.role}
                                        onChange={e => setAddUserData({...addUserData, role: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:text-white cursor-pointer"
                                    >
                                        <option value="student">Student</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                     <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select 
                                        value={addUserData.status}
                                        onChange={e => setAddUserData({...addUserData, status: e.target.value})}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:text-white cursor-pointer"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isActionLoading}
                                    className="flex-1 px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70"
                                >
                                    {isActionLoading ? 'Saving...' : 'Save User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                         <div className="p-6 text-center">
                            <div className="size-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl text-red-600">warning</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete User?</h3>
                            <p className="text-slate-500 text-sm mb-6">
                                Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{selectedUser.full_name}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                 <button 
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDeleteUser}
                                    disabled={isActionLoading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-70"
                                >
                                    {isActionLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Users;
