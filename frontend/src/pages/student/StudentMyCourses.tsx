import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getMyEnrollments } from '../../services/api';

interface EnrollmentBadge {
    text: string;
    icon: string;
    color: string;
}

interface EnrollmentLogo {
    bg: string;
    border: string;
    text: string;
    icon: string;
}

interface Enrollment {
    id: string | number;
    title: string;
    thumbnail: string;
    badge: EnrollmentBadge;
    tags: string[];
    logo: EnrollmentLogo;
    institution: string;
    instructor: string;
    status: string;
    progress: number;
    barColor: string;
}

interface User {
    id: string | number;
    full_name: string;
    profile_image?: string;
    [key: string]: any;
}

export default function StudentMyCourses() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userDataResult, enrollmentsResult] = await Promise.all([
                    getCurrentUser(),
                    getMyEnrollments()
                ]);
                
                const userData = userDataResult as User; // Cast if needed or ensure API returns User
                setUser(userData);

                const enrollmentsData = Array.isArray(enrollmentsResult) ? enrollmentsResult : [];

                // Transform API data to match UI component structure
                const formattedEnrollments: Enrollment[] = enrollmentsData.map((enrollment: any) => {
                    const course = enrollment.course || {};
                    return {
                        id: course.id,
                        title: course.title || "Untitled Course",
                        thumbnail: course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", // Fallback image
                        badge: {
                            text: course.badge?.text || "Course",
                            icon: course.badge?.icon || "school",
                            color: course.badge?.className || "bg-primary/90" // Using className as color for now or default
                        },
                        tags: course.category ? [course.category.name] : [],
                        logo: {
                            bg: "bg-blue-50",
                            border: "border-blue-100",
                            text: "text-blue-600",
                            icon: "school"
                        },
                        institution: course.provider?.name || "BrainX Academy",
                        instructor: "BrainX Instructor", // Backend doesn't return instructor name on enrollment yet, need to fetch or add to schema
                        status: enrollment.status,
                        progress: enrollment.status === 'completed' ? 100 : (enrollment.status === 'active' ? 35 : 0), // Mock progress based on status
                        barColor: enrollment.status === 'completed' ? 'bg-green-500' : 'bg-primary'
                    };
                });

                setEnrollments(formattedEnrollments);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
                <h1 className="text-xl font-bold text-gray-900">My Courses</h1>
                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="pl-10 pr-4 py-2 w-72 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20 focus:bg-white transition-all placeholder-gray-400"
                            placeholder="Search for courses..."
                            type="text"
                        />
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button className="p-1.5 rounded-md bg-white shadow-sm text-primary">
                            <span className="material-symbols-outlined text-[20px]">grid_view</span>
                        </button>
                        <button className="p-1.5 rounded-md text-gray-500 hover:text-gray-700">
                            <span className="material-symbols-outlined text-[20px]">view_list</span>
                        </button>
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <button className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-3 rounded-full transition-colors">
                            <img
                                alt="User"
                                className="w-8 h-8 rounded-full object-cover"
                                src={user?.profile_image || "https://ui-avatars.com/api/?name=" + (user?.full_name || "User") + "&background=random"}
                            />
                            <span className="material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                        </button>
                    </div>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-8 scroll-smooth bg-background-light">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-100">
                            <button className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold shadow-md shadow-primary/20 transition-all">All</button>
                            <button className="px-5 py-2 text-gray-500 hover:bg-white hover:text-primary rounded-xl text-sm font-medium transition-all hover:shadow-sm">In Progress</button>
                            <button className="px-5 py-2 text-gray-500 hover:bg-white hover:text-primary rounded-xl text-sm font-medium transition-all hover:shadow-sm">Completed</button>
                            <button className="px-5 py-2 text-gray-500 hover:bg-white hover:text-primary rounded-xl text-sm font-medium transition-all hover:shadow-sm">Archived</button>
                        </div>
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-bold text-gray-900">{enrollments.length}</span> courses
                        </div>
                    </div>

                    {enrollments.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <span className="material-symbols-outlined text-4xl mb-2">school</span>
                            <p>You are not enrolled in any courses yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {enrollments.map((course) => (
                                <div key={course.id}
                                    onClick={() => navigate(`/student/my-courses/${course.id}`)}
                                    className="bg-white rounded-[16px] overflow-hidden flex flex-col course-card-shadow hover:-translate-y-1 transition-transform duration-300 group cursor-pointer">
                                    <div className={`h-40 ${Number(course.id) % 2 === 0 ? 'bg-gray-900' : 'bg-gray-200'} relative overflow-hidden`}>
                                        <img alt={course.title} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${Number(course.id) % 2 === 0 ? 'opacity-80' : ''}`} src={course.thumbnail} />
                                        <div className={`absolute top-4 left-4 ${course.badge.color || 'bg-white/90'} backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold ${course.badge.color ? 'text-white border-white/20' : 'text-gray-800 border-white/50'} shadow-sm flex items-center gap-1`}>
                                            <span className={`material-symbols-outlined text-[14px] ${!course.badge.color ? 'text-primary' : ''}`}>{course.badge.icon}</span> {course.badge.text}
                                        </div>
                                        {course.tags && course.tags.length > 0 && (
                                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider">
                                                {course.tags[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex-col flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-8 h-8 rounded-full ${course.logo.bg} flex items-center justify-center border ${course.logo.border}`}>
                                                <span className={`material-symbols-outlined ${course.logo.text} text-[18px]`}>{course.logo.icon}</span>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{course.institution}</span>
                                        </div>
                                        <h3 className="text-xl font-bold font-serif text-gray-900 leading-tight mb-2">{course.title}</h3>
                                        <p className="text-sm text-gray-500 mb-6">{course.instructor}</p>
                                        <div className="mt-auto space-y-4">
                                            <div>
                                                <div className="flex justify-between text-xs font-semibold mb-1.5">
                                                    <span className="text-primary">{course.status}</span>
                                                    <span className="text-gray-700">{course.progress}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full ${course.barColor} rounded-full shadow-[0_0_10px_rgba(80,35,196,0.3)]`} style={{ width: `${course.progress}%` }}></div>
                                                </div>
                                            </div>
                                            <button className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                                Continue Lesson
                                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
