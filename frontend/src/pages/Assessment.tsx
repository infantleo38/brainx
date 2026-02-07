import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import assessmentsService from '../services/assessments';

interface Assessment {
    id: number | string;
    title: string;
    type: string;
    course_name: string;
    batch_name: string;
    due_date?: string;
    total_marks: number;
    [key: string]: any;
}

export default function Assessment() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                const data = await assessmentsService.getAssessments();
                const dataList = Array.isArray(data) ? data : (data.data || []);
                setAssessments(dataList);
            } catch (error) {
                console.error("Failed to fetch assessments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssessments();
    }, []);

    return (
        <div className="h-full overflow-y-auto scroll-smooth p-4 md:p-8">
            <div className="max-w-[1600px] mx-auto w-full space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Assessments Overview</h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">Manage and track assessment performance across all batches.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
                            <span className="material-symbols-outlined text-lg">download</span>
                            <span>Export All Data</span>
                        </button>
                        <button
                            onClick={() => navigate('/assessment/create')}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors text-sm font-medium">
                            <span className="material-symbols-outlined text-lg">add</span>
                            <span>Create Assessment</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#15202b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex gap-4 items-center">
                            <div className="relative w-full sm:w-80">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                                <input
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400"
                                    placeholder="Search assessment..."
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wide border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap">Assessment Title</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Course</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Batch</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Due Date</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Total Marks</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {loading && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading assessments...</td>
                                    </tr>
                                )}
                                {!loading && assessments.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No assessments found. Create one to get started.</td>
                                    </tr>
                                )}
                                {assessments.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase())).map((assessment) => (
                                    <tr key={assessment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900 dark:text-white">{assessment.title}</span>
                                                <span className="text-xs text-slate-500">{assessment.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{assessment.course_name}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{assessment.batch_name}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            {assessment.due_date ? new Date(assessment.due_date).toLocaleDateString() : 'No Due Date'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{assessment.total_marks}</td>

                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/assessment/${assessment.id}`)}
                                                className="text-primary hover:text-blue-700 dark:hover:text-blue-400 font-medium text-xs border border-primary/20 hover:border-primary px-3 py-1.5 rounded transition-all">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
