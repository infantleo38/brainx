import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, getBatches, getCourses } from '../../services/api';
import { classesStats } from '../../mock/teacherClassesData';

export default function TeacherClasses() {
    const [user, setUser] = useState(null);
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);

                const [batchesData, coursesData] = await Promise.all([
                    getBatches(),
                    getCourses()
                ]);

                // Filter batches for current teacher
                // Handle both simple ID and object cases if backend varies, though usually it's UUID or int
                const myBatches = batchesData.filter(b => {
                    // Ensure type safety (string vs number vs UUID)
                    const teacherId = b.teacher_id;
                    const userId = userData.id || userData.data?.id; // handle APIResponse wrapper if needed
                    return teacherId === userId;
                });

                // Map to display format
                const mappedClasses = myBatches.map(batch => {
                    const course = coursesData.find(c => c.id === batch.course_id);
                    return {
                        id: batch.id,
                        courseId: batch.course_id,
                        title: course?.title || batch.batch_name || "Unknown Class",
                        // Prioritize batch name if it differs, or show Course Title - Batch Name
                        displayTitle: course ? `${course.title} - ${batch.batch_name}` : batch.batch_name,
                        code: course?.level || "B-" + batch.id, // Fallback code
                        image: course?.image,
                        students: 0, // No member count in list API yet
                        status: batch.status ? "Active" : "Inactive",
                        statusColor: batch.status ? "text-green-600 bg-green-50 border border-green-100" : "text-gray-600 bg-gray-50 border border-gray-100",
                        dotColor: batch.status ? "bg-green-500" : "bg-gray-400",
                        isPulse: batch.status,
                        icon: batch.status ? "check_circle" : "pause_circle"
                    };
                });

                setTeacherClasses(mappedClasses);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getInitials = (title) => {
        if (!title) return "CC";
        const cleanTitle = title.replace(/[^a-zA-Z0-9 ]/g, '');
        const words = cleanTitle.split(' ').filter(w => w.length > 0);
        if (words.length > 1) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return cleanTitle.substring(0, 2).toUpperCase();
    }

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button className="md:hidden text-gray-500 hover:text-primary">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">My Classes</h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl group-focus-within:text-primary transition-colors">search</span>
                        <input className="pl-10 pr-4 py-2 w-72 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20 focus:bg-white transition-all placeholder-gray-400" placeholder="Search students, classes..." type="text" />
                    </div>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-8 scroll-smooth bg-background-light">
                <div className="max-w-7xl mx-auto">
                    <nav className="flex items-center text-sm text-gray-500 mb-6 space-x-2">
                        <a className="hover:text-primary transition-colors" href="#">Home</a>
                        <span className="material-symbols-outlined text-base text-gray-400">chevron_right</span>
                        <span className="text-gray-900 font-medium">My Classes</span>
                    </nav>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {classesStats.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-[16px] border border-gray-100 shadow-card flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl ${stat.iconBg} flex items-center justify-center ${stat.iconColor} shadow-sm`}>
                                    <span className="material-symbols-outlined">{stat.icon}</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.title}</h3>
                                    <p className="text-sm font-medium text-gray-500">{stat.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-serif font-bold text-gray-900">My Classes</h2>
                        <div className="flex gap-2">
                            <button className="p-2 text-gray-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">grid_view</span></button>
                            <button className="p-2 text-gray-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">list</span></button>
                        </div>
                    </div>

                    {/* Course Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
                        {loading ? (
                            <div className="col-span-full flex justify-center py-20">
                                <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                            </div>
                        ) : teacherClasses.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                No classes found. Create a new class to get started.
                            </div>
                        ) : (
                            teacherClasses.map((course, index) => (
                                <div key={index} className="bg-white rounded-[16px] border border-gray-100 shadow-card hover:shadow-deep-purple transition-all duration-300 overflow-hidden flex flex-col group h-full">
                                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                                        {course.image ? (
                                            <img alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={course.image} />
                                        ) : (
                                            <div className="w-full h-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                <span className="text-4xl font-bold text-primary font-serif tracking-tight">
                                                    {getInitials(course.title)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className={`absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold ${course.statusColor} shadow-sm flex items-center gap-1`}>
                                            {course.isPulse && <span className={`w-1.5 h-1.5 rounded-full ${course.dotColor} animate-pulse`}></span>}
                                            {course.icon && <span className="material-symbols-outlined text-[14px]">{course.icon}</span>}
                                            {' ' + course.status}
                                        </span>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">{course.displayTitle}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium mb-4 flex items-center gap-3">
                                            <span>{course.code}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">person</span> {course.students} Students</span>
                                        </p>
                                        <div className="mt-auto space-y-3">
                                            <Link
                                                to={`/teacher/classes/${course.id}/details`}
                                                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                                                View Class Management
                                            </Link>
                                            <Link
                                                to={`/teacher/classes/${course.id}/meeting`}
                                                className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
                                            >
                                                <span className="material-symbols-outlined text-[18px] text-gray-400 group-hover/btn:text-primary transition-colors">link</span>
                                                Meeting Management
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Create New Class Button */}
                        <button className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-[16px] flex flex-col items-center justify-center p-8 hover:border-primary hover:bg-primary/5 transition-all duration-300 group cursor-pointer">
                            <div className="w-16 h-16 rounded-full bg-gray-50 group-hover:bg-white group-hover:shadow-lg flex items-center justify-center mb-4 transition-all">
                                <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-primary transition-colors">add</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Create New Class</h3>
                            <p className="text-sm text-gray-500 text-center max-w-[200px]">Add a new course to your instructor roster</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
