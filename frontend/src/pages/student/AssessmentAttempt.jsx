import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCurrentUser } from '../../services/api';
import assessmentsService from '../../services/assessments';

export default function AssessmentAttempt() {
    const navigate = useNavigate();
    const { assignmentId } = useParams();
    const [user, setUser] = useState(null);
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

    // Fetch assessment data and questions
    useEffect(() => {
        const fetchAssessmentData = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);

                const assessmentData = await assessmentsService.getAssessmentWithQuestions(assignmentId);
                setAssessment(assessmentData);

                // Process questions
                let questionsArray = assessmentData.questions?.questions || [];

                // Add userAnswer and flagged properties
                questionsArray = questionsArray.map((q, index) => ({
                    ...q,
                    questionNumber: index + 1,
                    userAnswer: null,
                    flagged: false
                }));

                // Shuffle questions if enabled
                if (assessmentData.shuffle_questions) {
                    questionsArray = shuffleArray(questionsArray);
                    // Renumber after shuffle
                    questionsArray = questionsArray.map((q, index) => ({
                        ...q,
                        questionNumber: index + 1
                    }));
                }

                setQuestions(questionsArray);

                // Set time limit
                if (assessmentData.time_limit_minutes) {
                    setTimeRemaining(assessmentData.time_limit_minutes * 60);
                }

                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch assessment", error);
                alert("Failed to load assessment. Please try again.");
                navigate('/student/assignments');
            }
        };
        fetchAssessmentData();
    }, [assignmentId, navigate]);

    // Removed fullscreen functionality per user request

    // Timer countdown
    useEffect(() => {
        if (!assessment || loading || timeRemaining === 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [assessment, loading]);

    // Utility function to shuffle array
    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };



    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleAnswerSelect = (optionIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex].userAnswer = optionIndex;
        setQuestions(updatedQuestions);
    };

    const handleFlagQuestion = () => {
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex].flagged = !updatedQuestions[currentQuestionIndex].flagged;
        setQuestions(updatedQuestions);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleQuestionNavigate = (index) => {
        setCurrentQuestionIndex(index);
    };

    const handleSaveDraft = () => {
        // TODO: Implement save draft functionality
        alert('Draft saved successfully!');
    };

    const handleSubmitExam = async () => {
        const answeredCount = questions.filter(q => q.userAnswer !== null).length;
        if (!confirm(`You have answered ${answeredCount} out of ${questions.length} questions. Are you sure you want to submit?`)) {
            return;
        }

        try {
            // Prepare answers object
            const answers = {};
            questions.forEach(q => {
                answers[q.id.toString()] = q.userAnswer;
            });

            // Submit to backend
            const result = await assessmentsService.submitAssessment(assignmentId, answers);

            // Show results if enabled
            if (result.show_results) {
                alert(`Assessment submitted successfully!\n\nYour Score: ${result.marks_obtained}/${assessment.total_marks}\nPercentage: ${((result.marks_obtained / assessment.total_marks) * 100).toFixed(2)}%\n${result.marks_obtained >= (assessment.passing_score / 100) * assessment.total_marks ? 'Status: PASSED ✓' : 'Status: FAILED ✗'}`);
            } else {
                alert('Assessment submitted successfully! Results will be available later.');
            }

            navigate('/student/assignments');
        } catch (error) {
            console.error('Error submitting assessment:', error);
            alert('Failed to submit assessment. Please try again.');
        }
    };

    const handleAutoSubmitExam = async () => {
        try {
            // Prepare answers object
            const answers = {};
            questions.forEach(q => {
                answers[q.id.toString()] = q.userAnswer;
            });

            // Submit to backend
            await assessmentsService.submitAssessment(assignmentId, answers);

            navigate('/student/assignments');
        } catch (error) {
            console.error('Error auto-submitting assessment:', error);
            navigate('/student/assignments');
        }
    };

    const currentQuestion = questions[currentQuestionIndex];
    const answeredQuestions = questions.filter(q => q.userAnswer !== null).length;
    const flaggedQuestions = questions.filter(q => q.flagged).length;

    const getQuestionStatus = (index) => {
        const question = questions[index];
        if (index === currentQuestionIndex) return 'current';
        if (question.userAnswer !== null) return 'answered';
        if (question.flagged) return 'flagged';
        return 'unanswered';
    };

    if (loading || !assessment || questions.length === 0) {
        return (
            <div className="bg-background-light font-display text-[#120f1a] antialiased h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading assessment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light font-display text-[#120f1a] antialiased h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-20 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{assessment.type}</span>
                    <h1 className="text-xl font-bold text-gray-900 leading-none">{assessment.title}</h1>
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 bg-primary-light/50 px-6 py-2.5 rounded-2xl border border-primary/10">
                    <span className="material-symbols-outlined text-primary">timer</span>
                    <span className="text-xl font-bold text-primary font-mono tracking-wide">{formatTime(timeRemaining)}</span>
                </div>
                <button
                    onClick={handleSubmitExam}
                    className="bg-primary text-white px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary-dark hover:shadow-primary/40 transition-all flex items-center gap-2"
                >
                    Submit Exam
                    <span className="material-symbols-outlined text-sm">check</span>
                </button>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-background-light flex flex-col items-center">
                    <div className="w-full max-w-4xl flex flex-col h-full">
                        <div className="bg-white rounded-[24px] shadow-deep-purple border border-white/60 flex-1 flex flex-col p-8 md:p-12 relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            {/* Question Header */}
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                                        Question {currentQuestion.questionNumber} of {questions.length}
                                    </span>
                                    <div className="mb-6">
                                        <p className="text-lg font-semibold text-gray-900 leading-relaxed">
                                            {currentQuestion.text || currentQuestion.question || 'Question text not available'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 whitespace-nowrap">
                                        <span className="text-xs font-bold text-gray-500">{currentQuestion.points} Points</span>
                                    </div>
                                    <button
                                        onClick={handleFlagQuestion}
                                        className={`transition-colors ${currentQuestion.flagged ? 'text-orange-500' : 'text-gray-400 hover:text-primary'}`}
                                    >
                                        <span className="material-symbols-outlined">flag</span>
                                    </button>
                                </div>
                            </div>

                            {/* Code Snippet (if applicable) */}
                            {currentQuestion.codeSnippet && (
                                <div className="bg-[#1e1b2e] rounded-xl p-6 mb-10 font-mono text-sm text-gray-300 shadow-inner border border-gray-800 relative z-10 group">
                                    <div className="flex gap-1.5 mb-3 opacity-50">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <pre><code>{currentQuestion.codeSnippet}</code></pre>
                                </div>
                            )}

                            {/* Answer Options */}
                            <div className="space-y-4 flex-1 relative z-10">
                                {currentQuestion.options.map((option, index) => (
                                    <label key={index} className="block cursor-pointer group">
                                        <input
                                            className="peer sr-only"
                                            name="answer"
                                            type="radio"
                                            checked={currentQuestion.userAnswer === index}
                                            onChange={() => handleAnswerSelect(index)}
                                        />
                                        <div className={`flex items-center gap-5 p-5 rounded-2xl border transition-all duration-200 ${currentQuestion.userAnswer === index
                                            ? 'border-primary bg-primary-light shadow-sm ring-1 ring-primary/5'
                                            : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'
                                            }`}>
                                            <span className={`radio-circle w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all ${currentQuestion.userAnswer === index
                                                ? 'border-primary border-[6px]'
                                                : 'border-gray-300'
                                                }`}></span>
                                            <span className="text-lg font-medium text-gray-700 group-hover:text-gray-900">{option}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Navigation Controls */}
                            <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between relative z-10">
                                <button
                                    onClick={handleSaveDraft}
                                    className="text-gray-500 hover:text-primary font-semibold px-4 py-2 flex items-center gap-2 transition-colors rounded-lg hover:bg-gray-50"
                                >
                                    <span className="material-symbols-outlined">save</span>
                                    Save Draft
                                </button>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handlePreviousQuestion}
                                        disabled={currentQuestionIndex === 0}
                                        className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous Question
                                    </button>
                                    <button
                                        onClick={handleNextQuestion}
                                        disabled={currentQuestionIndex === questions.length - 1}
                                        className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark hover:shadow-primary/30 transition-all flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
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

                {/* Sidebar - Question Navigator */}
                <aside className="w-80 bg-white border-l border-gray-100 flex flex-col z-40 shadow-[rgba(0,0,0,0.05)_0px_0px_20px] h-full">
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
                            {questions.map((question, index) => {
                                const status = getQuestionStatus(index);
                                return (
                                    <button
                                        key={question.id}
                                        onClick={() => handleQuestionNavigate(index)}
                                        className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-all relative
                                            ${status === 'current' ? 'bg-primary text-white ring-4 ring-primary/10 shadow-lg shadow-primary/30 scale-110' : ''}
                                            ${status === 'answered' && status !== 'current' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : ''}
                                            ${status === 'unanswered' && status !== 'current' ? 'bg-gray-100 text-gray-500 font-semibold hover:bg-gray-200' : ''}
                                            ${question.flagged && status !== 'current' ? 'border border-orange-300' : ''}
                                        `}
                                    >
                                        {question.questionNumber}
                                        {question.flagged && status !== 'current' && (
                                            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-400 rounded-full border border-white"></div>
                                        )}
                                    </button>
                                );
                            })}
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
