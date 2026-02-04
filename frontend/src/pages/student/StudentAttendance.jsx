import React, { useState, useEffect } from 'react';
import { getCurrentUser, getStudentAttendance } from '../../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, isToday } from 'date-fns';
// Mock data removed in favor of real data


export default function StudentAttendance() {
    const [user, setUser] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
                if (userData?.id) {
                    const records = await getStudentAttendance(userData.id);
                    setAttendanceRecords(records);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Process data for UI
    const totalLectures = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length; // Assuming late counts as present
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
    const attendancePercentage = totalLectures > 0 ? ((presentCount / totalLectures) * 100).toFixed(1) : 0;

    // Course Breakdown
    const courseStats = {};
    attendanceRecords.forEach(record => {
        const courseName = record.session?.course?.title || 'Unknown Course';
        if (!courseStats[courseName]) {
            courseStats[courseName] = { total: 0, present: 0 };
        }
        courseStats[courseName].total++;
        if (record.status === 'present' || record.status === 'late') {
            courseStats[courseName].present++;
        }
    });

    const courseBreakdown = Object.entries(courseStats).map(([name, stats], index) => ({
        name,
        percentage: Math.round((stats.present / stats.total) * 100),
        color: ['bg-primary', 'bg-orange-400', 'bg-green-500', 'bg-blue-500'][index % 4], // Rotate colors
        text: ['text-primary', 'text-orange-500', 'text-green-500', 'text-blue-500'][index % 4]
    }));

    // Calendar Data
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add padding days for start of month grid
    const startDay = getDay(monthStart); // 0 = Sunday
    const paddingDays = Array(startDay).fill(null);

    const getDayStatus = (date) => {
        // Find if there was a session on this day
        // This logic simplifies multiple sessions per day to just one status priority
        const dayRecords = attendanceRecords.filter(r => isSameDay(new Date(r.session.start_time), date));

        if (dayRecords.length === 0) return null;
        if (dayRecords.some(r => r.status === 'absent')) return 'absent';
        if (dayRecords.some(r => r.status === 'present')) return 'present';
        return 'no-class'; // Should not reach here if records exist
    };




    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
                <div className="flex items-center gap-8">
                    <h1 className="text-xl font-bold text-gray-900">Attendance</h1>
                    <div className="flex bg-gray-50 p-1 rounded-xl">
                        <button className="px-4 py-1.5 text-xs font-semibold bg-white shadow-sm rounded-lg text-primary">Current Semester</button>
                        <button className="px-4 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900">Custom Range</button>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-1"></div>
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
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all border border-gray-100/50">
                            <p className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">Average Attendance %</p>
                            <h3 className="text-4xl font-extrabold text-primary">{attendancePercentage}%</h3>
                            <div className="mt-4 flex items-center gap-1 text-green-600 text-xs font-bold">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                <span>Based on {totalLectures} sessions</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all border border-gray-100/50">
                            <p className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">Total Classes Present</p>
                            <h3 className="text-4xl font-extrabold text-primary">{presentCount}</h3>
                            <p className="mt-4 text-gray-400 text-xs font-medium">Out of {totalLectures} total lectures</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all border border-gray-100/50">
                            <p className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">Classes Missed</p>
                            <h3 className="text-4xl font-extrabold text-primary">{absentCount}</h3>
                            <p className="mt-4 text-red-400 text-xs font-medium">Unexplained absences</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 bg-white rounded-2xl shadow-card border border-gray-100/50 overflow-hidden">
                            <div className="glass-panel p-6 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h3 className="font-bold text-gray-900 text-lg">{format(currentDate, 'MMMM yyyy')}</h3>
                                    <div className="flex gap-2">
                                        <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
                                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                                        </button>
                                        <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
                                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <span className="text-xs text-gray-500 font-medium">Present</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        <span className="text-xs text-gray-500 font-medium">Absent</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                                        <span className="text-xs text-gray-500 font-medium">No Class</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-7 gap-y-8 text-center">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{day}</div>
                                    ))}

                                    {/* Padding for start of month */}
                                    {paddingDays.map((_, i) => <div key={`pad-${i}`} />)}

                                    {calendarDays.map((date, index) => {
                                        const status = getDayStatus(date);
                                        const statusColor = status === 'present' ? 'bg-green-500' :
                                            status === 'absent' ? 'bg-red-500' : '';

                                        const isCurrentMonth = isSameMonth(date, currentDate);
                                        const isTodayDate = isToday(date);

                                        return (
                                            <div key={index} className={`h-16 flex flex-col items-center justify-center group cursor-pointer relative ${isTodayDate ? 'bg-primary/5 rounded-2xl' : ''}`}>
                                                <span className={`text-sm ${isTodayDate ? 'font-bold text-primary' : isCurrentMonth ? 'font-bold text-gray-800' : 'font-medium text-gray-300'}`}>
                                                    {format(date, 'd')}
                                                </span>
                                                {status && (
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusColor} mt-1`}></span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100/50">
                                <h3 className="font-bold text-gray-900 text-lg mb-6">Course Breakdown</h3>
                                <div className="space-y-6">
                                    {courseBreakdown.map(course => (
                                        <div key={course.name}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold text-sm text-gray-800">{course.name}</h4>
                                                <span className={`text-xs font-bold ${course.text}`}>{course.percentage}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${course.color} rounded-full`} style={{ width: `${course.percentage}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-glow p-6 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <h4 className="font-bold text-base mb-2">Attendance Policy</h4>
                                <p className="text-xs text-indigo-100 leading-relaxed mb-4">Maintain at least 75% attendance to be eligible for final examinations.</p>
                                <button className="text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">Download PDF</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-card border border-gray-100/50 overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-lg">Attendance History</h3>
                            <button className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
                                Export Records <span className="material-symbols-outlined text-sm">download</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Course</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {attendanceRecords.map((record, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${record.status === 'present' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                                                        }`}></span>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-800">{record.session?.course?.title || 'Unknown'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{format(new Date(record.session?.start_time || record.created_at), 'MMM d, yyyy')}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {record.session?.start_time && record.session?.end_time
                                                    ? `${(new Date(record.session.end_time) - new Date(record.session.start_time)) / (1000 * 60 * 60)}h`
                                                    : '1h'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">{record.remarks || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
