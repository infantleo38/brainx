import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import questionBankService from '../services/questionBankService';
import { getCourses } from '../services/api';

export default function QuizBankImport() {
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [previewQuestion, setPreviewQuestion] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        categories: [],
        difficulties: [],
        questionTypes: [],
        courseId: null
    });

    // Fetch courses on mount
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getCourses();
                const courseList = Array.isArray(data) ? data : (data.data || []);
                setCourses(courseList);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            }
        };
        fetchCourses();
    }, []);

    // Fetch questions from bank
    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        console.log('=== fetchQuestions called ===');
        setLoading(true);
        try {
            const filterParams = {
                search: searchQuery || undefined,
                course_id: filters.courseId || undefined,
                difficulty: filters.difficulties.length > 0 ? filters.difficulties[0] : undefined,
                question_type: filters.questionTypes.length > 0 ? filters.questionTypes[0] : undefined
            };

            console.log('Filter params:', filterParams);

            const response = await questionBankService.getAllQuestions(filterParams);
            console.log('Raw API Response:', response);
            console.log('Response type:', typeof response);
            console.log('Response keys:', response ? Object.keys(response) : 'null');

            // Handle different possible response structures
            let questionsList = [];
            if (response) {
                if (Array.isArray(response)) {
                    // If response is directly an array
                    questionsList = response;
                } else if (response.questions) {
                    // If response has a questions property
                    questionsList = response.questions;
                } else if (response.data && response.data.questions) {
                    // If response is wrapped in data
                    questionsList = response.data.questions;
                }
            }

            console.log('Extracted questions:', questionsList.length);

            setQuestions(questionsList);
            setFilteredQuestions(questionsList);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            console.error('Error details:', error.message);
            console.error('Error response:', error.response);
            setQuestions([]);
            setFilteredQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle filter changes
    useEffect(() => {
        fetchQuestions();
    }, [filters, searchQuery]);

    const handleFilterChange = (filterType, value, checked) => {
        setFilters(prev => {
            const newFilters = { ...prev };

            if (filterType === 'courseId') {
                newFilters.courseId = value === 'all' ? null : value;
            } else {
                if (checked) {
                    newFilters[filterType] = [...prev[filterType], value];
                } else {
                    newFilters[filterType] = prev[filterType].filter(item => item !== value);
                }
            }

            return newFilters;
        });
    };

    const handleQuestionSelect = (question) => {
        setSelectedQuestions(prev => {
            const isSelected = prev.find(q => q.id === question.id && q.assessment_id === question.assessment_id);
            if (isSelected) {
                return prev.filter(q => !(q.id === question.id && q.assessment_id === question.assessment_id));
            } else {
                return [...prev, question];
            }
        });
    };

    const isQuestionSelected = (question) => {
        return selectedQuestions.some(q => q.id === question.id && q.assessment_id === question.assessment_id);
    };

    const handlePreview = (question) => {
        setPreviewQuestion(question);
        setShowPreview(true);
    };

    const handleImport = () => {
        // Navigate back to CreateAssessment with selected questions
        navigate('/create-assessment', { state: { importedQuestions: selectedQuestions } });
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' };
            case 'medium': return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100' };
            case 'hard': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' };
            default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100' };
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden relative bg-background-light font-display text-[#120f1a]">
            {/* Header */}
            <header className="h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-4">
                    <nav className="flex items-center text-sm font-medium">
                        <span onClick={() => navigate('/assessment')} className="text-gray-500 hover:text-primary transition-colors cursor-pointer">Assessments</span>
                        <span className="material-symbols-outlined text-gray-400 mx-2 text-base">chevron_right</span>
                        <span onClick={() => navigate('/create-assessment')} className="text-gray-500 hover:text-primary transition-colors cursor-pointer">Create New Quiz</span>
                        <span className="material-symbols-outlined text-gray-400 mx-2 text-base">chevron_right</span>
                        <span className="text-gray-900 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 font-bold">Import from Bank</span>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/create-assessment')} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-xl transition-all">
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={selectedQuestions.length === 0}
                        className="px-6 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Done
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Filters */}
                <aside className="w-72 bg-white border-r border-gray-100 flex flex-col overflow-y-auto">
                    <div className="p-6 border-b border-gray-50 bg-white sticky top-0 z-10">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">filter_list</span>
                            Filters
                        </h3>
                    </div>
                    <div className="p-6 space-y-8">
                        {/* Category Filter */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Category</h4>
                            <div className="space-y-3">
                                {['Algorithms', 'Data Structures', 'Operating Systems', 'Databases', 'Networks'].map(category => (
                                    <label key={category} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20"
                                            checked={filters.categories.includes(category)}
                                            onChange={(e) => handleFilterChange('categories', category, e.target.checked)}
                                        />
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">{category}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Difficulty Filter */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Difficulty</h4>
                            <div className="space-y-3">
                                {['Easy', 'Medium', 'Hard'].map(difficulty => (
                                    <label key={difficulty} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20"
                                            checked={filters.difficulties.includes(difficulty)}
                                            onChange={(e) => handleFilterChange('difficulties', difficulty, e.target.checked)}
                                        />
                                        <span className="text-sm font-medium text-gray-700">{difficulty}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Question Type Filter */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Question Type</h4>
                            <div className="space-y-3">
                                {['Multiple Choice', 'True/False', 'Short Answer', 'Code Snippet'].map(type => (
                                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20"
                                            checked={filters.questionTypes.includes(type)}
                                            onChange={(e) => handleFilterChange('questionTypes', type, e.target.checked)}
                                        />
                                        <span className="text-sm font-medium text-gray-700">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Course Association Filter */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Course Association</h4>
                            <select
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none"
                                value={filters.courseId || 'all'}
                                onChange={(e) => handleFilterChange('courseId', e.target.value === 'all' ? null : parseInt(e.target.value))}
                            >
                                <option value="all">All Courses</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </aside>

                {/* Main Content: Questions */}
                <section className="flex-1 bg-background-light overflow-y-auto relative p-8">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Search Bar */}
                        <div className="relative group">
                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                            <input
                                className="w-full pl-14 pr-6 py-5 bg-white border border-transparent rounded-[16px] shadow-glow focus:ring-4 focus:ring-primary/10 focus:border-primary/20 outline-none text-gray-900 font-medium text-lg transition-all placeholder:text-gray-300"
                                placeholder="Search specific keywords or concepts..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Results Count */}
                        <div className="flex items-center justify-between px-2">
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-bold text-gray-900">{filteredQuestions.length}</span> results
                                {searchQuery && <span className="font-bold text-primary italic"> for "{searchQuery}"</span>}
                            </p>
                        </div>

                        {/* Question Cards */}
                        <div className="space-y-4 pb-32">
                            {loading ? (
                                <div className="text-center py-12">
                                    <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
                                    <p className="text-gray-500 mt-4">Loading questions...</p>
                                </div>
                            ) : filteredQuestions.length === 0 ? (
                                <div className="text-center py-12">
                                    <span className="material-symbols-outlined text-gray-300 text-6xl">quiz</span>
                                    <p className="text-gray-500 mt-4">No questions found</p>
                                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or creating some assessments first</p>
                                </div>
                            ) : (
                                filteredQuestions.map((question, index) => {
                                    const difficultyStyle = getDifficultyColor(question.difficulty);
                                    const isSelected = isQuestionSelected(question);

                                    return (
                                        <div key={`${question.assessment_id}-${question.id}-${index}`} className={`question-card bg-white p-6 rounded-[16px] border transition-all flex gap-6 items-start ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100'}`}>
                                            <div className="pt-1">
                                                <input
                                                    checked={isSelected}
                                                    onChange={() => handleQuestionSelect(question)}
                                                    className="w-6 h-6 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                                                    type="checkbox"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    {question.difficulty && (
                                                        <span className={`px-2 py-0.5 ${difficultyStyle.bg} ${difficultyStyle.text} text-[10px] font-bold rounded uppercase tracking-wider border ${difficultyStyle.border}`}>
                                                            {question.difficulty}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        • {question.category || question.course_name}
                                                    </span>
                                                </div>
                                                <h4 className="text-base font-medium text-gray-900 leading-relaxed">
                                                    {question.text}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-semibold rounded-full border border-gray-100">
                                                        {question.type || 'MCQ'}
                                                    </span>
                                                    <span className="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-semibold rounded-full border border-gray-100">
                                                        {question.points} points
                                                    </span>
                                                    <span className="px-2 py-1 bg-primary-light text-primary text-[10px] font-semibold rounded-full border border-primary/20">
                                                        From: {question.assessment_title}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handlePreview(question)}
                                                className="px-4 py-2 text-sm font-semibold text-primary bg-primary-light/50 hover:bg-primary hover:text-white rounded-xl transition-all flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-lg">visibility</span>
                                                Preview
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Selection Footer */}
                    {selectedQuestions.length > 0 && (
                        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8 z-50">
                            <div className="bg-white/80 backdrop-blur-xl border border-gray-200 shadow-deep-purple rounded-2xl px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <span className="text-primary font-bold">{selectedQuestions.length}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Questions Selected</p>
                                        <p className="text-xs text-gray-500">Ready to import to your assessment</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleImport}
                                    className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[20px]">download</span>
                                    Import Selected to Quiz
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* Preview Drawer */}
            {showPreview && previewQuestion && (
                <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-deep-purple z-50 border-l border-gray-100 flex flex-col transition-transform duration-300 ${showPreview ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Question Preview</h3>
                        <button
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            onClick={() => setShowPreview(false)}
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto space-y-6">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary-light px-2 py-1 rounded">
                                {previewQuestion.type || 'Multiple Choice'}
                            </span>
                            <h4 className="mt-4 text-lg font-medium text-gray-900 leading-relaxed">
                                {previewQuestion.text}
                            </h4>
                        </div>
                        {previewQuestion.type === 'Multiple Choice' && previewQuestion.options && (
                            <div className="space-y-3">
                                {previewQuestion.options.map((option, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-xl border text-sm ${idx === previewQuestion.correctOption || idx === previewQuestion.correctAnswer
                                            ? 'border-2 border-primary bg-primary-light/30 font-semibold text-primary flex items-center justify-between'
                                            : 'border-gray-200 text-gray-700'
                                            }`}
                                    >
                                        {option}
                                        {(idx === previewQuestion.correctOption || idx === previewQuestion.correctAnswer) && (
                                            <span className="material-symbols-outlined text-primary">check_circle</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {previewQuestion.explanation && (
                            <div className="pt-6 border-t border-gray-100">
                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Explanation</h5>
                                <p className="text-sm text-gray-600 leading-relaxed">{previewQuestion.explanation}</p>
                            </div>
                        )}
                        <div className="pt-6 border-t border-gray-100">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Details</h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Points:</span>
                                    <span className="font-semibold text-gray-900">{previewQuestion.points}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Source:</span>
                                    <span className="font-semibold text-gray-900 text-right">{previewQuestion.assessment_title}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Course:</span>
                                    <span className="font-semibold text-gray-900">{previewQuestion.course_name}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
