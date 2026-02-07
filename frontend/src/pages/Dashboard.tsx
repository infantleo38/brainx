import React from 'react';
import { Link } from 'react-router-dom';


export default function Dashboard() {
    return (
        <div className="max-w-7xl mx-auto w-full space-y-8 p-4 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Student Performance Report</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="size-2 rounded-full bg-green-500"></span>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Active Student • <span className="font-medium text-slate-700 dark:text-slate-300">Sophia Williams</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#15202b] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-lg">calendar_month</span>
                        <span>Fall 2024</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                        <span className="material-symbols-outlined text-lg">download</span>
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>
            {/* Grid 1: Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-[#15202b] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-primary">school</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">GPA / Grade</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">3.85</h3>
                        <span className="text-sm font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">+0.2</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '96%' }}></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">A</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#15202b] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-emerald-500">checklist</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Attendance Rate</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">96%</h3>
                        <span className="text-sm font-medium text-slate-400">Present</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96%' }}></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Excellent</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#15202b] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-amber-500">assignment_turned_in</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Assignments</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">42<span className="text-xl text-slate-400 font-normal">/45</span></h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">92%</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#15202b] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-purple-500">analytics</span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Assessment Avg</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">88%</h3>
                        <span className="text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">-2%</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: '88%' }}></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">B+</span>
                    </div>
                </div>
            </div>
            {/* Grid 2: Charts and Attendance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-[#15202b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">monitoring</span>
                            Performance Overview
                        </h3>
                        <div className="flex items-center gap-4 text-xs font-medium">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                <span className="size-2 rounded-full bg-primary"></span>
                                Student
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <span className="size-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                Class Avg
                            </div>
                        </div>
                    </div>
                    <div className="relative h-64 w-full">
                        <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-400 border-l border-b border-slate-100 dark:border-slate-700 pl-2 pb-6 box-border">
                            <span>100</span>
                            <span>80</span>
                            <span>60</span>
                            <span>40</span>
                            <span>20</span>
                            <span>0</span>
                        </div>
                        <svg className="absolute inset-0 w-full h-full pt-2 pb-6 pl-8 pr-2" preserveAspectRatio="none" viewBox="0 0 100 50">
                            <line stroke="currentColor" strokeOpacity="0.05" vectorEffect="non-scaling-stroke" x1="0" x2="100" y1="0" y2="0"></line>
                            <line stroke="currentColor" strokeOpacity="0.05" vectorEffect="non-scaling-stroke" x1="0" x2="100" y1="12.5" y2="12.5"></line>
                            <line stroke="currentColor" strokeOpacity="0.05" vectorEffect="non-scaling-stroke" x1="0" x2="100" y1="25" y2="25"></line>
                            <line stroke="currentColor" strokeOpacity="0.05" vectorEffect="non-scaling-stroke" x1="0" x2="100" y1="37.5" y2="37.5"></line>
                            <polyline className="opacity-50" fill="none" points="0,20 16,22 32,18 48,15 64,18 80,12 100,14" stroke="#94a3b8" strokeDasharray="4 2" strokeWidth="2" vectorEffect="non-scaling-stroke"></polyline>
                            <polyline className="drop-shadow-sm" fill="none" points="0,25 16,18 32,10 48,12 64,5 80,8 100,4" stroke="#138aec" strokeWidth="3" vectorEffect="non-scaling-stroke"></polyline>
                            <circle cx="0" cy="25" fill="white" r="3" stroke="#138aec" strokeWidth="2" vectorEffect="non-scaling-stroke"></circle>
                            <circle cx="16" cy="18" fill="white" r="3" stroke="#138aec" strokeWidth="2" vectorEffect="non-scaling-stroke"></circle>
                            <circle cx="32" cy="10" fill="white" r="3" stroke="#138aec" strokeWidth="2" vectorEffect="non-scaling-stroke"></circle>
                            <circle cx="48" cy="12" fill="white" r="3" stroke="#138aec" strokeWidth="2" vectorEffect="non-scaling-stroke"></circle>
                            <circle cx="64" cy="5" fill="white" r="3" stroke="#138aec" strokeWidth="2" vectorEffect="non-scaling-stroke"></circle>
                            <circle cx="80" cy="8" fill="white" r="3" stroke="#138aec" strokeWidth="2" vectorEffect="non-scaling-stroke"></circle>
                            <circle cx="100" cy="4" fill="white" r="3" stroke="#138aec" strokeWidth="2" vectorEffect="non-scaling-stroke"></circle>
                        </svg>
                        <div className="absolute bottom-0 left-0 right-0 pl-8 flex justify-between text-xs text-slate-500 font-medium">
                            <span>Aug</span>
                            <span>Sep</span>
                            <span>Oct 1</span>
                            <span>Oct 15</span>
                            <span>Nov 1</span>
                            <span>Nov 15</span>
                            <span>Dec</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#15202b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-500">event_available</span>
                            Attendance
                        </h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center gap-6">
                        <div className="relative size-40">
                            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3"></path>
                                <path className="text-emerald-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="96, 100" strokeLinecap="round" strokeWidth="3"></path>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">96<span className="text-lg">%</span></span>
                                <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Present</span>
                            </div>
                        </div>
                        <div className="w-full">
                            <div className="flex justify-between items-end h-16 gap-2">
                                <div className="flex-1 flex flex-col items-center gap-1 group">
                                    <div className="w-full bg-emerald-100 dark:bg-emerald-900/20 rounded-t-sm h-full relative overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-emerald-400 rounded-t-sm transition-all group-hover:bg-emerald-500" style={{ height: '100%' }}></div>
                                    </div>
                                    <span className="text-[10px] text-slate-400">Aug</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-1 group">
                                    <div className="w-full bg-emerald-100 dark:bg-emerald-900/20 rounded-t-sm h-full relative overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-emerald-400 rounded-t-sm transition-all group-hover:bg-emerald-500" style={{ height: '95%' }}></div>
                                    </div>
                                    <span className="text-[10px] text-slate-400">Sep</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-1 group">
                                    <div className="w-full bg-emerald-100 dark:bg-emerald-900/20 rounded-t-sm h-full relative overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-emerald-400 rounded-t-sm transition-all group-hover:bg-emerald-500" style={{ height: '85%' }}></div>
                                    </div>
                                    <span className="text-[10px] text-slate-400">Oct</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-1 group">
                                    <div className="w-full bg-emerald-100 dark:bg-emerald-900/20 rounded-t-sm h-full relative overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-emerald-400 rounded-t-sm transition-all group-hover:bg-emerald-500" style={{ height: '98%' }}></div>
                                    </div>
                                    <span className="text-[10px] text-slate-400">Nov</span>
                                </div>
                                <div className="flex-1 flex flex-col items-center gap-1 group">
                                    <div className="w-full bg-emerald-100 dark:bg-emerald-900/20 rounded-t-sm h-full relative overflow-hidden">
                                        <div className="absolute bottom-0 w-full bg-emerald-400 rounded-t-sm transition-all group-hover:bg-emerald-500" style={{ height: '100%' }}></div>
                                    </div>
                                    <span className="text-[10px] text-slate-400">Dec</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Grid 3: Mastery and Results */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#15202b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">pentagon</span>
                            Subject Mastery
                        </h3>
                    </div>
                    <div className="relative w-full aspect-square max-w-[300px] mx-auto flex items-center justify-center">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
                            <polygon className="dark:stroke-slate-700" fill="none" points="50,10 90,40 75,90 25,90 10,40" stroke="#e2e8f0" strokeWidth="1"></polygon>
                            <polygon className="dark:stroke-slate-700" fill="none" points="50,26 74,44 65,74 35,74 26,44" stroke="#e2e8f0" strokeWidth="1"></polygon>
                            <polygon className="dark:stroke-slate-700" fill="none" points="50,42 58,50 54,60 46,60 42,50" stroke="#e2e8f0" strokeWidth="1"></polygon>
                            <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeWidth="1" x1="50" x2="50" y1="50" y2="10"></line>
                            <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeWidth="1" x1="50" x2="90" y1="50" y2="40"></line>
                            <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeWidth="1" x1="50" x2="75" y1="50" y2="90"></line>
                            <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeWidth="1" x1="50" x2="25" y1="50" y2="90"></line>
                            <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeWidth="1" x1="50" x2="10" y1="50" y2="40"></line>
                            <polygon fill="rgba(19, 138, 236, 0.2)" points="50,15 85,42 60,80 30,85 15,45" stroke="#138aec" strokeWidth="2"></polygon>
                            <text className="text-[8px] fill-slate-500 font-bold uppercase" textAnchor="middle" x="50" y="5">Math</text>
                            <text className="text-[8px] fill-slate-500 font-bold uppercase" textAnchor="start" x="95" y="40">Science</text>
                            <text className="text-[8px] fill-slate-500 font-bold uppercase" textAnchor="middle" x="80" y="98">Arts</text>
                            <text className="text-[8px] fill-slate-500 font-bold uppercase" textAnchor="middle" x="20" y="98">History</text>
                            <text className="text-[8px] fill-slate-500 font-bold uppercase" textAnchor="end" x="5" y="40">English</text>
                        </svg>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-[#15202b] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500">table_chart</span>
                            Recent Assessment Results
                        </h3>
                        <a className="text-sm text-primary font-medium hover:underline" href="#">View All</a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4">Assessment</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-blue-500"></span> Math
                                    </td>
                                    <td className="px-6 py-4">Algebra II Midterm</td>
                                    <td className="px-6 py-4">Oct 12, 2024</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">94 / 100</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-slate-500 text-xs">Graded</span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-emerald-500"></span> Science
                                    </td>
                                    <td className="px-6 py-4">Biology Lab Report</td>
                                    <td className="px-6 py-4">Oct 10, 2024</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">88 / 100</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-slate-500 text-xs">Graded</span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-amber-500"></span> History
                                    </td>
                                    <td className="px-6 py-4">World War I Essay</td>
                                    <td className="px-6 py-4">Oct 05, 2024</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">78 / 100</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-slate-500 text-xs">Graded</span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-purple-500"></span> English
                                    </td>
                                    <td className="px-6 py-4">Poetry Analysis</td>
                                    <td className="px-6 py-4">Oct 01, 2024</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">92 / 100</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-slate-500 text-xs">Graded</span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-pink-500"></span> Arts
                                    </td>
                                    <td className="px-6 py-4">Perspective Sketch</td>
                                    <td className="px-6 py-4">Sep 28, 2024</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">--</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-primary text-xs font-medium">Pending Review</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
