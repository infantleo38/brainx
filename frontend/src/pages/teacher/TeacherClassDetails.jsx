import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getClassSessionsByBatch, getBatch, getBatchResources } from '../../services/api';

export default function TeacherClassDetails() {
    const { courseId } = useParams();
    const [nextSession, setNextSession] = useState(null);
    const [batchDetails, setBatchDetails] = useState(null);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return { icon: 'picture_as_pdf', color: 'text-red-500', bg: 'bg-red-50' };
        if (['mp4', 'mov', 'avi'].includes(ext)) return { icon: 'movie', color: 'text-blue-500', bg: 'bg-blue-50' };
        if (['ppt', 'pptx'].includes(ext)) return { icon: 'present_to_all', color: 'text-amber-500', bg: 'bg-amber-50' };
        if (['doc', 'docx'].includes(ext)) return { icon: 'description', color: 'text-blue-600', bg: 'bg-blue-50' };
        if (['xls', 'xlsx'].includes(ext)) return { icon: 'table_chart', color: 'text-green-600', bg: 'bg-green-50' };
        return { icon: 'insert_drive_file', color: 'text-gray-500', bg: 'bg-gray-50' };
    };

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                // Using Promise.allSettled to ensure that one failure (e.g. no sessions found) 
                // doesn't block other data from loading (e.g. valid resources).
                const [batchResult, sessionsResult, resourcesResult] = await Promise.allSettled([
                    getBatch(courseId),
                    getClassSessionsByBatch(courseId),
                    getBatchResources(courseId)
                ]);

                // 1. Batch Details
                if (batchResult.status === 'fulfilled') {
                    setBatchDetails(batchResult.value);
                } else {
                    console.error("Failed to fetch batch:", batchResult.reason);
                }

                // 2. Class Sessions
                if (sessionsResult.status === 'fulfilled') {
                    const sessions = sessionsResult.value;
                    if (sessions && sessions.length > 0) {
                        setNextSession(sessions[0]);
                    }
                } else {
                    // It's common to have no sessions, so we just log clearly
                    console.warn("Failed to fetch sessions (might be empty):", sessionsResult.reason);
                }

                // 3. Resources
                if (resourcesResult.status === 'fulfilled') {
                    const batchResources = resourcesResult.value;
                    console.log("TeacherClassDetails: Raw batchResources taken from result:", batchResources);

                    if (batchResources && Array.isArray(batchResources)) {
                        const processedResources = batchResources
                            .filter(r => !r.IsDirectory)
                            .map(r => ({
                                id: r.Guid,
                                name: r.ObjectName,
                                type: r.ObjectName.split('.').pop().toLowerCase(),
                                size: r.Length,
                                uploaded_at: r.LastChanged,
                                download_url: `https://${r.StorageZoneName}.b-cdn.net${r.Path}${r.ObjectName}`,
                                visible: true
                            }));
                        console.log("TeacherClassDetails: Processed resources:", processedResources);
                        setResources(processedResources);
                    } else {
                        console.error("TeacherClassDetails: resources is not an array or is empty", batchResources);
                    }
                } else {
                    console.error("Failed to fetch resources API:", resourcesResult.reason);
                }

            } catch (error) {
                console.error("Critical error in fetchSessions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, [courseId]);

    if (loading) {
        return <div className="h-full flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button className="md:hidden text-gray-500 hover:text-primary">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <Link to="/teacher/classes" className="text-gray-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 font-serif">{batchDetails?.course_name || batchDetails?.batch_name || "Class Details"}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl group-focus-within:text-primary transition-colors">search</span>
                        <input
                            className="pl-10 pr-4 py-2 w-72 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20 focus:bg-white transition-all placeholder-gray-400"
                            placeholder="Search class data..." type="text" />
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <img alt="User" className="w-8 h-8 rounded-full object-cover border border-gray-100"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW-tFR3TQfy84jtywNT_O0kGwVJB9mvrNXhOyJ_YwgiYWqeHTH5-AYLF-fFwqRjRyLnICXcl_2O3VvSQasZ9x1Gcb7yLSnXaOAG7PUrncwB8G-ycxLDTzF40zpoQL4He5VYCuethYGY8PIpV0M9a5U1Wc2ap7x0suHUSyF61jPmZPw9LbuIIa71MKeKD9ibEuqjSEZ5P3iTobPlU8pkjzsaR75JIOPsQ8Neh2P9r0dMCEJeFNnozwtPoGscDvOiDu3LenQvCfEXg8" />
                    </div>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-8 bg-background-light">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-[16px] border border-gray-100 custom-shadow-soft shadow-card">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Class Attendance</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">94%</h3>
                                <span className="text-green-500 text-xs font-bold flex items-center"><span
                                    className="material-symbols-outlined text-sm">trending_up</span> +2%</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[16px] border border-gray-100 custom-shadow-soft shadow-card">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Average Quiz Score</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">82%</h3>
                                <span className="text-primary text-xs font-bold">In-range</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[16px] border border-gray-100 custom-shadow-soft shadow-card">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Assignments Pending</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">15</h3>
                                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">Action
                                    Required</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[16px] border border-gray-100 custom-shadow-soft shadow-card">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resource Engagement</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-2xl font-bold text-gray-900">High</h3>
                                <span className="text-gray-400 text-xs font-medium">Top 10% of courses</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <section className="bg-white rounded-[16px] border border-gray-100 custom-shadow-soft overflow-hidden shadow-card">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">folder_open</span>
                                        Resource Library
                                    </h2>
                                    <button
                                        className="px-4 py-2 bg-primary-light text-primary text-sm font-semibold rounded-xl hover:bg-primary hover:text-white transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">upload</span>
                                        Upload New
                                    </button>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {resources.length > 0 ? (
                                        resources.map((resource) => {
                                            const { icon, color, bg } = getFileIcon(resource.name);
                                            return (
                                                <div key={resource.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center ${color}`}>
                                                            <span className="material-symbols-outlined">{icon}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{resource.name}</p>
                                                            <p className="text-xs text-gray-500">{formatFileSize(resource.size)} • {formatDate(resource.uploaded_at)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Visible</span>
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input defaultChecked={resource.visible} className="sr-only peer" type="checkbox" />
                                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary">
                                                                </div>
                                                            </label>
                                                        </div>
                                                        <a href={resource.download_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary" title="Download">
                                                            <span className="material-symbols-outlined">download</span>
                                                        </a>
                                                        <button className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined">more_vert</span></button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-8 text-center text-gray-400 text-sm">
                                            No resources found.
                                        </div>
                                    )}
                                </div>
                            </section>
                            <section className="bg-white rounded-[16px] border border-gray-100 custom-shadow-soft overflow-hidden shadow-card">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">assessment</span>
                                        Assessment Tracker
                                    </h2>
                                    <button className="text-sm font-bold text-primary hover:underline">View All Submissions</button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">Quiz 02: Dynamic Programming</h4>
                                            <p className="text-xs text-gray-500 mt-1">Due: Oct 20, 2023</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-gray-900">38/42</span>
                                                <span className="text-xs text-gray-400">Submitted</span>
                                            </div>
                                            <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                <div className="h-full bg-primary w-[90%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">Lab Assignment: Graph Theory</h4>
                                            <p className="text-xs text-gray-500 mt-1">Due: Oct 25, 2023</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-gray-900">12/42</span>
                                                <span className="text-xs text-gray-400">Submitted</span>
                                            </div>
                                            <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                <div className="h-full bg-amber-500 w-[30%]"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="space-y-8">
                            <section className="bg-white rounded-[16px] border border-gray-100 custom-shadow-soft overflow-hidden shadow-card">
                                <div className="p-6 bg-primary text-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Next Session</span>
                                        <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold">
                                            {nextSession ? new Date(nextSession.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-6">Live Virtual Classroom</h3>
                                    {nextSession ? (
                                        <>
                                            <a href={nextSession.meeting_link || "#"} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-white text-primary font-bold rounded-xl shadow-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 mb-4">
                                                <span className="material-symbols-outlined">video_call</span>
                                                Start Live Class
                                            </a>
                                            <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase opacity-70">Meeting Link</span>
                                                    <span className="text-xs font-medium truncate max-w-[150px]">{nextSession.meeting_link || "No link available"}</span>
                                                </div>
                                                <Link to={`/teacher/classes/${courseId}/meeting`} className="text-xs font-bold underline hover:opacity-80">Manage Link</Link>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="opacity-80 text-sm">No upcoming sessions</p>
                                            <Link to={`/teacher/classes/${courseId}/meeting`} className="mt-2 inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all">Schedule Class</Link>
                                        </div>
                                    )}
                                </div>
                            </section>
                            <section className="bg-white rounded-[16px] border border-gray-100 custom-shadow-soft overflow-hidden shadow-card">
                                <div className="p-6 border-b border-gray-50">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                                        Recent Activity
                                    </h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex gap-4 relative">
                                        <div className="absolute left-[15px] top-10 bottom-0 w-px bg-gray-100"></div>
                                        <img alt="" className="w-8 h-8 rounded-full border border-white relative z-10"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW-tFR3TQfy84jtywNT_O0kGwVJB9mvrNXhOyJ_YwgiYWqeHTH5-AYLF-fFwqRjRyLnICXcl_2O3VvSQasZ9x1Gcb7yLSnXaOAG7PUrncwB8G-ycxLDTzF40zpoQL4He5VYCuethYGY8PIpV0M9a5U1Wc2ap7x0suHUSyF61jPmZPw9LbuIIa71MKeKD9ibEuqjSEZ5P3iTobPlU8pkjzsaR75JIOPsQ8Neh2P9r0dMCEJeFNnozwtPoGscDvOiDu3LenQvCfEXg8" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900">Marcus Chen</p>
                                            <p className="text-xs text-gray-500">Submitted <span className="text-primary font-medium">Lab Assignment</span></p>
                                            <p className="text-[10px] text-gray-400 mt-1">2 minutes ago</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 relative">
                                        <div className="absolute left-[15px] top-10 bottom-0 w-px bg-gray-100"></div>
                                        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary relative z-10">
                                            <span className="material-symbols-outlined text-sm">forum</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900">New Forum Post</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">"Hey Professor, I have a question about Dijkstra's..."</p>
                                            <p className="text-[10px] text-gray-400 mt-1">15 minutes ago</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <img alt="" className="w-8 h-8 rounded-full border border-white relative z-10"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW-tFR3TQfy84jtywNT_O0kGwVJB9mvrNXhOyJ_YwgiYWqeHTH5-AYLF-fFwqRjRyLnICXcl_2O3VvSQasZ9x1Gcb7yLSnXaOAG7PUrncwB8G-ycxLDTzF40zpoQL4He5VYCuethYGY8PIpV0M9a5U1Wc2ap7x0suHUSyF61jPmZPw9LbuIIa71MKeKD9ibEuqjSEZ5P3iTobPlU8pkjzsaR75JIOPsQ8Neh2P9r0dMCEJeFNnozwtPoGscDvOiDu3LenQvCfEXg8" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900">Elena Rodriguez</p>
                                            <p className="text-xs text-gray-500">Submitted <span className="text-primary font-medium">Quiz 02</span></p>
                                            <p className="text-[10px] text-gray-400 mt-1">1 hour ago</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    <section className="bg-white rounded-[16px] border border-gray-100 custom-shadow-soft overflow-hidden mb-10 shadow-card">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 font-serif">Student Performance Roster</h2>
                            <span className="text-xs text-gray-500">{batchDetails?.members?.length || 0} Students</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-50">
                            {batchDetails?.members?.map((member) => (
                                <div key={member.user_id} className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                                            {member.user_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{member.user_name}</p>
                                            <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{member.user_email}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">Student</p>
                                </div>
                            ))}
                            {(!batchDetails?.members || batchDetails.members.length === 0) && (
                                <div className="p-6 col-span-full text-center text-gray-500 text-sm">
                                    No students enrolled yet.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div >
    );
}
