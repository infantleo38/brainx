import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { generateMeetingLink, createClassSession, getCurrentUser, getBatches } from '../../services/api';

interface User {
    id: number;
    full_name: string;
    email: string;
    role?: string;
    data?: {
        id: number;
    }
    [key: string]: any;
}

interface Batch {
    id: number;
    name: string;
    course_id: number;
    [key: string]: any;
}

interface MeetingSettings {
    waitingRoom: boolean;
    autoRecord: boolean;
    muteOnEntry: boolean;
    [key: string]: boolean;
}

export default function MeetingManagement() {
    const { courseId } = useParams<{ courseId: string }>(); // Note: Route param is :courseId but it actually contains batchId from TeacherClasses
    const [platform, setPlatform] = useState('zoom'); // 'zoom' or 'meet'
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isSaving, setIsSaving] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
             if (!courseId) return;
            try {
                const userData = await getCurrentUser();
                setUser(userData as User);

                const batchesData: Batch[] = await getBatches();
                // The URL param 'courseId' is actually the batch ID passed from TeacherClasses
                const batchIdParam = parseInt(courseId);

                // Find the specific batch
                const targetBatch = batchesData.find(b => b.id === batchIdParam);

                if (targetBatch) {
                    setBatches([targetBatch]);
                    setSelectedBatchId(targetBatch.id);
                } else {
                    // Fallback: If logic was correct and it was courseId, keep existing behavior or handle error
                    // But given the bug, we assume it's batchId. If not found, maybe show error?
                    console.warn("Batch not found for ID:", batchIdParam);
                    setBatches([]);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, [courseId]);

    const handleSave = async () => {
        if (!url) {
            alert("Please generate a meeting link first.");
            return;
        }
        if (!user) {
            alert("User information not loaded.");
            return;
        }
        if (!selectedBatchId) {
            alert("No batch/class found for this course. Please create a class first.");
            return;
        }

        setIsSaving(true);
        try {
            // Defaulting to 1 hour session starting now
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

            // Get proper course_id from selected batch
            const selectedBatch = batches.find(b => b.id === selectedBatchId);
            const actualCourseId = selectedBatch ? selectedBatch.course_id : (courseId ? parseInt(courseId) : 1);

            const teacherId = user.id || user.data?.id;

            const sessionData = {
                batch_id: selectedBatchId,
                course_id: actualCourseId,
                teacher_id: teacherId,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                meeting_link: url,
                is_recorded: settings.autoRecord
            };
            console.log("Saving session payload:", sessionData);

            await createClassSession(sessionData);
            alert("Class session created and students notified!");
        } catch (error) {
            console.error("Failed to save class session", error);
            alert("Failed to save class session. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerateLink = async () => {
        setIsLoading(true);
        try {
            const providerMap: Record<string, string> = {
                'zoom': 'zoom',
                'meet': 'gmeet',
                'jitsi': 'jitsi'
            };

            const requestData = {
                provider: providerMap[platform],
                topic: "Class Meeting", // Default topic
                start_time: new Date().toISOString(), // Current time for now
                duration_minutes: 60,
                is_group: true,
                record: settings.autoRecord
            };

            const response = await generateMeetingLink(requestData);
            setUrl(response.meeting_url);
        } catch (error) {
            console.error("Failed to generate meeting link", error);
            alert("Failed to generate meeting link. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    const [settings, setSettings] = useState<MeetingSettings>({
        waitingRoom: true,
        autoRecord: false,
        muteOnEntry: true
    });

    const handleSettingChange = (key: keyof MeetingSettings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button className="md:hidden text-gray-500 hover:text-primary">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Manage Class</h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-xl group-focus-within:text-primary transition-colors">search</span>
                        <input className="pl-10 pr-4 py-2 w-72 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/20 focus:bg-white transition-all placeholder-gray-400" placeholder="Search students, classes..." type="text" />
                    </div>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-8 scroll-smooth bg-background-light">
                <div className="max-w-4xl mx-auto">
                    <nav className="flex items-center text-sm text-gray-500 mb-6 space-x-2">
                        <Link className="hover:text-primary transition-colors" to="/teacher/classes">My Classes</Link>
                        <span className="material-symbols-outlined text-base text-gray-400">chevron_right</span>
                        <a className="hover:text-primary transition-colors" href="#">Advanced Algorithms</a>
                        <span className="material-symbols-outlined text-base text-gray-400">chevron_right</span>
                        <span className="text-gray-900 font-medium">Manage Class Link</span>
                    </nav>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-serif font-bold text-gray-900">Manage Class Link</h2>
                    </div>
                    <div className="bg-white rounded-[16px] shadow-deep-purple p-8 border border-gray-50">
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Select Platform</label>
                            <div className="bg-gray-100 p-1.5 rounded-2xl flex relative">
                                <button
                                    onClick={() => setPlatform('zoom')}
                                    className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-bold transition-all relative z-10 ${platform === 'zoom' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4.5 9.5C4.5 7.84315 5.84315 6.5 7.5 6.5H13.5C15.1569 6.5 16.5 7.84315 16.5 9.5V14.5C16.5 16.1569 15.1569 17.5 13.5 17.5H7.5C5.84315 17.5 4.5 16.1569 4.5 14.5V9.5Z" fill="#2D8CFF"></path>
                                        <path d="M17.5 10.5L20.5 8.5V15.5L17.5 13.5V10.5Z" fill="#2D8CFF"></path>
                                    </svg>
                                    Zoom
                                </button>
                                <button
                                    onClick={() => setPlatform('meet')}
                                    className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-medium transition-all relative z-10 ${platform === 'meet' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <rect fill="#EA4335" fillOpacity="0.2" height="12" rx="2" width="14" x="3" y="6"></rect>
                                        <path d="M17 10L21 7V17L17 14V10Z" fill="#34A853" fillOpacity="0.2"></path>
                                        <path d="M8 12L3 6H17V12H8Z" fill="#EA4335"></path>
                                        <path d="M17 6V12L8 12L3 18V6H17Z" fill="#0066DA"></path>
                                        <path d="M3 18H17V12L8 12L3 18Z" fill="#34A853"></path>
                                        <path d="M17 12V6L21 7V17L17 14V12Z" fill="#FFBB00"></path>
                                    </svg>
                                    Google Meet
                                </button>
                                <button
                                    onClick={() => setPlatform('jitsi')}
                                    className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-medium transition-all relative z-10 ${platform === 'jitsi' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <span className="material-symbols-outlined text-blue-500">video_camera_front</span>
                                    Jitsi Meet
                                </button>
                            </div>
                        </div>
                        <div className="mb-10">
                            <label className="block text-sm font-bold text-gray-900 mb-2 ml-1">Current Meeting URL</label>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1 group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-gray-400">link</span>
                                    </div>
                                    <input
                                        className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl focus:ring-0 focus:border-gray-300 font-mono text-sm transition-all shadow-inner"
                                        readOnly
                                        type="text"
                                        value={url}
                                    />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-all" title="Copy URL">
                                        <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                    </button>
                                    <div className="absolute -top-10 right-0 bg-gray-900 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-xl flex items-center gap-1.5 animate-bounce">
                                        <span className="material-symbols-outlined text-[14px] text-green-400">check_circle</span>
                                        URL Copied
                                        <div className="absolute -bottom-1 right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGenerateLink}
                                    disabled={isLoading}
                                    className={`flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/25 transition-all active:scale-95 whitespace-nowrap ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${isLoading ? 'animate-spin' : ''}`}>
                                        {isLoading ? 'progress_activity' : 'autorenew'}
                                    </span>
                                    {isLoading ? 'Generating...' : 'Regenerate Link'}
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-400 ml-1">Last updated: 2 days ago by Dr. Sarah Wilson</p>
                        </div>
                        <div className="border-t border-gray-100 my-8"></div>
                        <div className="mb-10">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Advanced Settings</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <span className="material-symbols-outlined">radio_button_checked</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Record Automatically</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">Start recording when the meeting begins</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={settings.autoRecord}
                                            onChange={() => handleSettingChange('autoRecord')}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-50">
                            <button className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !url}
                                className={`px-8 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 ${isSaving || !url ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSaving ? 'Saving...' : 'Save & Notify Students'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
