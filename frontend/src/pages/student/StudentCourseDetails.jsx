import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBatchResources } from '../../services/api';

export default function StudentCourseDetails() {
    const { courseId } = useParams(); // This is actually batchId based on context
    const [notesOpen, setNotesOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [resources, setResources] = useState([]);
    const [loadingResources, setLoadingResources] = useState(false);

    // Placeholder YouTube Video ID - can be replaced with dynamic value
    const youtubeVideoId = 'dQw4w9WgXcQ'; // Replace with actual video ID or fetch from API

    // Placeholder data - in a real app, fetch based on courseId
    const courseTitle = "Algorithm Analysis & Design";

    useEffect(() => {
        if (activeTab === 'resources' && resources.length === 0) {
            fetchResources();
        }
    }, [activeTab]);

    const fetchResources = async () => {
        setLoadingResources(true);
        try {
            const data = await getBatchResources(courseId);
            setResources(data || []);
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        } finally {
            setLoadingResources(false);
        }
    };

    const getFileIcon = (fileName) => {
        const ext = fileName?.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return 'picture_as_pdf';
            case 'doc':
            case 'docx': return 'description';
            case 'xls':
            case 'xlsx': return 'table_chart';
            case 'ppt':
            case 'pptx': return 'slideshow';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return 'image';
            case 'mp4':
            case 'mov':
            case 'avi': return 'movie';
            case 'mp3':
            case 'wav': return 'audio_file';
            case 'zip':
            case 'rar': return 'folder_zip';
            default: return 'insert_drive_file';
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="flex flex-col h-full overflow-hidden relative font-display text-[#120f1a]">
            {/* Header */}
            <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
                <div className="flex items-center gap-3 text-sm">
                    <Link to="/student/my-courses" className="text-gray-500 hover:text-primary transition-colors">My Courses</Link>
                    <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                    <span className="font-bold text-gray-900 truncate max-w-[200px] md:max-w-md">{courseTitle}</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-600">Course Progress</span>
                            <span className="text-xs font-bold text-primary">75%</span>
                        </div>
                        <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(80,35,196,0.4)] w-3/4"></div>
                        </div>
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <button className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-3 rounded-full transition-colors">
                            <img alt="User" className="w-8 h-8 rounded-full object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwzCdEGbiSgzb6mkQY8JzP3lonBXqNXoXLJDsaPmigfu9poHengqidG76ZmnH4b-Hgkm_4wktSyp-52tEviF7t1b2Ab0MV5wONdH3e84D21ZgkMbmVJUlld33TiD57LjfYRAn9KTe4D00p2ThtjyOjVWSX_ujnGsT3w-J0H3pq0qLXaXL7kzB0u2biQLoyXlpvRssP78axJ_mN299GYmwbuC9ZB7NTxGoa77LZJdhBXabKUKvw-eH09wpcb2xhJhYLyrUQdja01Cg" />
                            <span className="material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth bg-background-light">
                <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-6">

                    {/* Left Column: Video & Lessons */}
                    <div className="flex-1 space-y-6 overflow-hidden flex flex-col">
                        {/* YouTube Video Player */}
                        <div className="bg-black rounded-2xl overflow-hidden shadow-deep-purple relative aspect-video">
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
                                title="Course Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                        </div>

                        {/* Tabs Content */}
                        <div className="bg-white rounded-2xl p-6 shadow-card flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-center gap-6 border-b border-gray-100 pb-4 mb-6 overflow-x-auto">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`font-bold pb-4 -mb-4 px-2 whitespace-nowrap transition-colors ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-900'}`}
                                >Overview</button>
                                <button
                                    onClick={() => setActiveTab('resources')}
                                    className={`font-bold pb-4 -mb-4 px-2 whitespace-nowrap transition-colors ${activeTab === 'resources' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-900'}`}
                                >Resources</button>
                                <button
                                    onClick={() => setActiveTab('announcements')}
                                    className={`font-medium pb-4 -mb-4 px-2 whitespace-nowrap transition-colors ${activeTab === 'announcements' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-900'}`}
                                >Announcements</button>
                                <button
                                    onClick={() => setActiveTab('qa')}
                                    className={`font-medium pb-4 -mb-4 px-2 whitespace-nowrap transition-colors ${activeTab === 'qa' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-900'}`}
                                >Q&amp;A</button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2">
                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Module 3: Graph Algorithms</h3>
                                        <div className="space-y-3">
                                            <div className="bg-primary-light/50 border border-primary/10 p-4 rounded-xl flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-primary text-sm mb-1">Lesson 3.1: Depth-First Search</h4>
                                                        <span className="text-xs text-primary font-medium bg-white px-2 py-0.5 rounded-md shadow-sm">Playing</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 line-clamp-2">Understanding the recursive nature of DFS and its applications in maze solving and cycle detection.</p>
                                                </div>
                                            </div>
                                            <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-start gap-4 hover:border-gray-200 transition-colors group cursor-pointer">
                                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="material-symbols-outlined text-sm">check</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-primary transition-colors">Lesson 3.2: Breadth-First Search</h4>
                                                        <span className="text-xs text-gray-400 font-medium">45 min</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-start gap-4 opacity-70">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="material-symbols-outlined text-sm">lock</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-semibold text-gray-500 text-sm mb-1">Lesson 3.3: Connected Components</h4>
                                                        <span className="text-xs text-gray-400 font-medium">30 min</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-start gap-4 opacity-70">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="material-symbols-outlined text-sm">lock</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-semibold text-gray-500 text-sm mb-1">Lesson 3.4: Shortest Paths</h4>
                                                        <span className="text-xs text-gray-400 font-medium">55 min</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Resources Tab */}
                                {activeTab === 'resources' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-gray-900">Course Resources</h3>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">{resources.length} files</span>
                                        </div>
                                        {loadingResources ? (
                                            <div className="flex items-center justify-center py-12">
                                                <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                                            </div>
                                        ) : resources.length === 0 ? (
                                            <div className="text-center py-12">
                                                <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">folder_off</span>
                                                <p className="text-gray-500 font-medium">No resources available yet</p>
                                                <p className="text-gray-400 text-sm">Check back later or ask your instructor.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {resources.map((file, index) => (
                                                    <a
                                                        key={index}
                                                        href={file.url || file.Path || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-md transition-all group"
                                                    >
                                                        <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                                            <span className="material-symbols-outlined">{getFileIcon(file.ObjectName || file.name)}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-primary transition-colors">{file.ObjectName || file.name || 'Untitled'}</p>
                                                            <p className="text-xs text-gray-500">{formatFileSize(file.Length || file.size)}</p>
                                                        </div>
                                                        <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">download</span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Announcements Tab */}
                                {activeTab === 'announcements' && (
                                    <div className="text-center py-12">
                                        <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">campaign</span>
                                        <p className="text-gray-500 font-medium">No announcements yet</p>
                                    </div>
                                )}

                                {/* Q&A Tab */}
                                {activeTab === 'qa' && (
                                    <div className="text-center py-12">
                                        <span className="material-symbols-outlined text-gray-300 text-6xl mb-4">forum</span>
                                        <p className="text-gray-500 font-medium">Q&A section coming soon</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Instructor, Live Shift, Performance, Notes Input */}
                    <div className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0">

                        {/* Instructor */}
                        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-50">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Instructor</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <img alt="Prof. Robert Sedgewick" className="w-12 h-12 rounded-full object-cover border-2 border-primary/10"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6LtHevqr913uhOdNb0ilta-ZIo0SUiold6DL4-UO1Eh5mIxHdfg7Rk5-dV04G6nLHR4Hl5c8HjQJHq4CtTqBoYte5eijy7lusf20zxjsy2CCf_YlDzazeHyu_d9FbUOh4EdH2c-3xkCmEe2GbXPZe5fvMl4Q6G22XTmyBtY8Xh9xb8Pk08jkQsVcGHmlrVd3gvoJhnXZsEt-8OBowp4XdH7hHM3RRJNRDjGjMu-NMdMVIEwbsFPdPPWeoOqD-14oYugvvfqyVQgU" />
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Prof. R. Sedgewick</h4>
                                    <p className="text-xs text-gray-500">Computer Science Dept.</p>
                                </div>
                            </div>
                            <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">mail</span>
                                Message
                            </button>
                        </div>

                        {/* Live Shift */}
                        <div className="bg-gradient-to-br from-[#5023c4] to-[#3e1a96] rounded-2xl p-6 shadow-deep-purple text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="material-symbols-outlined text-6xl">videocam</span>
                            </div>
                            <h3 className="text-xs font-bold text-primary-light uppercase tracking-wider mb-1">Upcoming Live Shift</h3>
                            <div className="text-2xl font-bold mb-1">Tuesday</div>
                            <div className="text-primary-light text-sm mb-6">4:00 PM - 5:30 PM EST</div>
                            <button className="w-full py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2 shadow-lg">
                                Join Live Room
                                <span className="material-symbols-outlined text-[18px]">login</span>
                            </button>
                        </div>

                        {/* Performance */}
                        <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-50">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Your Performance</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                            <span className="material-symbols-outlined text-sm">grade</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Current Grade</span>
                                    </div>
                                    <span className="text-lg font-bold text-green-700">A-</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Attendance</span>
                                    </div>
                                    <span className="text-lg font-bold text-blue-700">92%</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes Input Toggle/Trigger */}
                        <div className="bg-white rounded-2xl p-1 shadow-card border border-gray-50 flex items-center">
                            <div className="p-3 text-gray-400">
                                <span className="material-symbols-outlined">edit_note</span>
                            </div>
                            <input
                                className="w-full border-none bg-transparent text-sm placeholder-gray-400 focus:ring-0 p-0 outline-none"
                                placeholder="Type a quick note..."
                                type="text"
                                onClick={() => setNotesOpen(true)}
                            />
                            <button className="p-2 text-primary hover:bg-primary-light rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[20px]">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes Sidebar (Slide-in) */}
            <div className={`fixed top-20 right-4 w-80 bottom-4 bg-white rounded-2xl shadow-2xl border border-gray-100 z-40 transform transition-transform duration-300 flex flex-col ${notesOpen ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)] hidden md:flex'}`}>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-2xl">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">edit_note</span>
                        My Notes
                    </h3>
                    <button onClick={() => setNotesOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="text-sm text-gray-500 italic text-center mt-10">Start typing to take notes time-stamped to the video...</div>
                </div>
            </div>
        </div>
    );
}
