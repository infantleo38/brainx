import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCurrentUser, uploadProfileImage, updateUserProfile } from '../services/api';

export default function Sidebar({ active }) {
    const location = useLocation();
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
                setPermissions(userData.permissions || []);
            } catch (error) {
                console.error("Failed to fetch current user", error);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // 1. Upload image
            const publicUrl = await uploadProfileImage(file);

            // 2. Update user profile with new image URL
            const updatedUser = await updateUserProfile({ profile_image: publicUrl });

            // 3. Update local state
            setUser(updatedUser);
        } catch (error) {
            console.error("Failed to upload image", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const hasPermission = (moduleName) => {
        const perm = permissions.find(p => p.module === moduleName);
        return perm ? perm.can_view : false;
    };

    // Generic nav items (for Admin/Teacher/etc)
    const genericNavItems = [
        { key: 'chat', label: 'Chat', icon: 'chat_bubble', link: '/chat', iconClass: 'fill-1', module: 'Messages' },
        { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', link: '/dashboard', iconClass: 'fill-1', module: 'Dashboard' },
        { key: 'reports', label: 'Reports', icon: 'group', link: '#', module: 'Reports' },
        { key: 'parents', label: 'Parents', icon: 'face_3', link: '/parents', module: 'Student Records' },
        { key: 'teachers', label: 'Teachers', icon: 'work', link: '/teachers', module: 'User Management' },
        { key: 'courses', label: 'Courses', icon: 'book_2', link: '/courses', module: 'Courses' },
        { key: 'assessment', label: 'Assessment', icon: 'assignment', link: '/assessment' },
        { key: 'management', label: 'User Management', icon: 'manage_accounts', link: '/users', module: 'User Management' },
        { key: 'roles', label: 'Roles & Access', icon: 'verified_user', link: '/roles', module: 'Global Settings' }
    ];

    const visibleGenericNavItems = genericNavItems.filter(item => {
        // Hide generic dashboard for teachers/instructors as they have their own specific dashboard link
        if (item.key === 'dashboard' && (user?.role === 'teacher' || user?.role === 'instructor')) {
            return false;
        }
        if (!item.module) return true;
        return hasPermission(item.module);
    });

    const isStudent = user?.role === 'student' || (typeof user?.role === 'string' && user?.role?.toLowerCase() === 'student');

    // Unified Sidebar Render
    return (
        <aside className="w-64 h-full bg-white border-r border-gray-100 flex flex-col flex-shrink-0 z-30">
            {/* Branding */}
            <div className="h-16 flex items-center px-6 border-b border-gray-50">
                <div className="flex items-center gap-2 text-primary">
                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-white text-[20px]">school</span>
                    </div>
                    <h2 className="text-[#120f1a] text-lg font-bold tracking-tight">Premier LMS</h2>
                </div>
            </div>

            {/* Profile Section (Common for all) */}
            <div className="p-6 pb-2 border-b border-gray-50">
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-3 group cursor-pointer" onClick={handleImageClick}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <div className={`w-20 h-20 rounded-full p-1 border-2 border-primary/20 transition-opacity ${isUploading ? 'opacity-50' : ''}`}>
                            <img
                                alt="User Avatar"
                                className="w-full h-full rounded-full object-cover"
                                src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=random`}
                            />
                        </div>

                        {/* Loading Spinner */}
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}

                        {/* Edit Overlay */}
                        <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">edit</span>
                        </div>

                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{user?.full_name || 'Loading...'}</h3>
                    <span className="text-xs font-semibold text-primary bg-primary-light px-3 py-1 rounded-full mt-1 capitalize">{user?.role || 'User'}</span>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {/* Student specific links */}
                {isStudent && (
                    <>
                        <Link to="/student/dashboard" className={`sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all group ${isActive('/student/dashboard') ? 'bg-primary-light text-primary border-r-[3px] border-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}>
                            <span className={`material-symbols-outlined text-xl transition-colors ${isActive('/student/dashboard') ? 'text-primary font-variation-settings-fill' : 'text-gray-500 group-hover:text-primary'}`} style={isActive('/student/dashboard') ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
                            Dashboard
                        </Link>
                        <Link to="/student/my-courses" className={`sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all group ${isActive('/student/my-courses') ? 'bg-primary-light text-primary border-r-[3px] border-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}>
                            <span className={`material-symbols-outlined text-xl transition-colors ${isActive('/student/my-courses') ? 'text-primary font-variation-settings-fill' : 'text-gray-500 group-hover:text-primary'}`} style={isActive('/student/my-courses') ? { fontVariationSettings: "'FILL' 1" } : {}}>library_books</span>
                            My Courses
                        </Link>
                        <Link to="/student/assignments" className={`sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all group ${isActive('/student/assignments') ? 'bg-primary-light text-primary border-r-[3px] border-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}>
                            <span className={`material-symbols-outlined text-xl transition-colors ${isActive('/student/assignments') ? 'text-primary font-variation-settings-fill' : 'text-gray-500 group-hover:text-primary'}`} style={isActive('/student/assignments') ? { fontVariationSettings: "'FILL' 1" } : {}}>assignment</span>
                            Assignments
                        </Link>
                        <Link to="/student/attendance" className={`sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all group ${isActive('/student/attendance') ? 'bg-primary-light text-primary border-r-[3px] border-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}>
                            <span className={`material-symbols-outlined text-xl transition-colors ${isActive('/student/attendance') ? 'text-primary font-variation-settings-fill' : 'text-gray-500 group-hover:text-primary'}`} style={isActive('/student/attendance') ? { fontVariationSettings: "'FILL' 1" } : {}}>check_circle</span>
                            Attendance
                        </Link>
                        <Link to="#" className="sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 rounded-xl transition-all hover:bg-gray-50 hover:text-primary group">
                            <span className="material-symbols-outlined text-xl text-gray-500 group-hover:text-primary transition-colors">bar_chart</span>
                            Grades
                        </Link>
                        <Link to="#" className="sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 rounded-xl transition-all hover:bg-gray-50 hover:text-primary group">
                            <span className="material-symbols-outlined text-xl text-gray-500 group-hover:text-primary transition-colors">calendar_month</span>
                            Schedule
                        </Link>
                        <Link to="/chat" className={`sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all group ${isActive('/chat') ? 'bg-primary-light text-primary border-r-[3px] border-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}>
                            <div className="relative">
                                <span className={`material-symbols-outlined text-xl transition-colors ${isActive('/chat') ? 'text-primary font-variation-settings-fill' : 'text-gray-500 group-hover:text-primary'}`} style={isActive('/chat') ? { fontVariationSettings: "'FILL' 1" } : {}}>chat</span>
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </div>
                            Messages
                        </Link>
                        <Link to="#" className="sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 rounded-xl transition-all hover:bg-gray-50 hover:text-primary group">
                            <span className="material-symbols-outlined text-xl text-gray-500 group-hover:text-primary transition-colors">folder_open</span>
                            Resources
                        </Link>
                    </>
                )}

                {/* Teacher specific links */}
                {(user?.role === 'teacher' || user?.role === 'instructor') && (
                    <>
                        <Link to="/teacher/dashboard" className={`sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all group ${isActive('/teacher/dashboard') ? 'bg-primary-light text-primary border-r-[3px] border-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}>
                            <span className={`material-symbols-outlined text-xl transition-colors ${isActive('/teacher/dashboard') ? 'text-primary font-variation-settings-fill' : 'text-gray-500 group-hover:text-primary'}`} style={isActive('/teacher/dashboard') ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
                            Instructor Dashboard
                        </Link>
                        <Link to="/teacher/classes" className={`sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all group ${isActive('/teacher/classes') ? 'bg-primary-light text-primary border-r-[3px] border-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}>
                            <span className={`material-symbols-outlined text-xl transition-colors ${isActive('/teacher/classes') ? 'text-primary font-variation-settings-fill' : 'text-gray-500 group-hover:text-primary'}`} style={isActive('/teacher/classes') ? { fontVariationSettings: "'FILL' 1" } : {}}>class</span>
                            My Classes
                        </Link>
                    </>
                )}

                {/* Other Roles (Admin, Teacher, etc.) */}
                {!isStudent && visibleGenericNavItems.map(item => {
                    // Check logic for 'active' state for generic items
                    // We check if current path matches item.link
                    const isItemActive = isActive(item.link) || active === item.key;

                    return (
                        <Link
                            key={item.key}
                            to={item.link}
                            className={`sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all group ${isItemActive ? 'bg-primary-light text-primary border-r-[3px] border-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
                        >
                            <span className={`material-symbols-outlined text-xl transition-colors ${isItemActive ? 'text-primary font-variation-settings-fill' : 'text-gray-500 group-hover:text-primary'}`} style={isItemActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Section */}
            <div className="p-3 mt-auto border-t border-gray-50">
                <button onClick={handleLogout} className="w-full sidebar-item flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 rounded-xl transition-all hover:bg-red-50 hover:text-red-600 group text-left">
                    <span className="material-symbols-outlined text-xl text-gray-500 group-hover:text-red-500 transition-colors">logout</span>
                    Logout
                </button>
            </div>
        </aside>
    );
}
