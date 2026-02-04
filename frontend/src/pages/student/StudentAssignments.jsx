import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/api';
import { assignmentMetrics, assignmentsList } from '../../mock/assignmentsData';

export default function StudentAssignments() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user", error);
            }
        };
        fetchUser();
    }, []);

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
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
                                src={user?.profile_image || "https://ui-avatars.com/api/?name=" + (user?.full_name || "User") + "&background=random"} 
                            />
                            <span className="material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                        </button>
                    </div>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-8 scroll-smooth bg-background-light">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {assignmentMetrics.map((metric, index) => (
                            <div key={index} className={`bg-white p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow border border-gray-100/50 flex flex-col justify-between group ${metric.color === 'primary' ? 'border-primary/10 bg-primary/5' : ''}`}>
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-gray-500 text-sm font-medium">{metric.title}</p>
                                        {metric.icon && (
                                            <div className={`p-2 rounded-lg ${metric.color === 'primary' ? 'bg-primary/20 text-primary' : metric.color === 'indigo' ? 'bg-indigo-50 text-indigo-500' : 'bg-orange-50 text-orange-500'}`}>
                                                <span className="material-symbols-outlined text-[20px]">{metric.icon}</span>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className={`text-4xl font-bold ${metric.color === 'primary' ? 'text-primary' : 'text-gray-900'} mb-1`}>
                                        {metric.value}
                                        {metric.subValue && <span className={`text-lg font-medium ${metric.color === 'primary' ? 'text-primary/70' : 'text-gray-400'}`}> {metric.subValue}</span>}
                                    </h3>
                                    {metric.trend && (
                                        <p className="text-xs font-semibold text-green-600 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                            {metric.trend}
                                        </p>
                                    )}
                                    {metric.subText && <p className="text-xs text-gray-500">{metric.subText}</p>}
                                </div>
                                {metric.type === 'chart' && (
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-4">
                                        <div className="bg-green-500 h-full rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-100">
                            <button className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-semibold shadow-md shadow-primary/20 transition-all">All</button>
                            <button className="px-6 py-2 text-gray-500 hover:bg-white hover:text-primary rounded-xl text-sm font-medium transition-all hover:shadow-sm">Pending</button>
                            <button className="px-6 py-2 text-gray-500 hover:bg-white hover:text-primary rounded-xl text-sm font-medium transition-all hover:shadow-sm">Submitted</button>
                            <button className="px-6 py-2 text-gray-500 hover:bg-white hover:text-primary rounded-xl text-sm font-medium transition-all hover:shadow-sm">Graded</button>
                        </div>
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-bold text-gray-900">5</span> assignments
                        </div>
                    </div>

                    {/* Assignments List */}
                    <div className="space-y-4">
                        {assignmentsList.map((assignment) => (
                            <div key={assignment.id} className="bg-white rounded-[16px] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 course-card-shadow hover:-translate-y-1 transition-transform duration-300 group border border-transparent hover:border-primary/10">
                                <div className="flex flex-col gap-2 min-w-[320px]">
                                    <div className="flex items-center gap-2.5">
                                        <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-600 border border-gray-200 font-serif">{assignment.type}</span>
                                        <span className="text-xs text-gray-400 font-medium tracking-wide">{assignment.institution}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{assignment.title}</h3>
                                        <p className="text-sm text-gray-500 mt-0.5">Course: {assignment.course}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-8 md:gap-12 flex-1">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Due Date</p>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-400 text-[18px]">event</span>
                                            <span className="text-sm font-semibold text-gray-700">{assignment.dueDate}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full bg-${assignment.statusColor}-500`}></div>
                                            <span className={`text-sm font-bold text-${assignment.statusColor}-600`}>{assignment.status}</span>
                                        </div>
                                    </div>
                                    {assignment.score ? (
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Score</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-gray-900">{assignment.score}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold bg-${assignment.statusColor}-100 text-${assignment.statusColor}-700`}>{assignment.grade}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="ml-auto md:ml-0">
                                            <span className={`text-xs font-bold ${assignment.statusColor === 'red' ? 'text-red-500 bg-red-50' : 'text-orange-500 bg-orange-50'} px-3 py-1.5 rounded-full border ${assignment.statusColor === 'red' ? 'border-red-100' : 'border-orange-100'}`}>
                                                {assignment.dueText}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full md:w-auto flex justify-end">
                                    <button className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${assignment.btnColor === 'primary' ? 'bg-primary text-white shadow-primary/30 hover:bg-primary-dark' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
                                        {assignment.icon && <span className="material-symbols-outlined text-[18px]">{assignment.icon}</span>}
                                        {assignment.action}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
