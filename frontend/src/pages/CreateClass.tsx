import React, { useState, useEffect } from 'react';
import { getCourses, getUsers, createBatch, searchUsers, getRoles } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function CreateClass() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    // Mock data for members/students for the UI demo purposes
    // In a real app, this would likely be another fetch or a search/add flow
    const [members, setMembers] = useState([]);

    const [teachers, setTeachers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Member search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [formData, setFormData] = useState({
        course_id: '',
        batch_name: '',
        teacher_id: '',
        start_date: '',
        end_date: '',
        total_hours: '',
        status: true
    });

    const [scheduleStart, setScheduleStart] = useState('');
    const [scheduleEnd, setScheduleEnd] = useState('');

    const to12Hour = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours, 10);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${suffix}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [coursesData, usersData, rolesData] = await Promise.all([
                    getCourses(),
                    getUsers(),
                    getRoles()
                ]);
                setCourses(coursesData);
                setTeachers(usersData);
                setAvailableRoles(rolesData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                course_id: parseInt(formData.course_id),
                teacher_id: formData.teacher_id || null, // UUID should not be parsed as int
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                schedule_time: (scheduleStart && scheduleEnd) ? `${to12Hour(scheduleStart)} - ${to12Hour(scheduleEnd)}` : '',
                total_hours: formData.total_hours ? parseInt(formData.total_hours) : 0,
                members: members.map(m => ({
                    user_id: m.id,
                    role_id: m.role_id || availableRoles.find(r => r.name.toLowerCase() === 'student')?.id
                })),
            };

            await createBatch(payload);
            navigate('/courses');
        } catch (error) {
            console.error("Failed to create class:", error);
            alert("Failed to create class. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeMember = (id) => {
        setMembers(members.filter(m => m.id !== id));
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const results = await searchUsers(searchQuery);
            // Filter out already added members
            const newResults = results.filter(u => !members.some(m => m.id === u.id));
            setSearchResults(newResults);
            setShowResults(true);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const addMemberFromSearch = (user) => {
        setMembers(prev => [...prev, {
            id: user.id,
            name: user.full_name,
            stId: user.id.slice(0, 8), // Just using part of UUID as display ID
            photo: 'https://ui-avatars.com/api/?name=' + user.full_name, // Fallback avatar
            email: user.email,
            role_id: availableRoles.find(r => r.name.toLowerCase() === 'student')?.id // Default to student
        }]);
        setSearchResults([]);
        setShowResults(false);
        setSearchQuery('');
    };

    const handleMemberRoleChange = (memberId, newRoleId) => {
        setMembers(members.map(m =>
            m.id === memberId ? { ...m, role_id: parseInt(newRoleId) } : m
        ));
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark p-4 md:p-8 h-full overflow-y-auto scroll-smooth">
            <div className="max-w-[1200px] mx-auto w-full space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                            <Link to="/courses" className="hover:text-primary cursor-pointer">Management</Link>
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                            <Link to="/courses" className="hover:text-primary cursor-pointer">Courses</Link>
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                            <span className="text-slate-900 dark:text-white font-medium">Create Batch</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Class (Batch)</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Setup schedule, assign personnel, and enroll
                            members for a new batch.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/courses')}
                            className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed">
                            {isSubmitting ? (
                                <>
                                    <span className="animate-spin material-symbols-outlined text-xl">progress_activity</span>
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-xl">check</span>
                                    <span>Create Class</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white dark:bg-[#15202b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-bold text-sm">
                                    1</div>
                                Basic Information
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Select
                                        Course</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">book_2</span>
                                        <select
                                            name="course_id"
                                            value={formData.course_id}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none cursor-pointer">
                                            <option value="" disabled>Choose a course template...</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>{course.title} ({course.level || 'General'})</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Batch
                                            Name</label>
                                        <input
                                            name="batch_name"
                                            value={formData.batch_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400"
                                            placeholder="e.g. Fall 2024 - Cohort A" type="text" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                                        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-[42px]">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">Active</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    name="status"
                                                    checked={formData.status}
                                                    onChange={handleChange}
                                                    className="sr-only peer" type="checkbox" />
                                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary">
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule & Timeline */}
                        <div className="bg-white dark:bg-[#15202b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-bold text-sm">
                                    2</div>
                                Schedule & Timeline
                            </h3>
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Start
                                            Date</label>
                                        <input
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 text-slate-500"
                                            type="date" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">End
                                            Date</label>
                                        <input
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 text-slate-500"
                                            type="date" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Schedule
                                            Time</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">schedule</span>
                                                <input
                                                    value={scheduleStart}
                                                    onChange={(e) => setScheduleStart(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 appearance-none"
                                                    type="time" />
                                            </div>
                                            <span className="self-center text-slate-400 font-medium text-xs">to</span>
                                            <div className="relative flex-1">
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">schedule</span>
                                                <input
                                                    value={scheduleEnd}
                                                    onChange={(e) => setScheduleEnd(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 appearance-none"
                                                    type="time" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Total
                                            Hours</label>
                                        <div className="relative">
                                            <input
                                                name="total_hours"
                                                value={formData.total_hours}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400"
                                                placeholder="40" type="number" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">hrs</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consumed
                                            Hours</span>
                                        <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">0 <span className="text-sm font-normal text-slate-500">hrs</span></div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remaining
                                            Hours</span>
                                        <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">0 <span className="text-sm font-normal text-slate-500">hrs</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personnel */}
                        <div className="bg-white dark:bg-[#15202b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-bold text-sm">
                                    3</div>
                                Personnel
                            </h3>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Assign
                                    Teacher</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">person_search</span>
                                    <select
                                        name="teacher_id"
                                        value={formData.teacher_id}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400 appearance-none cursor-pointer">
                                        <option value="">Search teacher by name or ID...</option>
                                        {teachers.map(user => (
                                            <option key={user.id} value={user.id}>{user.email} {user.full_name ? `(${user.full_name})` : ''}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Enter the name of the teacher to assign to this
                                    batch.</p>
                            </div>
                        </div>
                    </div>

                    {/* Members Sidebar */}
                    <div className="xl:col-span-1">
                        <div className="bg-white dark:bg-[#15202b] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-bold text-sm">
                                    4</div>
                                Members
                            </h3>
                            <div className="flex-1 flex flex-col">
                                <div className="mb-6 relative">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Add
                                        New Member</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                                className="w-full pl-3 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-slate-400"
                                                placeholder="Search Name or Email" type="text" />
                                        </div>
                                        <button
                                            onClick={handleSearch}
                                            disabled={isSearching}
                                            className="bg-primary text-white p-2.5 rounded-xl hover:bg-blue-600 transition-colors shadow-sm shrink-0 disabled:opacity-70">
                                            {isSearching ?
                                                <span className="material-symbols-outlined text-xl block animate-spin">progress_activity</span> :
                                                <span className="material-symbols-outlined text-xl block">person_search</span>
                                            }
                                        </button>
                                    </div>

                                    {/* Search Results Dropdown */}
                                    {showResults && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-10 max-h-60 overflow-y-auto">
                                            <div className="p-2">
                                                <div className="flex justify-between items-center mb-2 px-2">
                                                    <span className="text-xs font-bold text-slate-500">Found {searchResults.length} users</span>
                                                    <button onClick={() => setShowResults(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined text-sm">close</span></button>
                                                </div>
                                                {searchResults.length === 0 ? (
                                                    <div className="text-center py-4 text-sm text-slate-500">No users found</div>
                                                ) : (
                                                    searchResults.map(user => (
                                                        <button
                                                            key={user.id}
                                                            onClick={() => addMemberFromSearch(user)}
                                                            className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-left"
                                                        >
                                                            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                                {user.full_name.charAt(0)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.full_name}</div>
                                                                <div className="text-xs text-slate-500 truncate">{user.email}</div>
                                                            </div>
                                                            <span className="material-symbols-outlined text-slate-400 text-sm">add</span>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mb-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Batch List
                                        ({members.length})</span>
                                    <button className="text-xs text-primary hover:underline font-medium">Clear All</button>
                                </div>
                                <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                                    {members.map(member => (
                                        <div key={member.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="size-9 rounded-full bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700"
                                                    style={{ backgroundImage: `url('${member.photo}')` }}>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                            {member.name}</h4>
                                                        <button
                                                            onClick={() => removeMember(member.id)}
                                                            className="text-slate-400 hover:text-red-500 transition-colors rounded-lg p-0.5 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                            <span className="material-symbols-outlined text-base block">close</span>
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">ID: #{member.stId}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={member.role_id || ''}
                                                            onChange={(e) => handleMemberRoleChange(member.id, e.target.value)}
                                                            className="block w-full text-xs py-1 px-2 pr-6 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer">
                                                            {availableRoles.map(role => (
                                                                <option key={role.id} value={role.id}>{role.name}</option>
                                                            ))}
                                                        </select>
                                                        <select className="block w-full text-xs py-1 px-2 pr-6 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer">
                                                            <option>Active</option>
                                                            <option>Pending</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

