import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import assessmentsService from '../services/assessments';

export default function AssessmentDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [assessment, setAssessment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Assessment with Submissions
                const data = await assessmentsService.getAssessmentSubmissions(id);
                setAssessment(data);
                setSubmissions(data.submissions || []);
            } catch (error) {
                console.error("Failed to fetch assessment details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading assessment details...</p>
            </div>
        </div>
    );

    if (!assessment) return <div className="p-8 text-center">Assessment not found.</div>;

    // Helper functions
    const getInitials = (name) => {
        return name ? name.match(/(\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase() : '??';
    };

    const getGrade = (percentage) => {
        if (percentage >= 90) return { grade: 'A', color: 'green' };
        if (percentage >= 85) return { grade: 'A-', color: 'green' };
        if (percentage >= 80) return { grade: 'B+', color: 'blue' };
        if (percentage >= 75) return { grade: 'B', color: 'blue' };
        if (percentage >= 70) return { grade: 'B-', color: 'blue' };
        if (percentage >= 65) return { grade: 'C+', color: 'yellow' };
        if (percentage >= 60) return { grade: 'C', color: 'yellow' };
        return { grade: 'F', color: 'red' };
    };

    // Calculate stats
    const totalStudents = assessment.total_students || 0;
    const submittedCount = assessment.submitted_count || 0;
    const averageScore = assessment.average_score ?? 0;
    const attendanceRate = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;

    const gradedSubmissions = submissions.filter(s => 
        s.marks_obtained !== null && 
        s.marks_obtained !== undefined &&
        s.total_marks !== null &&
        s.total_marks !== undefined &&
        s.total_marks > 0
    );
    const highestScore = gradedSubmissions.length > 0
        ? Math.max(...gradedSubmissions.map(s => (s.marks_obtained / s.total_marks) * 100))
        : 0;

    // Filter submissions
    const filteredSubmissions = submissions.filter(sub =>
        sub.student_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            {/* Top Navbar */}
            <header className="flex items-center justify-between border-b border-[#ebe8f2] dark:border-white/10 bg-white dark:bg-[#1c1826] px-8 py-4 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/assessment')}
                        className="size-9 rounded-lg border border-[#ebe8f2] dark:border-white/10 flex items-center justify-center hover:bg-background-light dark:hover:bg-white/5 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold tracking-tight">{assessment.title}</h2>
                        <p className="text-xs text-[#655393] dark:text-[#a394c7]">
                            Course: {assessment.course_name} ({assessment.batch_name})
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                        <span className="material-symbols-outlined text-[20px]">ios_share</span>
                        <span>Export Results</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
                <div className="max-w-[1200px] mx-auto w-full space-y-8">
                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-[#1c1826] rounded-xl p-6 border border-[#ebe8f2] dark:border-white/5 shadow-soft-purple">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-sm font-medium text-[#655393] dark:text-[#a394c7]">Total Attended</p>
                                <span className="material-symbols-outlined text-primary/40">groups</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold tracking-tight">{submittedCount}/{totalStudents}</p>
                                <span className="text-xs font-semibold text-green-500 bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded">
                                    {attendanceRate}%
                                </span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1c1826] rounded-xl p-6 border border-[#ebe8f2] dark:border-white/5 shadow-soft-purple">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-sm font-medium text-[#655393] dark:text-[#a394c7]">Class Average Score</p>
                                <span className="material-symbols-outlined text-primary/40">query_stats</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold tracking-tight">{Math.round(averageScore)}%</p>
                                <span className="text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                    Average
                                </span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1c1826] rounded-xl p-6 border border-[#ebe8f2] dark:border-white/5 shadow-soft-purple">
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-sm font-medium text-[#655393] dark:text-[#a394c7]">Highest Score</p>
                                <span className="material-symbols-outlined text-primary/40">emoji_events</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold tracking-tight">{highestScore !== null && highestScore !== undefined && !isNaN(highestScore) ? Math.round(highestScore) : 0}%</p>
                                <span className="text-xs font-semibold text-[#655393] dark:text-[#a394c7]">Top Score</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Table Section */}
                    <div className="bg-white dark:bg-[#1c1826] rounded-xl border border-[#ebe8f2] dark:border-white/5 shadow-soft-purple overflow-hidden">
                        {/* Control Bar */}
                        <div className="p-4 border-b border-[#ebe8f2] dark:border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#655393] dark:text-[#a394c7] text-xl">search</span>
                                <input
                                    className="w-full bg-background-light dark:bg-white/5 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-[#655393] dark:placeholder:text-[#a394c7]"
                                    placeholder="Search student name or ID..."
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-background-light dark:bg-white/5 px-4 text-sm font-medium">
                                    <span>Grade Range</span>
                                    <span className="material-symbols-outlined text-lg">expand_more</span>
                                </button>
                                <button className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-background-light dark:bg-white/5 px-4 text-sm font-medium">
                                    <span>Submission Status</span>
                                    <span className="material-symbols-outlined text-lg">expand_more</span>
                                </button>
                                <button className="size-10 flex items-center justify-center rounded-lg bg-background-light dark:bg-white/5 hover:bg-primary/5 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">filter_list</span>
                                </button>
                            </div>
                        </div>

                        {/* Table Container */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-background-light/50 dark:bg-white/5 text-[11px] uppercase tracking-wider font-bold text-[#655393] dark:text-[#a394c7]">
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Submission Date</th>
                                        <th className="px-6 py-4">Duration</th>
                                        <th className="px-6 py-4">Score</th>
                                        <th className="px-6 py-4 text-center">Grade</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#ebe8f2] dark:divide-white/5">
                                    {filteredSubmissions.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-[#655393] dark:text-[#a394c7]">
                                                No submissions found.
                                            </td>
                                        </tr>
                                    )}
                                    {filteredSubmissions.map((sub) => {
                                        const percentage = (sub.marks_obtained !== null && 
                                                           sub.marks_obtained !== undefined &&
                                                           sub.total_marks !== null &&
                                                           sub.total_marks !== undefined &&
                                                           sub.total_marks > 0)
                                            ? Math.round((sub.marks_obtained / sub.total_marks) * 100)
                                            : 0;
                                        const gradeInfo = getGrade(percentage);
                                        const hasSubmitted = sub.submitted_at !== null;
                                        const submittedDate = hasSubmitted ? new Date(sub.submitted_at) : null;

                                        return (
                                            <tr key={sub.student_id} className="hover:bg-background-light/30 dark:hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary border-2 border-white dark:border-white/10 shadow-sm">
                                                            {getInitials(sub.student_name)}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold">{sub.student_name}</span>
                                                            <span className="text-[11px] text-[#655393] dark:text-[#a394c7]">ID: #{sub.student_id}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {hasSubmitted ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-sm">
                                                                {submittedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                            <span className="text-[11px] text-[#655393] dark:text-[#a394c7]">
                                                                {submittedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm italic text-[#655393] dark:text-[#a394c7]">--</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    {hasSubmitted ? '--' : '--'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold">
                                                        {sub.marks_obtained !== null && sub.marks_obtained !== undefined ? sub.marks_obtained : 0}
                                                        {sub.total_marks !== null && sub.total_marks !== undefined ? `/${sub.total_marks}` : ''}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center justify-center size-8 rounded-lg font-bold text-xs border ${gradeInfo.color === 'green' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/20' :
                                                            gradeInfo.color === 'blue' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' :
                                                                gradeInfo.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20' :
                                                                    'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'
                                                        }`}>
                                                        {gradeInfo.grade}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {hasSubmitted ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider">
                                                            <span className="size-1.5 rounded-full bg-primary"></span>
                                                            Submitted
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold uppercase tracking-wider">
                                                            <span className="size-1.5 rounded-full bg-red-600"></span>
                                                            Missing
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {hasSubmitted ? (
                                                            <>
                                                                <button
                                                                    onClick={() => navigate(`/student/submission/${assessment.id}?student=${sub.student_id}`)}
                                                                    className="size-8 rounded-lg flex items-center justify-center hover:bg-primary/10 hover:text-primary text-[#655393] dark:text-[#a394c7] transition-all"
                                                                    title="View Submission"
                                                                >
                                                                    <span className="material-symbols-outlined text-xl">visibility</span>
                                                                </button>
                                                                <button
                                                                    className="size-8 rounded-lg flex items-center justify-center hover:bg-primary/10 hover:text-primary text-[#655393] dark:text-[#a394c7] transition-all"
                                                                    title="Feedback"
                                                                >
                                                                    <span className="material-symbols-outlined text-xl">chat_bubble</span>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button className="px-3 h-8 rounded-lg flex items-center justify-center bg-background-light dark:bg-white/5 hover:bg-primary text-[#655393] dark:text-[#a394c7] hover:text-white transition-all text-xs font-bold">
                                                                SEND REMINDER
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Pagination */}
                        <div className="p-4 border-t border-[#ebe8f2] dark:border-white/5 flex items-center justify-between">
                            <p className="text-xs text-[#655393] dark:text-[#a394c7]">
                                Showing 1-{filteredSubmissions.length} of {totalStudents} students
                            </p>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 rounded border border-[#ebe8f2] dark:border-white/10 text-sm font-medium hover:bg-background-light dark:hover:bg-white/5 disabled:opacity-50" disabled>
                                    Previous
                                </button>
                                <button className="px-3 py-1.5 rounded border border-[#ebe8f2] dark:border-white/10 text-sm font-medium bg-primary text-white">
                                    1
                                </button>
                                <button className="px-3 py-1.5 rounded border border-[#ebe8f2] dark:border-white/10 text-sm font-medium hover:bg-background-light dark:hover:bg-white/5">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
