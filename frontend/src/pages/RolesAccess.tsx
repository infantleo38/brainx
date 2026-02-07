import React, { useState, useEffect } from 'react';

import { getRoles, createRole, updateRole, deleteRole, updateRolePermissions } from '../services/api';

interface Permission {
    module: string;
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
    [key: string]: any; // Allow for other potential fields
}

interface Role {
    id: number | string;
    name: string;
    description?: string;
    user_count?: number;
    permissions?: Permission[];
    [key: string]: any;
}

export default function RolesAccess() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState<{ name: string; description: string }>({ name: '', description: '' });
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);

    // Modules list
    const modules = ['Dashboard', 'Courses', 'Reports', 'Messages', 'Student Records', 'User Management', 'Global Settings'];

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const data = await getRoles();
            // userCount is now returned by the API
            setRoles(Array.isArray(data) ? data : []);
            if (Array.isArray(data) && data.length > 0 && !selectedRole) {
                const firstRole = data[0];
                setSelectedRole(firstRole);
                initializePermissions(firstRole);
            }
            setError(null);
        } catch (err) {
            setError('Failed to load roles. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRole = () => {
        setEditingId(null);
        setCurrentRole({ name: '', description: '' });
        setIsModalOpen(true);
    };

    const handleEditRole = (role: Role, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the role when clicking edit
        setEditingId(role.id);
        setCurrentRole({ name: role.name, description: role.description || '' });
        setIsModalOpen(true);
    };

    const handleDeleteRole = async (id: number | string, e: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this role?')) {
            try {
                await deleteRole(id);
                const newRoles = roles.filter(role => role.id !== id);
                setRoles(newRoles);
                // If deleted role was selected, select the first one or null
                if (selectedRole && selectedRole.id === id) {
                    setSelectedRole(newRoles.length > 0 ? newRoles[0] : null);
                }
            } catch (err: any) {
                alert('Failed to delete role: ' + (err.message || 'Unknown error'));
            }
        }
    };

    const handleSaveRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                const updated = await updateRole(editingId, currentRole);
                const updatedRoles = roles.map(role => role.id === editingId ? { ...updated, user_count: role.user_count, permissions: role.permissions } : role);
                setRoles(updatedRoles);
                if (selectedRole && selectedRole.id === editingId) {
                    setSelectedRole({ ...updated, user_count: selectedRole.user_count, permissions: selectedRole.permissions });
                }
            } else {
                const newRole = await createRole(currentRole);
                const newRoles = [...roles, { ...newRole, user_count: 0, permissions: [] }];
                setRoles(newRoles);
                setSelectedRole({ ...newRole, user_count: 0, permissions: [] });
                initializePermissions({ ...newRole, permissions: [] });
            }
            setIsModalOpen(false);
        } catch (err: any) {
            alert('Failed to save role: ' + (err.message || 'Unknown error'));
        }
    };

    const initializePermissions = (role: Role) => {
        if (!role) return;
        const rolePerms = role.permissions || [];
        const initialPerms = modules.map(module => {
            const existing = rolePerms.find(p => p.module === module);
            return existing ? { ...existing } : {
                module,
                can_view: false,
                can_create: false,
                can_edit: false,
                can_delete: false
            };
        });
        setPermissions(initialPerms);
    };

    const handlePermissionChange = (module: string, field: string) => {
        setPermissions(prev => prev.map(p => {
            if (p.module === module) {
                if (field === 'can_edit_create') {
                    const newValue = !p.can_edit; // Toggle based on can_edit state
                    return { ...p, can_edit: newValue, can_create: newValue };
                }
                return { ...p, [field]: !p[field] };
            }
            return p;
        }));
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) return;
        try {
            const token = localStorage.getItem('access_token');
            // Filter only true values or send all? Schema sends all.
            // Map permissions to schema format if needed, but state matches
            const updatedRole = await updateRolePermissions(selectedRole.id, permissions, token);

            // Update local state
            const updatedRoles = roles.map(r => r.id === selectedRole.id ? updatedRole : r);
            setRoles(updatedRoles);
            setSelectedRole(updatedRole);

            // Re-initialize permissions from the response to be sure
            initializePermissions(updatedRole);
            alert("Permissions saved successfully");
        } catch (err: any) {
            alert("Failed to save permissions: " + (err.message || 'Unknown error'));
        }
    };


    // Helper to get icon based on role name (optional, matching HTML example vibe)
    const getRoleIcon = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('admin')) return 'admin_panel_settings';
        if (lowerName.includes('teacher')) return 'school'; // supervisor_account for senior?
        if (lowerName.includes('student')) return 'backpack';
        if (lowerName.includes('parent')) return 'family_restroom';
        return 'badge'; // Default
    };

    const getRoleColorClass = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('admin')) return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
        if (lowerName.includes('student')) return 'bg-primary text-white';
        // HTML examples had different colors, trying to match somewhat or generic
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark h-full overflow-hidden">
            <div className="bg-white dark:bg-[#15202b] border-b border-slate-200 dark:border-slate-800 pt-6 px-6 md:px-8 pb-6 shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Role Management</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Administration • Access Control</p>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={handleAddRole}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-primary/30"
                        >
                            <span className="material-symbols-outlined text-xl">add</span>
                            Create New Role
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 md:px-8">
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                        {error}
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                    <div className="flex flex-col lg:flex-row gap-6 h-full">
                        {/* Left Column: Roles List */}
                        <div className="lg:w-1/3 flex flex-col gap-4">
                            <div className="bg-white dark:bg-[#15202b] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full max-h-[calc(100vh-200px)]">
                                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                    <h2 className="font-bold text-slate-900 dark:text-white">Existing Roles</h2>
                                    <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">
                                        {roles.length} Roles
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {loading ? (
                                        <div className="p-4 text-center text-slate-500">Loading...</div>
                                    ) : roles.map((role) => (
                                        <button
                                            key={role.id}
                                            onClick={() => {
                                                setSelectedRole(role);
                                                initializePermissions(role);
                                            }}
                                            className={`w-full text-left p-3 rounded-lg flex items-center justify-between group transition-colors ${selectedRole?.id === role.id
                                                ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`size-10 rounded-full flex items-center justify-center ${selectedRole?.id === role.id
                                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                    }`}>
                                                    <span className="material-symbols-outlined text-[20px]">{getRoleIcon(role.name)}</span>
                                                </div>
                                                <div>
                                                    <h3 className={`font-semibold text-sm ${selectedRole?.id === role.id
                                                        ? 'text-primary dark:text-white'
                                                        : 'text-slate-900 dark:text-white'
                                                        }`}>
                                                        {role.name}
                                                    </h3>
                                                    <p className={`text-xs ${selectedRole?.id === role.id
                                                        ? 'text-primary/70 dark:text-blue-300'
                                                        : 'text-slate-500 dark:text-slate-400'
                                                        }`}>
                                                        {role.user_count || 0} Users
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedRole?.id === role.id ? (
                                                <div className="flex items-center gap-1">
                                                    <span
                                                        onClick={(e) => handleEditRole(role, e)}
                                                        className="material-symbols-outlined text-primary hover:scale-110 transition-transform cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        edit_square
                                                    </span>
                                                    {/* Optional Delete Icon if needed here */}
                                                    <span
                                                        onClick={(e) => handleDeleteRole(role.id, e)}
                                                        className="material-symbols-outlined text-red-400 hover:text-red-500 hover:scale-110 transition-transform cursor-pointer ml-1"
                                                        title="Delete"
                                                    >
                                                        delete
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">chevron_right</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Permissions/Details */}
                        <div className="lg:w-2/3 flex flex-col">
                            {selectedRole ? (
                                <div className="bg-white dark:bg-[#15202b] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col  max-h-[calc(100vh-200px)]">
                                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                <span className="material-symbols-outlined text-2xl">lock_person</span>
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    Permissions: {selectedRole.name}
                                                </h2>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {selectedRole.description || 'Manage access levels for this role.'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => alert("Reset functionality not implemented yet")}
                                            className="text-sm text-primary hover:underline font-medium"
                                        >
                                            Reset to Default
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 w-1/3">Module / Screen</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 text-center">View</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 text-center">Edit / Create</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 text-center">Delete</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {permissions.map((perm, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="material-symbols-outlined text-slate-400">
                                                                    {perm.module === 'Dashboard' ? 'dashboard' :
                                                                        perm.module === 'Courses' ? 'book_2' :
                                                                            perm.module === 'Reports' ? 'bar_chart' :
                                                                                perm.module === 'Messages' ? 'chat_bubble' :
                                                                                    perm.module === 'Student Records' ? 'group' :
                                                                                        perm.module === 'User Management' ? 'manage_accounts' : 'settings'}
                                                                </span>
                                                                <span className="font-medium text-slate-900 dark:text-white">{perm.module}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <input
                                                                checked={perm.can_view}
                                                                onChange={() => handlePermissionChange(perm.module, 'can_view')}
                                                                className="rounded border-slate-300 text-primary focus:ring-primary size-5 cursor-pointer" type="checkbox"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <input
                                                                checked={perm.can_edit}
                                                                onChange={() => handlePermissionChange(perm.module, 'can_edit_create')}
                                                                className="rounded border-slate-300 text-primary focus:ring-primary size-5 cursor-pointer" type="checkbox"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <input
                                                                checked={perm.can_delete}
                                                                onChange={() => handlePermissionChange(perm.module, 'can_delete')}
                                                                className="rounded border-slate-300 text-primary focus:ring-primary size-5 cursor-pointer" type="checkbox"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-[#15202b]/50 rounded-b-xl">
                                        <button className="px-5 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors font-medium text-sm">Cancel</button>
                                        <button
                                            onClick={handleSavePermissions}
                                            className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 font-medium text-sm flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-lg">save</span>
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-[#15202b] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col items-center justify-center p-8 text-center">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-4">
                                        <span className="material-symbols-outlined text-4xl text-slate-400">touch_app</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Select a Role</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                                        Select a role from the list on the left to view and edit its permissions.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for Add/Edit Role */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#15202b] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {editingId ? 'Edit Role' : 'Add New Role'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveRole} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Role Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={currentRole.name}
                                    onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="e.g. Moderator"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={currentRole.description}
                                    onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="Brief description of the role access..."
                                ></textarea>
                            </div>
                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-600 rounded-lg shadow-sm transition-colors"
                                >
                                    {editingId ? 'Save Changes' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
