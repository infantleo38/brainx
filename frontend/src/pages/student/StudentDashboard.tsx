import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { getCurrentUser, uploadProfileImage, updateUserProfile } from '../../services/api';
import { dashboardMetrics, courseProgressData, deadlinesData, scheduleData, announcementsData } from '../../mock/dashboardData';

interface DashboardMetric {
    title: string;
    value: string | number;
    icon: string;
    isPrimary?: boolean;
    color?: string;
}

interface CourseProgress {
    title: string;
    instructor: string;
    progress: number;
    icon: string;
    color: string;
}

interface Deadline {
    time: string;
    title: string;
    course: string;
    color: string;
}

interface ScheduleItem {
    time: string;
    period: string;
    subject: string;
    room: string;
}

interface Announcement {
    time: string;
    text: string;
    color: string;
}

interface User {
    full_name: string;
    profile_image?: string;
    [key: string]: any;
}

export default function StudentDashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // 1. Upload image
            const publicUrl = await uploadProfileImage(file);
            
            // 2. Update user profile with new image URL
            const updatedUser = await updateUserProfile({ profile_image: publicUrl });
            
            // 3. Update local state
            setUser(updatedUser as User);
        } catch (error) {
            console.error("Failed to upload image", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl">search</span>
                        <input 
                            className="pl-10 pr-4 py-2 w-64 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" 
                            placeholder="Search courses, assignments..." 
                            type="text" 
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-1"></div>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        
                        <button 
                            className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-3 rounded-full transition-colors group"
                            onClick={handleImageClick}
                            disabled={isUploading}
                        >
                            <div className="relative">
                                <img 
                                    alt="User" 
                                    className={`w-8 h-8 rounded-full object-cover ${isUploading ? 'opacity-50' : ''}`}
                                    src={user?.profile_image || "https://ui-avatars.com/api/?name=" + (user?.full_name || "User") + "&background=random"} 
                                />
                                {isUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-xs">edit</span>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                        </button>
                    </div>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {dashboardMetrics.map((metric: DashboardMetric, index: number) => (
                            <div key={index} className="bg-white p-5 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow border border-gray-100/50 flex items-center justify-between group">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium mb-1">{metric.title}</p>
                                    <h3 className={`text-3xl font-bold ${metric.isPrimary ? 'text-primary' : 'text-gray-900'}`}>{metric.value}</h3>
                                </div>
                                <div className={`w-12 h-12 rounded-xl ${metric.isPrimary ? 'bg-primary-light text-primary' : `bg-${metric.color}-50 text-${metric.color}-500`} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <span className="material-symbols-outlined">{metric.icon}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6 border border-gray-100/50">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 text-lg">Course Progress</h3>
                                <button className="text-sm text-primary font-medium hover:underline">View All</button>
                            </div>
                            <div className="space-y-6">
                                {courseProgressData.map((course: CourseProgress, index: number) => (
                                    <div key={index}>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    <span className="material-symbols-outlined text-gray-500">{course.icon}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-900">{course.title}</h4>
                                                    <p className="text-xs text-gray-500">{course.instructor}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{course.progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${course.color} rounded-full`} style={{ width: `${course.progress}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-1 bg-white rounded-2xl shadow-card p-6 border border-gray-100/50">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 text-lg">Deadlines</h3>
                                <span className="material-symbols-outlined text-gray-400 cursor-pointer hover:text-primary">more_horiz</span>
                            </div>
                            <div className="relative pl-4 border-l border-dashed border-gray-200 space-y-8">
                                {deadlinesData.map((deadline: Deadline, index: number) => (
                                    <div key={index} className="relative">
                                        <div className={`absolute -left-[21px] top-1 w-3 h-3 bg-${deadline.color === 'primary' ? 'primary' : deadline.color === 'orange' ? 'orange-400' : 'red-500'} rounded-full ring-4 ring-white`}></div>
                                        <p className={`text-xs font-semibold text-${deadline.color === 'primary' ? 'primary' : deadline.color === 'orange' ? 'orange-500' : 'red-500'} mb-1`}>{deadline.time}</p>
                                        <h4 className="text-sm font-bold text-gray-900">{deadline.title}</h4>
                                        <p className="text-xs text-gray-500">{deadline.course}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
                        <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100/50 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 text-lg">Performance Analytics</h3>
                                <select className="text-sm bg-gray-50 border-none rounded-lg py-1 px-3 text-gray-600 focus:ring-0 cursor-pointer">
                                    <option>Last 4 Semesters</option>
                                    <option>Last Year</option>
                                </select>
                            </div>
                            <div className="flex-1 flex items-end justify-between px-4 h-48 relative">
                                <div className="absolute inset-0 top-10 px-4 flex items-end justify-between w-full h-32 pointer-events-none">
                                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                        <line stroke="#f3f4f6" strokeWidth="1" x1="0" x2="100" y1="0" y2="0"></line>
                                        <line stroke="#f3f4f6" strokeWidth="1" x1="0" x2="100" y1="25" y2="25"></line>
                                        <line stroke="#f3f4f6" strokeWidth="1" x1="0" x2="100" y1="50" y2="50"></line>
                                        <line stroke="#f3f4f6" strokeWidth="1" x1="0" x2="100" y1="75" y2="75"></line>
                                        <path d="M0,60 C20,55 30,40 50,30 S80,20 100,10" fill="none" stroke="#5023c4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                                        <path d="M0,60 C20,55 30,40 50,30 S80,20 100,10 V100 H0 Z" fill="#5023c4" fillOpacity="0.05"></path>
                                    </svg>
                                </div>
                                <div className="relative z-10 flex flex-col items-center gap-2 w-full">
                                    <div className="w-full flex justify-between text-xs text-gray-400 mt-40">
                                        <span>Sem 1</span>
                                        <span>Sem 2</span>
                                        <span>Sem 3</span>
                                        <span>Sem 4</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-glow p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <h3 className="font-bold text-lg mb-4 relative z-10">Today's Schedule</h3>
                                <div className="space-y-3 relative z-10">
                                    {scheduleData.map((item: ScheduleItem, index: number) => (
                                        <div key={index} className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10 flex items-center gap-3">
                                            <div className="text-center w-10">
                                                <div className="text-xs font-light text-white/70">{item.time}</div>
                                                <div className="text-xs font-bold">{item.period}</div>
                                            </div>
                                            <div className="h-8 w-px bg-white/20"></div>
                                            <div>
                                                <p className="text-sm font-bold">{item.subject}</p>
                                                <p className="text-xs text-indigo-200">{item.room}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">View Full Schedule</button>
                            </div>
                            <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100/50 flex flex-col">
                                <h3 className="font-bold text-gray-900 text-lg mb-4">Announcements</h3>
                                <div className="space-y-4 flex-1 overflow-y-auto max-h-48 pr-2">
                                    {announcementsData.map((announcement: Announcement, index: number) => (
                                        <div key={index} className="flex gap-3">
                                            <div className={`min-w-[4px] bg-${announcement.color === 'blue' ? 'blue-500' : announcement.color === 'purple' ? 'purple-500' : 'gray-300'} rounded-full h-full`}></div>
                                            <div>
                                                <p className="text-xs text-gray-400 mb-0.5">{announcement.time}</p>
                                                <p className="text-sm text-gray-800 leading-snug">{announcement.text}</p>
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
