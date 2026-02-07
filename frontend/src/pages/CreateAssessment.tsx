import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import assessmentsService from '../services/assessments';
import { getCourses, getBatches } from '../services/api';

interface Course {
    id: string | number;
    title: string;
    [key: string]: any;
}

interface Batch {
    id: string | number;
    course_id: number;
    batch_name?: string;
    name?: string;
    [key: string]: any;
}

interface Question {
    id: number | string;
    text: string;
    type: string;
    options: string[];
    correctOption?: number;
    correctAnswer?: number | string;
    points: number | string;
    difficulty?: string;
    category?: string;
    codeSnippet?: string;
    expectedAnswer?: string;
    pictureFile?: File;
    pictureUrl?: string;
}

interface Settings {
    title: string;
    timeLimitHrs: number | string;
    timeLimitMins: number | string;
    passingScore: number | string;
    shuffleQuestions: boolean;
    showResults: boolean;
    dueDate: string;
    totalMarks: number;
    audience: string;
}

export default function CreateAssessment() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    // State for Dynamic Selection
    // State for Dynamic Selection
    const [courses, setCourses] = useState<Course[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedBatch, setSelectedBatch] = useState<string>('');

    // Settings
    const [settings, setSettings] = useState<Settings>({
        title: '',
        timeLimitHrs: 0,
        timeLimitMins: 30,
        passingScore: 70,
        shuffleQuestions: false,
        showResults: true,
        dueDate: '',
        totalMarks: 100, // Calculated dynamically from questions
        audience: 'Entire Class'
    });

    // Questions - Start with empty array, users will add their own questions
    const [questions, setQuestions] = useState<Question[]>([]);

    // Fetch Courses on Mount
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getCourses();
                const courseList = Array.isArray(data) ? data : (data.data || []);
                setCourses(courseList);
                if (courseList.length > 0) setSelectedCourse(courseList[0].id);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            }
        };
        fetchCourses();
    }, []);

    // Fetch Batches when Course Changes
    useEffect(() => {
        const fetchBatches = async () => {
            if (!selectedCourse) return;
            try {
                const data = await getBatches();
                const batchList = Array.isArray(data) ? data : (data.data || []);
                const filteredBatches = batchList.filter((b: Batch) => b.course_id === parseInt(selectedCourse));
                setBatches(filteredBatches);
                if (filteredBatches.length > 0) setSelectedBatch(filteredBatches[0].id);
                else setSelectedBatch('');
            } catch (error) {
                console.error("Failed to fetch batches", error);
            }
        };
        fetchBatches();
    }, [selectedCourse]);

    // Handle imported questions from Question Bank
    useEffect(() => {
        if (location.state?.importedQuestions) {
            const importedQuestions = location.state.importedQuestions.map((q: any) => ({
                id: Date.now() + Math.random(), // Generate new unique ID
                text: q.text,
                type: q.type || 'Multiple Choice',
                options: q.options || ['Option 1', 'Option 2'],
                correctOption: q.correctOption !== undefined ? q.correctOption : q.correctAnswer,
                points: q.points || 5,
                difficulty: q.difficulty,
                category: q.category,
                codeSnippet: q.codeSnippet
            }));
            setQuestions(prev => [...prev, ...importedQuestions]);
            // Clear the location state
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);


    // Handlers
    const handleSettingChange = (field: keyof Settings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleQuestionChange = (id: number | string, field: keyof Question, value: any) => {
        setQuestions(questions.map(q => {
            if (q.id === id) {
                let updatedQuestion = { ...q, [field]: value };

                // Auto-fill for True/False
                if (field === 'type' && value === 'True/False') {
                    updatedQuestion.options = ['True', 'False'];
                    updatedQuestion.correctOption = 0;
                }

                // Initialize code snippet field
                if (field === 'type' && value === 'Code Snippet') {
                    updatedQuestion.codeSnippet = updatedQuestion.codeSnippet || '';
                    updatedQuestion.expectedAnswer = updatedQuestion.expectedAnswer || '';
                    updatedQuestion.options = [];
                }

                // Reset to Multiple Choice defaults
                if (field === 'type' && value === 'Multiple Choice' && q.type !== 'Multiple Choice') {
                    updatedQuestion.options = ['Option 1', 'Option 2'];
                    updatedQuestion.correctOption = 0;
                }

                return updatedQuestion;
            }
            return q;
        }));
    };

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: Date.now(),
                text: '',
                type: 'Multiple Choice',
                options: ['Option 1', 'Option 2'],
                points: 5
            }
        ]);
    };

    const handleRemoveQuestion = (id: number | string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleOptionChange = (qId: number | string, idx: number, val: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOpts = [...q.options];
                newOpts[idx] = val;
                return { ...q, options: newOpts };
            }
            return q;
        }));
    };

    const handleAddOption = (qId: number | string) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q));
    };

    const handleRemoveOption = (qId: number | string, idx: number) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, options: q.options.filter((_, i) => i !== idx) } : q));
    };

    const handleImageUpload = (qId: number | string, file: File) => {
        if (!file) return;

        // Create object URL for preview
        const previewUrl = URL.createObjectURL(file);

        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return {
                    ...q,
                    pictureFile: file,
                    pictureUrl: previewUrl
                };
            }
            return q;
        }));
    };


    const handlePublish = async () => {
        setLoading(true);
        try {
            // Validate required fields
            if (!settings.title || !selectedCourse || !selectedBatch) {
                alert('Please fill in all required fields: Title, Course, and Batch');
                setLoading(false);
                return;
            }

            if (questions.length === 0) {
                alert('Please add at least one question');
                setLoading(false);
                return;
            }

            // Calculate total marks from questions
            const totalMarks = questions.reduce((sum, q) => sum + (parseInt(q.points) || 0), 0);

            // Prepare quiz settings payload
            const assessmentPayload = {
                title: settings.title,
                course_id: parseInt(selectedCourse),
                batch_id: parseInt(selectedBatch),
                type: 'quiz',
                total_marks: totalMarks,
                due_date: settings.dueDate || null,
                time_limit_minutes: parseInt(settings.timeLimitHrs || 0) * 60 + parseInt(settings.timeLimitMins || 0),
                passing_score: parseInt(settings.passingScore || 70),
                shuffle_questions: settings.shuffleQuestions || false,
                show_results_immediately: settings.showResults !== undefined ? settings.showResults : true,
                assigned_to: settings.audience === 'Entire Class' ? 'entire_batch' : 'specific_students',
                questions: {
                    questions: questions.map((q, index) => ({
                        id: q.id || `q_${index}`,
                        questionNumber: index + 1,
                        text: q.text || '',
                        type: q.type || 'MCQ',
                        options: q.options || [],
                        correctOption: q.correctOption !== undefined ? q.correctOption : null,
                        correctAnswer: q.correctOption !== undefined ? q.correctOption : null,
                        points: parseInt(q.points) || 0,
                        codeSnippet: q.codeSnippet || null,
                        expectedAnswer: q.expectedAnswer || null,
                        pictureUrl: q.pictureUrl || null
                    }))
                }
            };

            console.log('Publishing assessment:', assessmentPayload);
            await assessmentsService.createAssessment(assessmentPayload);
            alert('Assessment Published Successfully!');
            navigate('/assessment');
        } catch (error: any) {
            console.error('Error publishing assessment:', error);
            alert(`Failed to publish assessment: ${error.response?.data?.detail || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const totalPoints = questions.reduce((sum, q) => sum + (parseInt(q.points) || 0), 0);

    return (
        <div className="flex flex-col h-full overflow-hidden relative bg-background-light font-display text-[#120f1a]">
            {/* Header */}
            <header className="h-16 bg-white/95 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <nav className="flex items-center text-sm font-medium">
                        <span onClick={() => navigate('/assessment')} className="text-gray-500 hover:text-primary transition-colors cursor-pointer">Assessments</span>
                        <span className="material-symbols-outlined text-gray-400 mx-2 text-base">chevron_right</span>
                        <span className="text-gray-900 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">Create New Quiz</span>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-medium mr-2 flex items-center">
                        <span className="material-symbols-outlined text-base mr-1">cloud_done</span>
                        Saved
                    </span>
                    <button onClick={() => navigate('/assessment')} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-xl transition-all">
                        Save & Exit
                    </button>
                    <button onClick={handlePublish} className="px-6 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-xl transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">{loading ? 'sync' : 'publish'}</span>
                        Publish Quiz
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Settings */}
                <aside className="w-80 bg-white border-r border-gray-100 flex flex-col overflow-y-auto hidden xl:flex shrink-0">
                    <div className="p-6 border-b border-gray-50 sticky top-0 bg-white z-10">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">tune</span>
                            Quiz Settings
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Quiz Title</label>
                            <input
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900"
                                placeholder="Enter quiz title" type="text"
                                value={settings.title}
                                onChange={(e) => handleSettingChange('title', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Associated Course</label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 appearance-none"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                >
                                    <option value="">Select a Course</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Time Limit</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-center"
                                        type="number"
                                        value={settings.timeLimitHrs}
                                        onChange={(e) => handleSettingChange('timeLimitHrs', e.target.value)}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">hrs</span>
                                </div>
                                <div className="relative flex-1">
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-center"
                                        type="number"
                                        value={settings.timeLimitMins}
                                        onChange={(e) => handleSettingChange('timeLimitMins', e.target.value)}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">min</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Passing Score</label>
                            <div className="relative">
                                <input
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    type="number"
                                    value={settings.passingScore}
                                    onChange={(e) => handleSettingChange('passingScore', e.target.value)}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Assign To</label>
                            <div className="space-y-3">
                                <div className={`p-3 rounded-lg border transition-all ${settings.audience === 'Entire Class' ? 'border-primary bg-primary-light/10 ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                                        <input
                                            checked={settings.audience === 'Entire Class'}
                                            onChange={() => handleSettingChange('audience', 'Entire Class')}
                                            className="text-primary focus:ring-primary border-gray-300" name="audience" type="radio"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900">Entire Batch</span>
                                            <span className="text-xs text-gray-500">All students in selected batch</span>
                                        </div>
                                    </label>

                                    {/* Batch Selector - Only visible when Entire Class is selected */}
                                    {settings.audience === 'Entire Class' && (
                                        <div className="ml-7 mt-2 animate-fadeIn">
                                            <div className="relative">
                                                <select
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 appearance-none"
                                                    value={selectedBatch}
                                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                                    disabled={!selectedCourse}
                                                >
                                                    <option value="">Select a Batch</option>
                                                    {batches.map(b => <option key={b.id} value={b.id}>{b.batch_name || b.name}</option>)}
                                                </select>
                                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm">expand_more</span>
                                            </div>
                                            {!selectedCourse && <div className="text-[10px] text-red-500 mt-1">Please select a course first</div>}
                                        </div>
                                    )}
                                </div>

                                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${settings.audience === 'Specific Students' ? 'border-primary bg-primary-light/10' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        checked={settings.audience === 'Specific Students'}
                                        onChange={() => handleSettingChange('audience', 'Specific Students')}
                                        className="text-primary focus:ring-primary border-gray-300" name="audience" type="radio"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900">Specific Students</span>
                                        <span className="text-xs text-gray-500">Select individual students</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium text-gray-700">Shuffle Questions</label>
                                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input
                                        type="checkbox"
                                        name="toggle"
                                        id="toggle1"
                                        checked={settings.shuffleQuestions}
                                        onChange={(e) => handleSettingChange('shuffleQuestions', e.target.checked)}
                                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 transition-all duration-300 checked:right-0 checked:border-primary"
                                    />
                                    <label htmlFor="toggle1" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${settings.shuffleQuestions ? 'bg-primary' : 'bg-gray-300'}`}></label>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Show Results Immediately</label>
                                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input
                                        type="checkbox"
                                        name="toggle"
                                        id="toggle2"
                                        checked={settings.showResults}
                                        onChange={(e) => handleSettingChange('showResults', e.target.checked)}
                                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 transition-all duration-300 checked:right-0 checked:border-primary"
                                    />
                                    <label htmlFor="toggle2" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${settings.showResults ? 'bg-primary' : 'bg-gray-300'}`}></label>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content: Question Builder */}
                <section className="flex-1 bg-background-light overflow-y-auto relative scroll-smooth p-4 md:p-8 lg:p-12">
                    <div className="max-w-3xl mx-auto space-y-6 pb-24">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-serif font-bold text-gray-900">Question Builder</h1>
                            <p className="text-gray-500 mt-1">Design your questions and set correct answers.</p>
                        </div>

                        {questions.map((q, index) => (
                            <div key={q.id} className="bg-white rounded-[16px] shadow-card hover:shadow-deep-purple transition-shadow border border-gray-100 overflow-hidden group">
                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-gray-400 cursor-move">drag_indicator</span>
                                        <span className="text-sm font-bold text-gray-700">Question {index + 1}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <select
                                                className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:border-primary focus:ring-0"
                                                value={q.type}
                                                onChange={(e) => handleQuestionChange(q.id, 'type', e.target.value)}
                                            >
                                                <option>Multiple Choice</option>
                                                <option>Short Answer</option>
                                                <option>True/False</option>
                                                <option>Code Snippet</option>
                                            </select>
                                        </div>
                                        <div className="h-4 w-px bg-gray-300 mx-1"></div>
                                        <button onClick={() => handleRemoveQuestion(q.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                        <button className="text-gray-400 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-400">Question Text</label>
                                        <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
                                                <button className="p-1 hover:bg-gray-200 rounded text-gray-500"><span className="material-symbols-outlined text-lg">format_bold</span></button>
                                                <button className="p-1 hover:bg-gray-200 rounded text-gray-500"><span className="material-symbols-outlined text-lg">format_italic</span></button>
                                                <button className="p-1 hover:bg-gray-200 rounded text-gray-500"><span className="material-symbols-outlined text-lg">format_underlined</span></button>
                                                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                                <>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleImageUpload(q.id, e.target.files[0]);
                                                            }
                                                        }}
                                                        className="hidden"
                                                        id={`picture-upload-toolbar-${q.id}`}
                                                    />
                                                    <label
                                                        htmlFor={`picture-upload-toolbar-${q.id}`}
                                                        className="p-1 hover:bg-gray-200 rounded text-gray-500 cursor-pointer flex items-center"
                                                        title="Upload image for this question"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">image</span>
                                                    </label>
                                                </>
                                            </div>
                                            <textarea
                                                className="w-full p-4 text-sm text-gray-800 outline-none h-32 resize-none"
                                                placeholder="Enter your question here..."
                                                value={q.text}
                                                onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                                            />
                                        </div>
                                        {/* Image Preview (for any question type) */}
                                        {q.pictureUrl && (
                                            <div className="mt-3 relative group">
                                                <img
                                                    src={q.pictureUrl}
                                                    alt="Question"
                                                    className="w-full max-h-80 object-contain bg-gray-50 rounded-lg border border-gray-200"
                                                />
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <label
                                                        htmlFor={`picture-upload-toolbar-${q.id}`}
                                                        className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-primary text-xs font-semibold rounded-lg cursor-pointer hover:bg-white shadow-sm border border-gray-200 flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                                                        Change
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {q.type === 'Multiple Choice' && (
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase text-gray-400 flex justify-between">
                                                <span>Answer Options</span>
                                                <span className="text-green-600">Select correct answer</span>
                                            </label>
                                            {q.options.map((opt, optIndex) => (
                                                <div key={optIndex} className="flex items-center gap-3 group/option">
                                                    <input
                                                        className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                                                        type="radio"
                                                        name={`q${q.id}_ans`}
                                                        checked={q.correctOption === optIndex}
                                                        onChange={() => handleQuestionChange(q.id, 'correctOption', optIndex)}
                                                    />
                                                    <input
                                                        className={`flex-1 px-4 py-2 border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none ${q.correctOption === optIndex ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'bg-white border-gray-200'}`}
                                                        type="text"
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(q.id, optIndex, e.target.value)}
                                                    />
                                                    {q.correctOption === optIndex && <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>}
                                                    <button onClick={() => handleRemoveOption(q.id, optIndex)} className="opacity-0 group-hover/option:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                                                        <span className="material-symbols-outlined text-lg">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                            <button onClick={() => handleAddOption(q.id)} className="text-sm font-semibold text-primary hover:text-primary-dark mt-2 flex items-center gap-1 pl-8">
                                                <span className="material-symbols-outlined text-lg">add</span>
                                                Add Another Option
                                            </button>
                                        </div>
                                    )}

                                    {/* True/False Question Type */}
                                    {q.type === 'True/False' && (
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase text-gray-400 flex justify-between">
                                                <span>Answer Options</span>
                                                <span className="text-green-600">Select correct answer</span>
                                            </label>
                                            {q.options?.map((opt, optIndex) => (
                                                <div key={optIndex} className="flex items-center gap-3">
                                                    <input
                                                        className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                                                        type="radio"
                                                        name={`q${q.id}_ans`}
                                                        checked={q.correctOption === optIndex}
                                                        onChange={() => handleQuestionChange(q.id, 'correctOption', optIndex)}
                                                    />
                                                    <div className={`flex-1 px-4 py-2 border rounded-lg text-sm font-medium ${q.correctOption === optIndex ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-gray-200 text-gray-700'}`}>
                                                        {opt}
                                                    </div>
                                                    {q.correctOption === optIndex && <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>}
                                                </div>
                                            ))}
                                            <p className="text-xs text-gray-500 pl-8">Note: True/False options cannot be modified</p>
                                        </div>
                                    )}

                                    {/* Code Snippet Question Type */}
                                    {q.type === 'Code Snippet' && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-gray-400">Code Editor</label>
                                                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-900">
                                                    <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 flex items-center gap-2">
                                                        <div className="flex gap-2">
                                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                        </div>
                                                        <span className="text-xs text-gray-400 ml-2">code.js</span>
                                                    </div>
                                                    <textarea
                                                        className="w-full p-4 font-mono text-sm bg-gray-900 text-gray-100 outline-none resize-none"
                                                        placeholder="// Paste or write code here...
function example() {
  return 'Hello, World!';
}"
                                                        value={q.codeSnippet || ''}
                                                        onChange={(e) => handleQuestionChange(q.id, 'codeSnippet', e.target.value)}
                                                        rows={12}
                                                        style={{ tabSize: 2 }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-gray-400">Expected Answer/Output</label>
                                                <textarea
                                                    className="w-full p-4 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                                    placeholder="Enter the expected answer, output, or solution explanation..."
                                                    value={q.expectedAnswer || ''}
                                                    onChange={(e) => handleQuestionChange(q.id, 'expectedAnswer', e.target.value)}
                                                    rows={4}
                                                />
                                            </div>
                                        </div>
                                    )}



                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between -mx-6 -mb-6 mt-4">
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <span className="text-xs font-semibold text-gray-600">Points:</span>
                                                <input
                                                    className="w-16 px-2 py-1 text-center bg-white border border-gray-300 rounded-md text-sm font-bold text-gray-900 focus:border-primary focus:ring-0"
                                                    type="number"
                                                    value={q.points}
                                                    onChange={(e) => handleQuestionChange(q.id, 'points', e.target.value)}
                                                />
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-gray-500">Required</span>
                                            <div className="relative inline-block w-8 align-middle select-none">
                                                <input defaultChecked className="absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-primary transition-all duration-300" type="checkbox" />
                                                <div className="block overflow-hidden h-4 rounded-full bg-gray-300 cursor-pointer checked:bg-primary"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button onClick={handleAddQuestion} className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 font-semibold flex items-center justify-center gap-2 hover:border-primary hover:text-primary hover:bg-primary-light/20 transition-all duration-300 group">
                            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
                            Add New Question
                        </button>

                        <button onClick={() => navigate('/quiz-bank-import')} className="w-full py-4 rounded-2xl border-2 border-primary bg-primary-light/20 text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all duration-300 group">
                            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">library_add</span>
                            Import from Question Bank
                        </button>
                    </div>
                </section>

                {/* Right Sidebar: Preview Mode */}
                <aside className="w-80 bg-white border-l border-gray-100 hidden lg:flex flex-col relative shrink-0">
                    <div className="p-6 border-b border-gray-50">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-gray-900">Preview Mode</span>
                            <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" id="preview_toggle" name="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 transition-all duration-300 checked:right-0 checked:border-primary" />
                                <label htmlFor="preview_toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer checked:bg-primary"></label>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">View quiz as a student</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="bg-background-light rounded-2xl p-5 mb-6 border border-gray-100 shadow-inner">
                            <h4 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider">Quiz Summary</h4>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Total Questions</span>
                                <span className="text-sm font-bold text-gray-900">{questions.length}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-600">Total Points</span>
                                <span className="text-sm font-bold text-gray-900">{totalPoints}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-primary h-1.5 rounded-full w-1/3"></div>
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-[10px] text-gray-400">Completeness</span>
                                <span className="text-[10px] font-bold text-primary">35%</span>
                            </div>
                        </div>
                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider">Question Outline</h4>
                        <div className="space-y-3 relative">
                            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100 -z-10"></div>
                            {questions.map((q, idx) => (
                                <div key={q.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => document.getElementById(`q-${q.id}`)?.scrollIntoView({ behavior: 'smooth' })}>
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-primary/30 z-10">{idx + 1}</div>
                                    <div className="flex-1 bg-white p-2.5 rounded-lg border border-primary/20 shadow-sm">
                                        <div className="text-xs font-bold text-gray-900 truncate">{q.text || 'New Question'}</div>
                                        <div className="text-[10px] text-gray-500">{q.type === 'Multiple Choice' ? 'MCQ' : 'Text'} • {q.points} pts</div>
                                    </div>
                                </div>
                            ))}
                            <div className="flex items-center gap-3 group cursor-pointer opacity-40 hover:opacity-100 transition-opacity" onClick={handleAddQuestion}>
                                <div className="w-8 h-8 rounded-full bg-white border border-dashed border-gray-300 text-gray-400 flex items-center justify-center z-10">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </div>
                                <div className="text-xs font-medium text-gray-400 italic">Add next...</div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
