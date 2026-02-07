import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses, getCategories, getBatches, updateBatch, deleteBatch, getUsers, getBatch, searchUsers, getRoles } from '../services/api';
import Modal from '../components/Modal';

interface Course {
    id: number | string;
    title: string;
    description: string;
    level?: string;
    image?: string;
    category_id?: number | string;
    provider?: any; // Define properly if structure known, generic for now
}

interface Batch {
    id: number | string;
    batch_name: string;
    start_date?: string;
    end_date?: string;
    schedule_time?: string;
    total_hours?: number;
    course_id?: number | string;
    course_title?: string;
    status?: string;
    members?: BatchMember[];
}

interface User {
    id: number | string;
    full_name: string;
    email: string;
    username?: string;
}

interface Role {
    id: number | string;
    name: string;
}

interface BatchMember {
    user_id: number | string;
    role_id: number | string;
    user_name?: string;
    user_email?: string;
    role_name?: string;
}

interface Category {
    id: number | string;
    name: string;
    count?: number;
}

export default function Courses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [users, setUsers] = useState<User[]>([]); // All users for search generic?
    const [categories, setCategories] = useState<Record<string, Category>>({}); // Map or array? detailed view shows map usage likely, but let's check. 
    // original code: setCategories(acc) where acc is object. { [id]: category }
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('courses'); // courses, batches
    const [viewMode, setViewMode] = useState('grid'); // grid, list
    
    // Edit Batch Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [activeEditTab, setActiveEditTab] = useState('details'); // details, members
    const [editFormData, setEditFormData] = useState<Partial<Batch>>({});
    const [selectedBatchMembers, setSelectedBatchMembers] = useState<BatchMember[]>([]);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    
    // Search/Add Member State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        fetchData();
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            // Mock roles if API fails or not impl
            // const data = await getRoles(); 
             // Using mock for now as getRoles might not be in api.ts export shown previously or I missed it.
             // Actually it was imported: getRoles.
             const data = await getRoles();
             setAvailableRoles(Array.isArray(data) ? data : []);
        } catch (e) {
            console.warn("Failed to fetch roles, using defaults");
             setAvailableRoles([
                { id: 1, name: 'Student' },
                { id: 2, name: 'Teacher' },
                { id: 3, name: 'Admin' }
            ]);
        }
    }

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [coursesData, categoriesData, batchesData] = await Promise.all([
                getCourses(),
                getCategories(),
                getBatches()
            ]);

            setCourses(Array.isArray(coursesData) ? coursesData : []);
            setBatches(Array.isArray(batchesData) ? batchesData : []);
            
            // Process categories to object for easy lookup
            const catsObj: Record<string, Category> = {};
            if (Array.isArray(categoriesData)) {
                categoriesData.forEach((c: any) => {
                    catsObj[c.id] = c;
                });
            }
            setCategories(catsObj);

        } catch (error) {
            console.error("Failed to fetch courses/batches", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditBatch = async (batch: Batch) => {
        setSelectedBatch(batch);
        setEditFormData({
            batch_name: batch.batch_name,
            start_date: batch.start_date ? batch.start_date.split('T')[0] : '',
            end_date: batch.end_date ? batch.end_date.split('T')[0] : '',
            schedule_time: batch.schedule_time,
            total_hours: batch.total_hours
        });
        
        // Fetch members for this batch
        try {
            // Assuming getBatch(id) returns detailed batch with members
             const detailedBatch = await getBatch(batch.id);
             if (detailedBatch && detailedBatch.members) {
                 setSelectedBatchMembers(detailedBatch.members);
             } else {
                 setSelectedBatchMembers([]);
             }
        } catch (e) {
            console.error("Failed to fetch batch members", e);
            setSelectedBatchMembers([]);
        }

        setEditModalOpen(true);
        setActiveEditTab('details');
    };

    const handleDeleteClick = (batch: Batch) => {
        setSelectedBatch(batch);
        setDeleteModalOpen(true);
    };

    const onDeleteBatch = async () => {
        if (!selectedBatch) return;
        setIsActionLoading(true);
        try {
            await deleteBatch(selectedBatch.id);
            setBatches(batches.filter(b => b.id !== selectedBatch.id));
            setDeleteModalOpen(false);
            setSelectedBatch(null);
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete batch");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSaveBatch = async () => {
         if (!selectedBatch) return;
         setIsActionLoading(true);
         try {
             // Save details
             await updateBatch(selectedBatch.id, {
                 ...editFormData,
                 members: selectedBatchMembers // Send members if backend handles it
             });
             
             // Refresh list
             fetchData(); // Simplest way to ensure sync
             setEditModalOpen(false);
         } catch (error) {
             console.error("Update failed", error);
             alert("Failed to update batch");
         } finally {
             setIsActionLoading(false);
         }
    };

    // Member Management
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setShowResults(true);
        try {
            const results = await searchUsers(searchQuery);
            setSearchResults(Array.isArray(results) ? results : []);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    const addMemberFromSearch = (user: User) => {
        if (selectedBatchMembers.some(m => m.user_id === user.id)) {
            alert("User already in batch");
            return;
        }
        const newMember: BatchMember = {
            user_id: user.id,
            role_id: 1, // Default student
            user_name: user.full_name || user.username,
            user_email: user.email
        };
        setSelectedBatchMembers([...selectedBatchMembers, newMember]);
        setShowResults(false);
        setSearchQuery('');
    };

    const removeMember = (index: number) => {
        const newMembers = [...selectedBatchMembers];
        newMembers.splice(index, 1);
        setSelectedBatchMembers(newMembers);
    };

    const handleMemberRoleChange = (index: number, roleId: string | number) => {
         const newMembers = [...selectedBatchMembers];
         newMembers[index].role_id = roleId;
         setSelectedBatchMembers(newMembers);
    };


    return (
        <div className="max-w-7xl mx-auto w-full space-y-6 pt-2">
            
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                     <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Courses & Batches</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your course catalog and scheduled batches.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('courses')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'courses' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                    >
                        Courses
                    </button>
                    <button 
                        onClick={() => setActiveTab('batches')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'batches' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                    >
                        Batches
                    </button>
                </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center justify-between gap-4">
                 <div className="max-w-xs w-full relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input 
                        type="text" 
                        placeholder={activeTab === 'courses' ? "Search courses..." : "Search batches..."}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all dark:text-white"
                    />
                </div>
                <div className="flex gap-2">
                     <Link to={activeTab === 'courses' ? "/create-course" : "/create-class"} 
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span className="text-sm font-semibold">{activeTab === 'courses' ? 'New Course' : 'New Batch'}</span>
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {isLoading ? (
                     <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                        <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                        <p>Loading {activeTab}...</p>
                    </div>
                ) : (
                    <>
                        {/* COURSES TAB */}
                        {activeTab === 'courses' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.map(course => (
                                    <div key={course.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                                        <div className="aspect-video bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                                            {course.image ? (
                                                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <span className="material-symbols-outlined text-4xl">image</span>
                                                </div>
                                            )}
                                             <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                                                {categories[course.category_id as string]?.name || 'General'}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1">{course.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 h-10">{course.description}</p>
                                            
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                                <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                                                    {course.level || 'All Levels'}
                                                </span>
                                                <Link to={`/courses/${course.id}`} className="text-primary text-sm font-semibold hover:underline">
                                                    Manage
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {courses.length === 0 && (
                                    <div className="col-span-full text-center py-20 text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                        No courses found. Create your first course!
                                    </div>
                                )}
                            </div>
                        )}

                        {/* BATCHES TAB */}
                        {activeTab === 'batches' && (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {batches.map(batch => (
                                    <div key={batch.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 hover:border-primary/50 transition-colors relative group">
                                         
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{batch.batch_name}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{batch.course_title || 'Unknown Course'}</p>
                                            </div>
                                            <div className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                                batch.status === 'active' ? 'bg-green-100 text-green-700' : 
                                                batch.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {batch.status || 'Scheduled'}
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                <span className="material-symbols-outlined text-[20px] text-slate-400">calendar_today</span>
                                                <span>{new Date(batch.start_date!).toLocaleDateString()} - {new Date(batch.end_date!).toLocaleDateString()}</span>
                                            </div>
                                             <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                <span className="material-symbols-outlined text-[20px] text-slate-400">schedule</span>
                                                <span>{batch.schedule_time || 'Multi-time'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                {/* Mock avatars */}
                                                <div className="size-8 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">A</div>
                                                <div className="size-8 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">B</div>
                                                <div className="size-8 rounded-full bg-slate-100 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">+5</div>
                                            </div>
                                            
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <button 
                                                    onClick={() => handleEditBatch(batch)}
                                                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit_square</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(batch)}
                                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                 {batches.length === 0 && (
                                    <div className="col-span-full text-center py-20 text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                        No batches scheduled. Create your first batch!
                                    </div>
                                )}
                             </div>
                        )}
                    </>
                )}
            </div>

            {/* Edit Batch Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title={selectedBatch ? `Edit: ${selectedBatch.batch_name}` : 'Edit Batch'}
                footer={
                    <>
                        <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 font-medium">Cancel</button>
                        <button onClick={handleSaveBatch} disabled={isActionLoading} className="px-5 py-2 bg-primary text-white rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-colors font-medium">
                            {isActionLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </>
                }
            >
                <div className="flex flex-col h-[500px]">
                    <div className="border-b border-slate-100 dark:border-slate-700 flex gap-6 mb-4">
                        <button 
                            onClick={() => setActiveEditTab('details')}
                            className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${activeEditTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Batch Details
                        </button>
                         <button 
                            onClick={() => setActiveEditTab('members')}
                            className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${activeEditTab === 'members' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Members ({selectedBatchMembers.length})
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2">
                        {activeEditTab === 'details' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Batch Name</label>
                                    <input 
                                        type="text" 
                                        value={editFormData.batch_name || ''}
                                        onChange={e => setEditFormData({ ...editFormData, batch_name: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                        <input 
                                            type="date" 
                                            value={editFormData.start_date || ''}
                                            onChange={e => setEditFormData({ ...editFormData, start_date: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                        <input 
                                            type="date" 
                                            value={editFormData.end_date || ''}
                                            onChange={e => setEditFormData({ ...editFormData, end_date: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Schedule Time</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. 10:00 AM - 12:00 PM"
                                        value={editFormData.schedule_time || ''}
                                        onChange={e => setEditFormData({ ...editFormData, schedule_time: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Hours</label>
                                    <input 
                                        type="number" 
                                        value={editFormData.total_hours || ''}
                                        onChange={e => setEditFormData({ ...editFormData, total_hours: Number(e.target.value) })}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>
                        )}

                        {activeEditTab === 'members' && (
                            <div className="space-y-4">
                                {/* Add Member Search */}
                                <div className="relative">
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            placeholder="Search user by name/email to add..."
                                            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/50"
                                        />
                                        <button 
                                            onClick={handleSearch}
                                            disabled={isSearching}
                                            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
                                        >
                                            {isSearching ? '...' : 'Add'}
                                        </button>
                                    </div>
                                    {showResults && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-20 max-h-48 overflow-y-auto">
                                            {searchResults.length === 0 ? (
                                                <div className="p-3 text-center text-sm text-slate-500">No users found</div>
                                            ) : (
                                                searchResults.map(user => (
                                                    <button 
                                                        key={user.id} 
                                                        onClick={() => addMemberFromSearch(user)}
                                                        className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
                                                    >
                                                        <div className="font-semibold text-slate-900 dark:text-white">{user.full_name}</div>
                                                        <div className="text-xs text-slate-500">{user.email}</div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Members List */}
                                <div className="space-y-2">
                                    {selectedBatchMembers.map((member, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div className="size-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                {(member.user_name || '?').charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">{member.user_name}</div>
                                                <div className="text-xs text-slate-500 truncate">{member.user_email}</div>
                                            </div>
                                            <select 
                                                value={member.role_id || ''}
                                                onChange={(e) => handleMemberRoleChange(index, e.target.value)}
                                                className="text-xs py-1 px-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-primary/50 cursor-pointer"
                                            >
                                                {availableRoles.map(role => (
                                                    <option key={role.id} value={role.id}>{role.name}</option>
                                                ))}
                                            </select>
                                             <button 
                                                onClick={() => removeMember(index)}
                                                className="size-7 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Remove Member"
                                            >
                                                <span className="material-symbols-outlined text-lg">close</span>
                                            </button>
                                        </div>
                                    ))}
                                    {selectedBatchMembers.length === 0 && (
                                        <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                            No members assigned. Search to add members.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirm Delete"
                footer={
                    <>
                        <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 font-medium">Cancel</button>
                        <button onClick={onDeleteBatch} disabled={isActionLoading} className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-70 transition-colors font-medium">
                            {isActionLoading ? 'Deleting...' : 'Delete Batch'}
                        </button>
                    </>
                }
            >
                <div className="py-2">
                    <p className="text-slate-600 dark:text-slate-300">
                        Are you sure you want to delete the batch <span className="font-bold text-slate-900 dark:text-white">"{selectedBatch?.batch_name}"</span>? 
                        This action cannot be undone.
                    </p>
                </div>
            </Modal>
        </div>
    );

}
