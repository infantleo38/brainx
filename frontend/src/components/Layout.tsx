import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getCurrentUser } from '../services/api';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                // Optionally redirect to login if unauthorized
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Determine active menu item based on path
    const getActiveKey = (path: string) => {
        if (path.includes('/dashboard')) return 'dashboard';
        if (path.includes('/chat')) return 'chat';
        if (path.includes('/roles')) return 'roles';
        if (path.includes('/courses')) return 'courses';
        return '';
    };

    const activeKey = getActiveKey(location.pathname);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background-light">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (user && user.status === 'requested') {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-background-light p-6 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100">
                    <div className="size-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-3xl">hourglass_top</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Pending Approval</h1>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Your account has been created and is currently awaiting administrator approval.
                        You will be notified once your account is active.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors"
                        >
                            Return to Home
                        </button>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }}
                            className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display selection:bg-primary/30">
            <Sidebar active={activeKey} />
            <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark h-full overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
    }
