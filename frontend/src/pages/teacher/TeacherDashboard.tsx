import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../services/api';
import { 
    teacherStats, 
    classSchedule, 
    quickActions, 
    performanceData, 
    recentSubmissions 
} from '../../mock/teacherDashboardData';

// Define interfaces for the mock data items to fix implicit 'any' errors
interface TeacherStat {
    icon: string;
    value: string | number;
    title: string;
    amount?: string | number; // Added possible missing prop based on common patterns
    change?: string;
    trend?: 'up' | 'down';
    status?: string;
    statusColor?: string;
    [key: string]: any;
}

interface ScheduleItem {
    isNow: boolean;
    period: string;
    time: string;
    title: string;
    type: string;
    meta: string;
    status?: string;
    [key: string]: any;
}

interface QuickAction {
    icon: string;
    title: string;
    subtitle: string;
    bgColor: string;
    color: string;
    [key: string]: any;
}

interface PerformanceData {
    label: string;
    percentage: string;
    height: string;
    color: string;
    [key: string]: any;
}

interface Submission {
    name: string;
    assignment: string;
    timeAgo: string;
    avatar?: string;
    initials?: string;
    initialsColor?: string;
    [key: string]: any;
}

interface User {
    id: number;
    full_name: string;
    email: string;
    role?: string;
    [key: string]: any;
}

export default function TeacherDashboard() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData as User);
            } catch (error) {
                console.error("Failed to fetch user", error);
            }
        };
        fetchUser();
    }, []);

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
                <h1 className="text-xl font-bold text-gray-900">Instructor Dashboard</h1>
                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl group-focus-within:text-primary transition-colors">search</span>
                        <input className="pl-10 pr-4 py-2 w-72 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20 focus:bg-white transition-all placeholder-gray-400" placeholder="Search students, classes..." type="text"/>
                    </div>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-8 scroll-smooth bg-background-light">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {teacherStats.map((stat: TeacherStat, index: number) => (
                            <div key={index} className="bg-white p-6 rounded-[16px] shadow-glow border border-gray-50 flex flex-col justify-between h-40 relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-[100%] transition-transform group-hover:scale-110"></div>
                                <div className="flex justify-between items-start z-10">
                                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                                        <span className="material-symbols-outlined">{stat.icon}</span>
                                    </div>
                                    {stat.change && (
                                        <span className={`text-${stat.trend === 'up' ? 'green' : 'red'}-600 bg-${stat.trend === 'up' ? 'green' : 'red'}-50 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1`}>
                                            <span className="material-symbols-outlined text-[14px]">{stat.trend === 'up' ? 'trending_up' : 'trending_down'}</span> {stat.change}
                                        </span>
                                    )}
                                    {stat.status && (
                                        <span className={`text-${stat.statusColor}-600 bg-${stat.statusColor}-50 px-2 py-1 rounded-lg text-xs font-bold`}>{stat.status}</span>
                                    )}
                                </div>
                                <div className="z-10 mt-4">
                                    <h3 className="text-3xl font-bold font-serif text-gray-900">{stat.value}</h3>
                                    <p className="text-sm font-medium text-gray-500 mt-1">{stat.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Class Schedule */}
                        <div className="lg:col-span-2 bg-white rounded-[16px] shadow-card p-6 border border-gray-50 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Class Schedule</h3>
                                <button className="text-sm text-primary font-semibold hover:bg-primary-light px-3 py-1.5 rounded-lg transition-colors">View Calendar</button>
                            </div>
                            <div className="space-y-4">
                                {classSchedule.map((item: ScheduleItem, index: number) => (
                                    <div key={index} className={`flex items-center gap-4 p-4 rounded-xl ${item.isNow ? 'bg-primary-light border border-primary/10 relative overflow-hidden' : 'hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors'}`}>
                                        {item.isNow && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>}
                                        <div className={`flex flex-col items-center justify-center w-16 h-16 ${item.isNow ? 'bg-white shadow-sm border border-primary/10' : 'bg-gray-50 border border-gray-100'} rounded-lg text-center flex-shrink-0`}>
                                            <span className={`text-xs font-bold ${item.isNow ? 'text-gray-500' : 'text-gray-400'} uppercase`}>{item.isNow ? 'Now' : item.period}</span>
                                            <span className={`text-lg font-bold ${item.isNow ? 'text-primary' : 'text-gray-700'}`}>{item.time}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-gray-900">{item.title}</h4>
                                                {item.status === 'Live' && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-full animate-pulse">Live</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">{item.type} • {item.meta}</p>
                                        </div>
                                        {item.isNow ? (
                                            <button className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors whitespace-nowrap">
                                                Start Session
                                            </button>
                                        ) : (
                                            <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                                                <span className="material-symbols-outlined">more_vert</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-[16px] shadow-card p-6 border border-gray-50 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
                            <div className="space-y-3 flex-1">
                                {quickActions.map((action: QuickAction, index: number) => (
                                    <button key={index} className="w-full p-4 flex items-center gap-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary-light/30 hover:shadow-md transition-all group text-left">
                                        <div className={`w-10 h-10 rounded-full ${action.bgColor} ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <span className="material-symbols-outlined">{action.icon}</span>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-gray-900 text-sm">{action.title}</h5>
                                            <p className="text-xs text-gray-500">{action.subtitle}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Student Performance Overview */}
                        <div className="bg-white rounded-[16px] shadow-card p-6 border border-gray-50">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Student Performance Overview</h3>
                                <select className="bg-gray-50 border-none text-xs font-semibold rounded-lg text-gray-500 focus:ring-0 cursor-pointer">
                                    <option>All Classes</option>
                                    <option>Adv. Algorithms</option>
                                    <option>Data Structures</option>
                                </select>
                            </div>
                            <div className="h-64 w-full flex items-end justify-between px-4 pb-2 border-b border-gray-100 relative">
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-gray-300">
                                    <div className="border-t border-dashed border-gray-100 h-0 w-full"></div>
                                    <div className="border-t border-dashed border-gray-100 h-0 w-full"></div>
                                    <div className="border-t border-dashed border-gray-100 h-0 w-full"></div>
                                    <div className="border-t border-dashed border-gray-100 h-0 w-full"></div>
                                </div>
                                {performanceData.map((data: PerformanceData, index: number) => (
                                    <div key={index} className="flex flex-col items-center gap-2 group z-10 w-1/6">
                                        <div className={`w-full max-w-[40px] ${data.color} rounded-t-lg shadow-lg shadow-${data.color.replace('bg-', '')}/20 chart-bar relative`} style={{ height: data.height }}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">{data.percentage}</div>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-500">{data.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Submissions */}
                        <div className="bg-white rounded-[16px] shadow-card p-6 border border-gray-50 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Recent Submissions</h3>
                                <button className="text-sm text-primary font-semibold hover:underline">View All</button>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-1">
                                <div className="space-y-4">
                                    {recentSubmissions.map((sub: Submission, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
                                            <div className="flex items-center gap-3">
                                                {sub.avatar ? (
                                                    <img alt="Student" className="w-10 h-10 rounded-full object-cover" src={sub.avatar} />
                                                ) : (
                                                    <div className={`w-10 h-10 rounded-full ${sub.initialsColor} flex items-center justify-center font-bold text-sm`}>{sub.initials}</div>
                                                )}
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900">{sub.name}</h4>
                                                    <p className="text-xs text-gray-500">{sub.assignment}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-medium text-gray-400">{sub.timeAgo}</span>
                                                <button className="px-3 py-1.5 bg-white border border-gray-200 text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                                                    Grade
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
