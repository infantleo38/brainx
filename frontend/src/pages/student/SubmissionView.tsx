import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import assessmentsService from '../../services/assessments';
import { getCurrentUser } from '../../services/api';

interface User {
    id: number;
    full_name: string;
    profile_image?: string;
    [key: string]: any;
}

interface Question {
    id: number;
    text?: string;
    question?: string;
    type: 'Multiple Choice' | 'True/False' | 'Short Answer' | 'Code Snippet' | 'Picture';
    points: number;
    options?: string[];
    pictureUrl?: string;
    codeSnippet?: string;
    correctOption?: number;
    correctAnswer?: string | number;
    expectedAnswer?: string;
    [key: string]: any;
}

interface Submission {
    id: number;
    assessment_title: string;
    total_marks: number;
    received_marks?: number;
    marks_obtained: number;
    show_results: boolean;
    passed: boolean;
    questions?: {
        questions: Question[];
    };
    response_data: Record<string, any>;
    submitted_at: string;
    [key: string]: any;
}

export default function SubmissionView() {
    const { assessmentId } = useParams<{ assessmentId: string }>();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [user, setUser] = useState<User | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        const fetchSubmission = async () => {
            if (!assessmentId) return;
            try {
                setLoading(true);
                const userData = await getCurrentUser();
                setUser(userData as User);

                const submissionData = await assessmentsService.getMySubmission(assessmentId);
                setSubmission(submissionData);
            } catch (err: any) {
                console.error('Error fetching submission:', err);
                setError(err.message || 'Failed to load submission');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [assessmentId]);

    const handleNextQuestion = () => {
        const questions = submission?.questions?.questions || [];
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleQuestionNavigate = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    if (loading) {
        return (
            <div className="bg-background-light font-display text-[#120f1a] antialiased h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your submission...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-background-light font-display text-[#120f1a] antialiased h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Submission</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/student/assignments')}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all"
                    >
                        Back to Assignments
                    </button>
                </div>
            </div>
        );
    }

    if (!submission || !submission.show_results) {
        return (
            <div className="bg-background-light font-display text-[#120f1a] antialiased h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">lock</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Results Not Available</h3>
                    <p className="text-gray-600 mb-4">
                        Results are not available for viewing. Please contact your instructor for more information.
                    </p>
                    <button
                        onClick={() => navigate('/student/assignments')}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all"
                    >
                        Back to Assignments
                    </button>
                </div>
            </div>
        );
    }

    const questions = submission.questions?.questions || [];
    if (questions.length === 0) {
        return (
            <div className="bg-background-light font-display text-[#120f1a] antialiased h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No questions found.</p>
                    <button
                        onClick={() => navigate('/student/assignments')}
                        className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all"
                    >
                        Back to Assignments
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const userAnswer = submission.response_data[String(currentQuestion.id)];
    const correctAnswer = currentQuestion.correctOption !== undefined ? currentQuestion.correctOption : currentQuestion.correctAnswer;
    const isCorrect = userAnswer === correctAnswer;

    // Calculate statistics
    const correctCount = questions.filter((q) => {
        const uAnswer = submission.response_data[String(q.id)];
        const cAnswer = q.correctOption !== undefined ? q.correctOption : q.correctAnswer;
        return uAnswer === cAnswer;
    }).length;
    const accuracy = Math.round((correctCount / questions.length) * 100);

    const getQuestionStatus = (index: number) => {
        const question = questions[index];
        const uAnswer = submission.response_data[String(question.id)];
        const cAnswer = question.correctOption !== undefined ? question.correctOption : question.correctAnswer;

        if (uAnswer === null || uAnswer === undefined) return 'unanswered';
        return uAnswer === cAnswer ? 'correct' : 'incorrect';
    };

    const isPassed = submission.passed;

    return (
        <div className="bg-background-light font-display text-[#120f1a] antialiased h-screen flex flex-col overflow-hidden">
            <header className="h-20 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Submission Review</span>
                    <h1 className="text-xl font-bold text-gray-900 leading-none">{submission.assessment_title}</h1>
                </div>
                <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 px-6 py-2.5 rounded-2xl border ${isPassed ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
                    }`}>
                    <span className={`material-symbols-outlined ${isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPassed ? 'emoji_events' : 'info'}
                    </span>
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-bold uppercase tracking-tighter leading-none ${isPassed ? 'text-emerald-600' : 'text-red-600'
                            }`}>Final Score</span>
                        <span className={`text-xl font-bold font-mono tracking-wide ${isPassed ? 'text-emerald-700' : 'text-red-700'
                            }`}>{submission.marks_obtained}/{submission.total_marks}</span>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/student/assignments')}
                    className="bg-white text-gray-700 border border-gray-200 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">dashboard</span>
                    Back to Dashboard
                </button>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-background-light flex flex-col items-center">
                    <div className="w-full max-w-4xl flex flex-col h-full">
                        <div className="bg-white rounded-[24px] shadow-deep-purple border border-white/60 flex-1 flex flex-col p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                                            Question {currentQuestionIndex + 1} of {questions.length}
                                        </span>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded tracking-wider ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            }`}>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 leading-tight">
                                        {currentQuestion.text || currentQuestion.question}
                                    </h2>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 whitespace-nowrap">
                                        <span className="text-xs font-bold text-gray-500">
                                            Score: {isCorrect ? currentQuestion.points : 0} / {currentQuestion.points} Points
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Question Image (if applicable) */}
                            {currentQuestion.pictureUrl && (
                                <div className="mb-8 relative z-10">
                                    <img
                                        src={currentQuestion.pictureUrl}
                                        alt="Question"
                                        className="w-full max-h-96 rounded-xl border border-gray-200 shadow-sm object-contain bg-gray-50"
                                    />
                                </div>
                            )}

                            {currentQuestion.codeSnippet && (
                                <div className="bg-[#1e1b2e] rounded-xl p-6 mb-8 font-mono text-sm text-gray-300 shadow-inner border border-gray-800 relative z-10">
                                    <div className="flex gap-1.5 mb-3 opacity-50">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <pre><code>{currentQuestion.codeSnippet}</code></pre>
                                </div>
                            )}

                            <div className="space-y-4 flex-1 relative z-10">
                                {/* For Multiple Choice, True/False, and Picture questions */}
                                {(currentQuestion.type === 'Multiple Choice' || currentQuestion.type === 'True/False' || currentQuestion.type === 'Picture') && currentQuestion.options && currentQuestion.options.length > 0 && (
                                    <>
                                        {currentQuestion.options.map((option, optIndex) => {
                                            const isUserAnswer = userAnswer === optIndex;
                                            const isCorrectOption = correctAnswer === optIndex;

                                            return (
                                                <div
                                                    key={optIndex}
                                                    className={`flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-200 ${isCorrectOption
                                                        ? 'border-emerald-500 bg-emerald-50'
                                                        : isUserAnswer
                                                            ? 'border-red-500 bg-red-50 shadow-sm'
                                                            : 'border-gray-100 bg-white opacity-60'
                                                        }`}
                                                >
                                                    {isCorrectOption ? (
                                                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                                            <span className="material-symbols-outlined text-white text-xs font-bold">check</span>
                                                        </div>
                                                    ) : isUserAnswer ? (
                                                        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                                            <span className="material-symbols-outlined text-white text-xs font-bold">close</span>
                                                        </div>
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex-shrink-0"></div>
                                                    )}
                                                    <span className={`text-lg font-medium flex-1 ${isCorrectOption ? 'text-emerald-900' : isUserAnswer ? 'text-red-900' : 'text-gray-500'
                                                        }`}>{option}</span>
                                                    {isUserAnswer && !isCorrectOption && (
                                                        <span className="text-xs font-bold text-red-600 uppercase tracking-tight bg-red-100 px-2 py-1 rounded">Your Answer</span>
                                                    )}
                                                    {isCorrectOption && (
                                                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-tight bg-emerald-100 px-2 py-1 rounded">Correct Answer</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </>
                                )}

                                {/* For Code Snippet questions */}
                                {currentQuestion.type === 'Code Snippet' && (
                                    <div className="space-y-6">
                                        {/* Student's Answer */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-bold text-gray-700">Your Answer</label>
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${userAnswer ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {userAnswer ? 'Submitted' : 'Not Answered'}
                                                </span>
                                            </div>
                                            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 font-mono text-sm min-h-[120px]">
                                                {userAnswer ? (
                                                    <pre className="whitespace-pre-wrap text-gray-800">{userAnswer}</pre>
                                                ) : (
                                                    <p className="text-gray-400 italic">No answer provided</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expected Answer */}
                                        {currentQuestion.expectedAnswer && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                                    Expected Answer
                                                </label>
                                                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 font-mono text-sm min-h-[120px]">
                                                    <pre className="whitespace-pre-wrap text-emerald-900">{currentQuestion.expectedAnswer}</pre>
                                                </div>
                                            </div>
                                        )}

                                        {/* Optional: Grading note */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                            <span className="material-symbols-outlined text-blue-600">info</span>
                                            <div className="flex-1">
                                                <p className="text-sm text-blue-900 font-medium">Manual Grading</p>
                                                <p className="text-xs text-blue-700 mt-1">
                                                    Code snippet questions are reviewed manually by your instructor.
                                                    {isCorrect ? ' Your answer has been marked as correct.' : ' Please check the expected answer above.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* For Short Answer questions */}
                                {currentQuestion.type === 'Short Answer' && (
                                    <div className="space-y-6">
                                        {/* Student's Answer */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-bold text-gray-700">Your Answer</label>
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${userAnswer ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {userAnswer ? 'Submitted' : 'Not Answered'}
                                                </span>
                                            </div>
                                            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-sm min-h-[100px]">
                                                {userAnswer ? (
                                                    <p className="text-gray-800 whitespace-pre-wrap">{userAnswer}</p>
                                                ) : (
                                                    <p className="text-gray-400 italic">No answer provided</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expected Answer (if available) */}
                                        {currentQuestion.correctAnswer && typeof currentQuestion.correctAnswer === 'string' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                                    Suggested Answer
                                                </label>
                                                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 text-sm min-h-[100px]">
                                                    <p className="text-emerald-900 whitespace-pre-wrap">{currentQuestion.correctAnswer}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Grading note */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                            <span className="material-symbols-outlined text-blue-600">info</span>
                                            <div className="flex-1">
                                                <p className="text-sm text-blue-900 font-medium">Manual Grading</p>
                                                <p className="text-xs text-blue-700 mt-1">
                                                    Short answer questions are reviewed manually by your instructor.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 relative z-10">
                                <button className="flex items-center gap-2 text-primary font-bold hover:underline group">
                                    <span className="material-symbols-outlined bg-primary-light p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">lightbulb</span>
                                    View Explanation
                                </button>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between relative z-10">
                                <div className="text-gray-400 text-sm italic">
                                    Session ended: {new Date(submission.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(submission.submitted_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handlePreviousQuestion}
                                        disabled={currentQuestionIndex === 0}
                                        className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous Question
                                    </button>
                                    <button
                                        onClick={handleNextQuestion}
                                        disabled={currentQuestionIndex === questions.length - 1}
                                        className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next Question
                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 text-center text-gray-400 text-sm font-medium">
                            Verified Result • ID: {submission.id || '8493-2201'}
                        </div>
                    </div>
                </main>

                <aside className="w-80 bg-white border-l border-gray-100 flex flex-col z-40 shadow-[rgba(0,0,0,0.05)_0px_0px_20px] h-full">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900 text-lg">Question Navigator</h3>
                        <div className="grid grid-cols-2 gap-y-2 mt-4">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Correct
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Incorrect
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div> Unanswered
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                                <div className="w-2.5 h-2.5 rounded-full border-2 border-primary"></div> Current
                            </div>
                        </div>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-5 gap-3">
                            {questions.map((question, index) => {
                                const status = getQuestionStatus(index);
                                const isCurrent = index === currentQuestionIndex;

                                return (
                                    <button
                                        key={question.id}
                                        onClick={() => handleQuestionNavigate(index)}
                                        className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-all relative ${isCurrent
                                            ? status === 'correct'
                                                ? 'bg-emerald-500 text-white ring-4 ring-primary/20 scale-110 shadow-lg'
                                                : status === 'incorrect'
                                                    ? 'bg-red-500 text-white ring-4 ring-primary/20 scale-110 shadow-lg'
                                                    : 'bg-gray-200 text-gray-500 ring-4 ring-primary/20 scale-110 shadow-lg'
                                            : status === 'correct'
                                                ? 'bg-emerald-500 text-white hover:opacity-90'
                                                : status === 'incorrect'
                                                    ? 'bg-red-500 text-white hover:opacity-90'
                                                    : 'bg-gray-200 text-gray-500 hover:opacity-90'
                                            }`}
                                    >
                                        {index + 1}
                                        {isCurrent && (
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-50 bg-gray-50/50">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase">Analysis</span>
                                <span className="text-xs font-bold text-primary">{accuracy}% Accuracy</span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: `${accuracy}%` }}></div>
                            </div>
                        </div>
                        <button className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-all shadow-md shadow-primary/10">
                            Download Certificate
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
