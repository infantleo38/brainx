import React, { useState } from 'react';
import { examQuestion } from '../../mock/examData';
import { useNavigate } from 'react-router-dom';

export default function StudentExam() {
    const navigate = useNavigate();
    const [selectedAnswer, setSelectedAnswer] = useState('O(2^n) - Exponential Time');

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background-light text-[#120f1a] font-display antialiased">
            <header className="h-20 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Midterm Exam</span>
                    <h1 className="text-xl font-bold text-gray-900 leading-none">Algorithm Complexity Midterm</h1>
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 bg-primary-light/50 px-6 py-2.5 rounded-2xl border border-primary/10">
                    <span className="material-symbols-outlined text-primary">timer</span>
                    <span className="text-xl font-bold text-primary font-mono tracking-wide">00:45:23</span>
                </div>
                <button 
                    onClick={() => navigate('/student/assignments')}
                    className="bg-primary text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary-dark hover:shadow-primary/40 transition-all flex items-center gap-2"
                >
                    Submit Exam
                    <span className="material-symbols-outlined text-sm">check</span>
                </button>
            </header>
            <div className="flex-1 flex overflow-hidden relative">
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background-light flex flex-col items-center">
                    <div className="w-full max-w-5xl flex flex-col h-full">
                        <div className="bg-white rounded-[20px] shadow-deep-purple border border-white/60 flex-1 flex flex-col p-6 md:p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{examQuestion.number}</h4>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-2 leading-tight">
                                        {examQuestion.text}
                                    </h2>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap">{examQuestion.points}</span>
                                    <button className="text-gray-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined">flag</span>
                                    </button>
                                </div>
                            </div>
                            <div className="bg-[#1e1b2e] rounded-xl p-6 mb-10 font-mono text-sm text-gray-300 shadow-inner border border-gray-800 relative z-10 group">
                                <div className="flex gap-1.5 mb-3 opacity-50">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <pre><code>{examQuestion.codeSnippet}</code></pre>
                            </div>
                            <div className="space-y-4 flex-1 relative z-10">
                                {examQuestion.options.map((option) => (
                                    <label key={option} className="block cursor-pointer group">
                                        <input 
                                            className="peer sr-only" 
                                            name="answer" 
                                            type="radio" 
                                            checked={selectedAnswer === option}
                                            onChange={() => setSelectedAnswer(option)}
                                        />
                                        <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${selectedAnswer === option ? 'border-[#5023c4] bg-[#f0edfa] shadow-sm ring-1 ring-primary/5' : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'}`}>
                                            <span className={`radio-circle w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${selectedAnswer === option ? 'border-[#5023c4] border-[5px]' : 'border-gray-300'}`}></span>
                                            <span className="text-base font-medium text-gray-700 group-hover:text-gray-900">{option}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between relative z-10">
                                <button className="text-gray-500 hover:text-primary font-semibold px-4 py-2 flex items-center gap-2 transition-colors rounded-lg hover:bg-gray-50">
                                    <span className="material-symbols-outlined">save</span> 
                                    Save Draft
                                </button>
                                <div className="flex items-center gap-4">
                                    <button className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:text-gray-900 transition-all">
                                        Previous Question
                                    </button>
                                    <button className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark hover:shadow-primary/30 transition-all flex items-center gap-2 group">
                                        Next Question 
                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 text-center text-gray-400 text-sm font-medium">
                            Protected by Premier Proctor™ • ID: 8493-2201
                        </div>
                    </div>
                </main>
                <aside className="w-72 bg-white border-l border-gray-100 flex flex-col z-40 shadow-[rgba(0,0,0,0.05)_0px_0px_20px] h-full overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900 text-lg">Question Navigator</h3>
                        <div className="grid grid-cols-2 gap-y-2 mt-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div> Current
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Answered
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div> Unanswered
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                <div className="w-2.5 h-2.5 rounded-full border border-orange-400 text-orange-400 flex items-center justify-center">
                                    <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                                </div> Flagged
                            </div>
                        </div>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-5 gap-3">
                            <button className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center hover:bg-emerald-200 transition-all">1</button>
                            <button className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center hover:bg-emerald-200 transition-all">2</button>
                            <button className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center hover:bg-emerald-200 transition-all">3</button>
                            <button className="w-10 h-10 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center ring-4 ring-primary/10 shadow-lg shadow-primary/30 scale-110 transition-all">4</button>
                            <button className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 font-semibold text-sm flex items-center justify-center hover:bg-gray-200 transition-all group relative">
                                5
                            </button>
                            <button className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 font-semibold text-sm flex items-center justify-center hover:bg-gray-200 transition-all">6</button>
                            <button className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 font-semibold text-sm flex items-center justify-center hover:bg-gray-200 transition-all border border-orange-300 relative">
                                7
                                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-400 rounded-full border border-white"></div>
                            </button>
                            {Array.from({ length: 13 }, (_, i) => i + 8).map(num => (
                                <button key={num} className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 font-semibold text-sm flex items-center justify-center hover:bg-gray-200 transition-all">
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-6 border-t border-gray-50 bg-gray-50/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">support_agent</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Need Help?</p>
                                <p className="text-xs text-gray-500">Contact Proctor</p>
                            </div>
                        </div>
                        <button className="w-full py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                            Report Issue
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
