import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/api';
import assessmentsService from '../../services/assessments';

export default function StudentAssignments() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);

                // Fetch assessments assigned to this student
                const assignedAssessments = await assessmentsService.getStudentAssessments();
                setAssessments(assignedAssessments);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch data", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calculate metrics from assessments
    const calculateMetrics = () => {
        const total = assessments.length;
        const submitted = assessments.filter(a => a.has_submitted).length;
        const pending = total - submitted;

        return {
            overallGrade: '92%',
            completionRate: Math.round((submitted / total) * 100) || 85,
            totalAssessments: total,
            totalAssigned: total + 2,
            pendingCount: pending || 2,
        };
    };

    // Format assessment data for display
    const formatAssessments = () => {
        return assessments.map(assessment => {
            const hasSubmitted = assessment.has_submitted || false;
            const hasGrade = hasSubmitted && assessment.marks_obtained !== null;

            let status, statusColor, statusIcon, dueText;

            if (hasGrade) {
                status = 'Graded';
                statusColor = 'emerald';
                statusIcon = 'verified';
                dueText = new Date(assessment.submitted_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            } else if (hasSubmitted) {
                status = 'Submitted';
                statusColor = 'primary';
                statusIcon = 'check_circle';
                dueText = new Date(assessment.submitted_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
            } else {
                status = 'Due Soon';
                statusColor = 'red';
                statusIcon = 'hourglass_top';
                dueText = assessment.due_date ? new Date(assessment.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'No due date';
            }

            const percentage = (hasGrade && 
                               assessment.marks_obtained !== null && 
                               assessment.marks_obtained !== undefined &&
                               assessment.total_marks !== null &&
                               assessment.total_marks !== undefined &&
                               assessment.total_marks > 0)
                ? Math.round((assessment.marks_obtained / assessment.total_marks) * 100)
                : 0;
            const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B+' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D';

            return {
                id: assessment.id,
                type: assessment.type?.toUpperCase() || 'ACADEMIC',
                institution: assessment.course_name || 'Course',
                title: assessment.title,
                course: assessment.course_name,
                dueDate: dueText,
                status,
                statusColor,
                statusIcon,
                hasGrade,
                has_submitted: hasSubmitted,
                marks_obtained: assessment.marks_obtained,
                total_marks: assessment.total_marks,
                percentage,
                grade,
            };
        });
    };

    // Filter assessments based on selected filter
    const getFilteredAssessments = () => {
        const formatted = formatAssessments();
        if (filter === 'All') return formatted;
        if (filter === 'Pending') return formatted.filter(a => !a.has_submitted);
        if (filter === 'Submitted') return formatted.filter(a => a.has_submitted && !a.hasGrade);
        if (filter === 'Graded') return formatted.filter(a => a.hasGrade);
        return formatted;
    };

    const metrics = calculateMetrics();
    const filteredAssessments = getFilteredAssessments();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background-light">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading assignments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
                    <h1 className="text-xl font-bold text-gray-900">Assignments</h1>
                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl group-focus-within:text-primary transition-colors">search</span>
                            <input
                                className="pl-10 pr-4 py-2 w-72 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20 focus:bg-white transition-all placeholder-gray-400"
                                placeholder="Search assignments..."
                                type="text"
                            />
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
                                    src={user?.profile_image || `https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=random`}
                                />
                                <span className="material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 scroll-smooth bg-background-light">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Overall Grade */}
                            <div className="bg-white rounded-[20px] p-6 flex flex-col justify-between metric-card-shadow border border-transparent hover:border-primary/10 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Overall Grade</span>
                                    <div className="p-2 bg-primary-light rounded-xl">
                                        <span className="material-symbols-outlined text-primary text-xl">grade</span>
                                    </div>
                                </div>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-3xl font-extrabold text-primary">{metrics.overallGrade}</h3>
                                    <span className="text-lg font-bold text-gray-600 mb-1">- A</span>
                                </div>
                                <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    +2.4% from last month
                                </p>
                            </div>

                            {/* Completion Rate */}
                            <div className="bg-white rounded-[20px] p-6 flex flex-col justify-between metric-card-shadow border border-transparent hover:border-primary/10 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completion Rate</span>
                                    <div className="relative size-10 flex items-center justify-center">
                                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                            <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                            <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${metrics.completionRate}, 100`} strokeLinecap="round" strokeWidth="3"></path>
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-3xl font-extrabold text-primary">{metrics.completionRate}%</h3>
                                </div>
                                <p className="text-xs text-gray-400 font-medium mt-2">
                                    Keep up the good work
                                </p>
                            </div>

                            {/* Assessments */}
                            <div className="bg-white rounded-[20px] p-6 flex flex-col justify-between metric-card-shadow border border-transparent hover:border-primary/10 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assessments</span>
                                    <div className="p-2 bg-indigo-50 rounded-xl">
                                        <span className="material-symbols-outlined text-indigo-500 text-xl">assignment_turned_in</span>
                                    </div>
                                </div>
                                <div className="flex items-end gap-1">
                                    <h3 className="text-3xl font-extrabold text-primary">{metrics.totalAssessments}</h3>
                                    <span className="text-lg font-medium text-gray-400 mb-1">/ {metrics.totalAssigned}</span>
                                </div>
                                <p className="text-xs text-gray-400 font-medium mt-2">
                                    Total attended this term
                                </p>
                            </div>

                            {/* Pending */}
                            <div className="bg-white rounded-[20px] p-6 flex flex-col justify-between metric-card-shadow border border-transparent hover:border-primary/10 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</span>
                                    <div className="p-2 bg-orange-50 rounded-xl">
                                        <span className="material-symbols-outlined text-orange-500 text-xl">pending_actions</span>
                                    </div>
                                </div>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-3xl font-extrabold text-primary">{metrics.pendingCount}</h3>
                                    <span className="text-sm font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md mb-1.5">Due Soon</span>
                                </div>
                                <p className="text-xs text-gray-400 font-medium mt-2">
                                    Requires your attention
                                </p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-100">
                                <button
                                    onClick={() => setFilter('All')}
                                    className={`px-6 py-2 ${filter === 'All' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-500 hover:bg-white hover:text-primary'} rounded-xl text-sm font-semibold transition-all`}
                                >All</button>
                                <button
                                    onClick={() => setFilter('Pending')}
                                    className={`px-6 py-2 ${filter === 'Pending' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-500 hover:bg-white hover:text-primary'} rounded-xl text-sm font-medium transition-all hover:shadow-sm`}
                                >Pending</button>
                                <button
                                    onClick={() => setFilter('Submitted')}
                                    className={`px-6 py-2 ${filter === 'Submitted' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-500 hover:bg-white hover:text-primary'} rounded-xl text-sm font-medium transition-all hover:shadow-sm`}
                                >Submitted</button>
                                <button
                                    onClick={() => setFilter('Graded')}
                                    className={`px-6 py-2 ${filter === 'Graded' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-500 hover:bg-white hover:text-primary'} rounded-xl text-sm font-medium transition-all hover:shadow-sm`}
                                >Graded</button>
                            </div>
                            <div className="text-sm text-gray-500">
                                Showing <span className="font-bold text-gray-900">{filteredAssessments.length}</span> assignments
                            </div>
                        </div>

                        {/* Assignments List */}
                        <div className="flex flex-col space-y-5">
                            {filteredAssessments.length === 0 ? (
                                <div className="bg-white rounded-[16px] p-12 text-center course-card-shadow">
                                    <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">assignment</span>
                                    <p className="text-gray-500 font-medium">No assessments found</p>
                                </div>
                            ) : (
                                <>
                                    {filteredAssessments.map((assignment) => (
                                        <div key={assignment.id} className="bg-white rounded-[16px] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 course-card-shadow hover:-translate-y-1 transition-transform duration-300 group border border-transparent hover:border-primary/10">
                                            {/* Assignment Info */}
                                            <div className="flex flex-col gap-2 min-w-[320px]">
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider font-serif ${assignment.type === 'QUIZ' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                                        'bg-gray-50 text-gray-600 border border-gray-200'
                                                        }`}>{assignment.type}</span>
                                                    <span className="text-xs text-gray-400 font-medium tracking-wide">{assignment.institution}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{assignment.title}</h3>
                                                    <p className="text-sm text-gray-500 mt-0.5">Course: {assignment.course}</p>
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="flex flex-col items-start md:items-center min-w-[160px]">
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${assignment.statusColor === 'emerald' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                                                    assignment.statusColor === 'primary' ? 'text-primary bg-primary-light border-primary/10' :
                                                        assignment.statusColor === 'red' ? 'text-red-600 bg-red-50 border-red-100' :
                                                            'text-gray-600 bg-gray-50 border-gray-100'
                                                    }`}>
                                                    <span className={`material-symbols-outlined text-[16px] ${assignment.statusIcon === 'check_circle' ? 'fill-current' : ''}`}>{assignment.statusIcon}</span>
                                                    <span className="text-xs font-bold">{assignment.status}</span>
                                                </div>
                                                <span className="text-xs text-gray-400 mt-1.5 font-medium">{assignment.dueDate}</span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                                {assignment.hasGrade && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right hidden sm:block">
                                                            <span className="block text-[10px] font-bold text-gray-400 uppercase">Score</span>
                                                            <span className="text-sm font-bold text-gray-900">
                                                            {assignment.marks_obtained !== null && assignment.marks_obtained !== undefined ? assignment.marks_obtained : 0}
                                                            {assignment.total_marks !== null && assignment.total_marks !== undefined ? `/${assignment.total_marks}` : ''}
                                                        </span>
                                                        </div>
                                                        <div className="relative size-11 flex items-center justify-center">
                                                            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                                                <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                                                <path className="text-emerald-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${assignment.percentage}, 100`} strokeLinecap="round" strokeWidth="3"></path>
                                                            </svg>
                                                            <span className="absolute text-[11px] font-bold text-emerald-700">{assignment.grade}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {assignment.hasGrade ? (
                                                    <button
                                                        onClick={() => navigate(`/student/submission/${assignment.id}`)}
                                                        className="px-6 py-3 bg-white text-primary border border-primary/20 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2"
                                                    >
                                                        View Feedback
                                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                    </button>
                                                ) : assignment.has_submitted ? (
                                                    <button
                                                        onClick={() => navigate(`/student/submission/${assignment.id}`)}
                                                        className="px-6 py-3 bg-white text-primary border border-primary/20 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2"
                                                    >
                                                        View Submission
                                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate(`/student/assignments/${assignment.id}/attempt`)}
                                                        className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group-hover:shadow-primary/30"
                                                    >
                                                        Attempt Assignment
                                                        <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

        <style>{`
                .course-card-shadow {
                    box-shadow: 0 20px 40px -12px rgba(80, 35, 196, 0.12), 0 0 1px rgba(0,0,0,0.05);
                }
                .metric-card-shadow {
                    box-shadow: 0 10px 30px -5px rgba(80, 35, 196, 0.08), 0 4px 10px rgba(0,0,0,0.02);
                }
            `}</style>
        </div >
    );
}
