import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getClassSessionsByBatch, getBatch, getBatchResources, submitAttendance, getSessionAttendance } from '../../services/api';

interface BatchMember {
    user_id: string | number;
    user_name: string;
    user_email: string;
}

interface BatchDetails {
    id: string | number;
    course_name?: string;
    batch_name?: string;
    members?: BatchMember[];
    [key: string]: any;
}

interface Session {
    id: string | number | null;
    start_time: string;
    end_time: string;
    meeting_link?: string;
    date?: string;
    [key: string]: any;
}

interface Resource {
    id: string | number;
    name: string;
    type: string;
    size: number;
    uploaded_at: string;
    download_url: string;
    visible: boolean;
}

interface AttendanceRecord {
    student_id: string | number;
    student_name: string;
    status: string;
    remarks: string;
}

export default function TeacherClassDetails() {
    const { courseId } = useParams<{ courseId: string }>();
    const [nextSession, setNextSession] = useState<Session | null>(null);
    const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    // Attendance State
    const [allSessions, setAllSessions] = useState<Session[]>([]);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState<Session | null>(null);
    const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
    const [submittingAttendance, setSubmittingAttendance] = useState(false);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        if (['pdf'].includes(ext)) return { icon: 'picture_as_pdf', color: 'text-red-500', bg: 'bg-red-50' };
        if (['mp4', 'mov', 'avi'].includes(ext)) return { icon: 'movie', color: 'text-blue-500', bg: 'bg-blue-50' };
        if (['ppt', 'pptx'].includes(ext)) return { icon: 'present_to_all', color: 'text-amber-500', bg: 'bg-amber-50' };
        if (['doc', 'docx'].includes(ext)) return { icon: 'description', color: 'text-blue-600', bg: 'bg-blue-50' };
        if (['xls', 'xlsx'].includes(ext)) return { icon: 'table_chart', color: 'text-green-600', bg: 'bg-green-50' };
        return { icon: 'insert_drive_file', color: 'text-gray-500', bg: 'bg-gray-50' };
    };

    useEffect(() => {
        if (!courseId) return;
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
                    setBatchDetails(batchResult.value as BatchDetails);
                } else {
                    console.error("Failed to fetch batch:", batchResult.reason);
                }

                // 2. Class Sessions
                if (sessionsResult.status === 'fulfilled') {
                    const sessions = sessionsResult.value as Session[];

                    if (sessions && sessions.length > 0) {
                        setAllSessions(sessions);
                        // Find next upcoming session
                        const now = new Date();
                        const upcoming = sessions.find(s => new Date(s.start_time) > now);
                        setNextSession(upcoming || sessions[sessions.length - 1]); // Default to last if none upcoming
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
                        const processedResources: Resource[] = batchResources
                            .filter((r: any) => !r.IsDirectory)
                            .map((r: any) => ({
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

    const handleOpenAttendance = async (session: Session) => {
        setSelectedSessionForAttendance(session);
        setIsAttendanceModalOpen(true);
        // Initialize attendance list with all students
        // Default to 'present'
        const students = batchDetails?.members || [];

        try {
            // Check if attendance already exists
            if (session.id) {
                const existingAttendance: any[] = await getSessionAttendance(session.id);
                
                const initialList = students.map(student => {
                    const existingRecord = existingAttendance.find((r: any) => r.student_id === student.user_id);
                    return {
                        student_id: student.user_id,
                        student_name: student.user_name,
                        status: existingRecord ? existingRecord.status : 'present',
                        remarks: existingRecord ? existingRecord.remarks : ''
                    };
                });
                setAttendanceList(initialList);
            } else {
                 setAttendanceList(students.map(s => ({
                    student_id: s.user_id,
                    student_name: s.user_name,
                    status: 'present',
                    remarks: ''
                })));
            }
        } catch (error) {
            console.error("Failed to fetch existing attendance", error);
            // Fallback to default
            setAttendanceList(students.map(s => ({
                student_id: s.user_id,
                student_name: s.user_name,
                status: 'present',
                remarks: ''
            })));
        }
    };

    const handleOpenAttendanceForDate = async (date: Date) => {
        // Create a pseudo-session object for today's date
        const todaySession: Session = {
            id: null, // No session ID for date-based attendance
            date: date.toISOString().split('T')[0], // YYYY-MM-DD format
            start_time: date.toISOString(),
            end_time: date.toISOString()
        };

        setSelectedSessionForAttendance(todaySession);
        setIsAttendanceModalOpen(true);

        const students = batchDetails?.members || [];
        // For date-based attendance, start fresh with all present
        setAttendanceList(students.map(s => ({
            student_id: s.user_id,
            student_name: s.user_name,
            status: 'present',
            remarks: ''
        })));
    };

    const updateAttendanceStatus = (index: number, newStatus: string) => {
        const newList = [...attendanceList];
        newList[index].status = newStatus;
        setAttendanceList(newList);
    };

    const handleSubmitAttendance = async () => {
        if (!selectedSessionForAttendance || !courseId) return;
        setSubmittingAttendance(true);
        try {
            const sessionId = selectedSessionForAttendance.id || null;
            const batchId = parseInt(courseId);
            const attendanceDate = selectedSessionForAttendance.date || new Date().toISOString().split('T')[0];

            // Format records for submission with all required fields
            const formattedRecords = attendanceList.map((record: AttendanceRecord) => ({
                student_id: record.student_id,
                session_id: sessionId,
                batch_id: batchId,
                date: attendanceDate,
                status: record.status,
                remarks: record.remarks || ''
            }));

            // Build the payload
            const payload = {
                session_id: sessionId,
                batch_id: batchId,
                date: attendanceDate,
                records: formattedRecords
            };

            console.log('Submitting attendance payload:', payload);
            await submitAttendance(payload);
            alert("Attendance submitted successfully!");
            setIsAttendanceModalOpen(false);
        } catch (error) {
            console.error("Failed to submit attendance", error);
            alert("Failed to submit attendance.");
        } finally {
            setSubmittingAttendance(false);
        }
    };

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
                                        <span className="material-symbols-outlined text-primary">calendar_month</span>
                                        Attendance
                                    </h2>
                                    <span className="text-sm text-gray-500">
                                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                                <div className="p-6">
                                    {/* Today's Attendance Card */}
                                    <div className="bg-gradient-to-r from-primary/5 to-indigo-50 border border-primary/10 rounded-2xl p-6 mb-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Today's Date</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {batchDetails?.members?.length || 0} students in this batch
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleOpenAttendanceForDate(new Date())}
                                                className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                                            >
                                                <span className="material-symbols-outlined">edit_calendar</span>
                                                Take Attendance
                                            </button>
                                        </div>
                                    </div>

                                    {/* Previous Sessions List (optional) */}
                                    {allSessions.length > 0 && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Previous Sessions</p>
                                            <div className="divide-y divide-gray-50 max-h-[200px] overflow-y-auto border border-gray-100 rounded-xl">
                                                {allSessions.slice(0, 5).map((session) => (
                                                    <div key={session.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {formatDate(session.start_time)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {new Date(session.start_time) < new Date() ? (
                                                                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-bold uppercase">Completed</span>
                                                            ) : (
                                                                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">Upcoming</span>
                                                            )}
                                                            <button
                                                                onClick={() => handleOpenAttendance(session)}
                                                                className="px-2 py-1 text-primary hover:bg-primary-light text-xs font-bold rounded-lg transition-all"
                                                            >
                                                                View
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

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
            {/* Attendance Modal */}
            {isAttendanceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-white/20 max-h-[80vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900">Mark Attendance</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {selectedSessionForAttendance && formatDate(selectedSessionForAttendance.start_time)} •
                                    {selectedSessionForAttendance && new Date(selectedSessionForAttendance.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAttendanceModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                        <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {attendanceList.map((record, index) => (
                                        <tr key={record.student_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-bold text-gray-900 block">{record.student_name}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="relative inline-block w-32">
                                                    <select
                                                        value={record.status}
                                                        onChange={(e) => updateAttendanceStatus(index, e.target.value)}
                                                        className={`appearance-none w-full px-4 py-1.5 pr-8 rounded-full text-xs font-bold capitalize outline-none cursor-pointer transition-all border ${record.status === 'present' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            record.status === 'absent' ? 'bg-red-100 text-red-700 border-red-200' :
                                                                record.status === 'late' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                                    'bg-blue-100 text-blue-700 border-blue-200'
                                                            }`}
                                                    >
                                                        <option value="present">Present</option>
                                                        <option value="absent">Absent</option>
                                                        <option value="late">Late</option>
                                                        <option value="excused">Excused</option>
                                                    </select>
                                                    <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${record.status === 'present' ? 'text-green-700' :
                                                        record.status === 'absent' ? 'text-red-700' :
                                                            record.status === 'late' ? 'text-orange-700' :
                                                                'text-blue-700'
                                                        }`}>
                                                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={record.remarks}
                                                    onChange={(e) => {
                                                        const newList = [...attendanceList];
                                                        newList[index].remarks = e.target.value;
                                                        setAttendanceList(newList);
                                                    }}
                                                    placeholder="Optional remarks..."
                                                    className="w-full bg-transparent border-b border-transparent focus:border-primary text-sm focus:outline-none transition-colors"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsAttendanceModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitAttendance}
                                disabled={submittingAttendance}
                                className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-soft-purple transition-all flex items-center gap-2">
                                {submittingAttendance ? 'Saving...' : 'Save Attendance'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
