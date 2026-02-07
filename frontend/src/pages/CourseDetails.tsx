import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import logo from '../assets/logo.png'; // Keeping logo if used elsewhere
import Header from '../components/Header';
import { getCourse, getTeachersByCourse, getTeacherTimeSlots, enrollInCourse, checkEnrollmentStatus } from '../services/api';

import { features } from '../mock/courseDetailsData'; // Keep features mock for now

export default function CourseDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [isEnrolled, setIsEnrolled] = React.useState(false);
    const [course, setCourse] = React.useState(null);
    const [teachers, setTeachers] = React.useState([]);
    const [selectedTeacherId, setSelectedTeacherId] = React.useState(null);
    const [timeSlots, setTimeSlots] = React.useState([]);
    const [loadingSlots, setLoadingSlots] = React.useState(false);
    const [timeFilter, setTimeFilter] = React.useState('All');
    const [selectedSlotId, setSelectedSlotId] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [enrollmentStatus, setEnrollmentStatus] = React.useState(null);
    const [enrolling, setEnrolling] = React.useState(false);
    const isLoggedIn = !!localStorage.getItem('access_token');

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
        if (isLoggedIn) {
            checkEnrollment();
        }
    }, [id, isLoggedIn]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [courseData, teachersData] = await Promise.all([
                getCourse(id),
                getTeachersByCourse(id)
            ]);
            setCourse(courseData);
            setTeachers(teachersData);

            // Auto-select first teacher if available
            if (teachersData.length > 0 && teachersData[0].teacher) {
                setSelectedTeacherId(teachersData[0].teacher.id);
                fetchTimeSlots(teachersData[0].teacher.id);
            }
        } catch (error) {
            console.error("Failed to fetch course details:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTimeSlots = async (teacherId) => {
        try {
            setLoadingSlots(true);
            // Date filtering removed from backend

            const slots = await getTeacherTimeSlots(teacherId);
            setTimeSlots(slots);
        } catch (error) {
            console.error("Failed to fetch time slots:", error);
            setTimeSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const checkEnrollment = async () => {
        try {
            const status = await checkEnrollmentStatus(id);
            setEnrollmentStatus(status);
            setEnrollmentStatus(status);
            // If status is active, consider enrolled. If requested, maybe show slightly different state?
            // Actually user implies new flow is: Click Enroll -> (Requested).
            // So isEnrolled should maybe map to 'active' or 'requested'?
            // Let's set isEnrolled to true so button changes state, but we rely on status string for text.
            setIsEnrolled(status.is_enrolled);
        } catch (error) {
            console.error("Failed to check enrollment status:", error);
        }
    };

    // Helper function to convert 24-hour time to 12-hour format with AM/PM
    const formatTime12Hour = (time24) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    // Helper function to categorize time slot by period
    const getTimePeriod = (time24) => {
        const hour = parseInt(time24.split(':')[0]);
        if (hour >= 5 && hour < 12) return 'Morning';
        if (hour >= 12 && hour < 17) return 'Afternoon';
        return 'Evening';
    };

    const handleTeacherSelect = (teacherId) => {
        setSelectedTeacherId(teacherId);
        fetchTimeSlots(teacherId);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-background-light flex flex-col items-center justify-center gap-4">
                <p className="text-xl font-bold text-gray-700">Course not found</p>
                <button onClick={() => navigate('/courses')} className="text-primary hover:underline">
                    Back to Courses
                </button>
            </div>
        );
    }

    const handleEnroll = async () => {
        if (!isLoggedIn) {
            // Redirect to signup with return path to this course
            navigate('/signup', {
                state: {
                    returnTo: `/courses/${id}`,
                    courseId: id
                }
            });
        } else {
            // User is authenticated, enroll them
            setEnrolling(true);
            try {
                const enrollmentData = {
                    course_id: parseInt(id),
                    teacher_id: selectedTeacherId,
                    slot_id: selectedSlotId
                };

                const result = await enrollInCourse(enrollmentData);

                if (result.status === 'already_enrolled') {
                    alert('You are already enrolled in this course!');
                } else {
                    alert('Successfully enrolled! Request sent. 🎉');
                    setIsEnrolled(true);
                    setEnrollmentStatus({
                        is_enrolled: true,
                        batch_id: result.batch_id,
                        status: 'requested' // Assume requested for new enrollments if not auto-approved
                    });
                }

                // Navigate to dashboard
                navigate('/student/dashboard');
            } catch (error) {
                console.error("Enrollment failed:", error);
                alert('Enrollment failed: ' + (error.message || 'Please try again'));
            } finally {
                setEnrolling(false);
            }
        }
    };

    return (
        <div className="bg-background-light font-display text-[#120f1a] overflow-x-hidden antialiased">
            <Header />
            <main className="pt-24 pb-24">
                <div className="layout-container px-6 md:px-10 lg:px-40 mb-12">
                    <div
                        className="bg-white rounded-[2rem] p-8 md:p-10 shadow-soft border border-gray-100 relative overflow-hidden">
                        <div
                            className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none">
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start justify-between">
                            <div className="max-w-3xl">
                                <div className="flex flex-wrap items-center gap-3 mb-5">
                                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {course.level || 'Beginner'}
                                    </span>
                                    {course.duration_weeks && (
                                        <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {course.duration_weeks} Weeks
                                        </span>
                                    )}
                                    <div
                                        className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                        <span className="material-symbols-outlined text-yellow-500 text-sm fill-1">star</span>
                                        <span className="text-xs font-bold text-[#120f1a]">4.8</span>
                                        <span className="text-xs text-gray-500 font-medium ml-1">(120 reviews)</span>
                                    </div>
                                </div>
                                <h1
                                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#120f1a] mb-6 tracking-tight leading-tight">
                                    {course.title}</h1>
                                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                                    {course.description}
                                </p>
                            </div>
                            <div
                                className="hidden md:flex flex-col gap-2 items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center min-w-[140px]">
                                <span className="material-symbols-outlined text-4xl text-primary/80">workspace_premium</span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Certified</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="layout-container px-6 md:px-10 lg:px-40 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h2 className="text-2xl font-bold text-[#120f1a] flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">person_search</span>
                                    </div>
                                    Select Instructor
                                </h2>
                                <div className="relative w-full sm:w-64">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <span className="material-symbols-outlined text-[20px]">search</span>
                                    </span>
                                    <input
                                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                        placeholder="Search instructors..." type="text" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {teachers.length > 0 ? (
                                    teachers.map((item, index) => {
                                        const instructor = item.teacher;
                                        if (!instructor) return null;
                                        return (
                                            <label key={item.id} className="cursor-pointer group relative block">
                                                <input
                                                    checked={selectedTeacherId === instructor.id}
                                                    onChange={() => handleTeacherSelect(instructor.id)}
                                                    className="peer sr-only"
                                                    name="instructor"
                                                    type="radio"
                                                />
                                                <div
                                                    className={`card-selection bg-white rounded-2xl p-4 border transition-all duration-200 flex items-center gap-4 ${selectedTeacherId === instructor.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}>
                                                    <div
                                                        className={`size-14 rounded-xl ${instructor.profile_image ? 'bg-gray-100' : 'bg-primary/10 text-primary'} overflow-hidden shrink-0 border border-gray-200 shadow-sm flex items-center justify-center ${!instructor.profile_image && 'text-xl font-bold'}`}>
                                                        {instructor.profile_image ? (
                                                            <img alt={instructor.full_name} className="w-full h-full object-cover" src={instructor.profile_image} />
                                                        ) : (
                                                            instructor.full_name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3
                                                            className="font-bold text-base text-[#120f1a] truncate group-hover:text-primary transition-colors">
                                                            {instructor.full_name}</h3>
                                                        <p className="text-primary text-[10px] font-bold uppercase tracking-wide mb-1">{instructor.role || 'Instructor'}</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {/* Mock skills for now as User model might not have them */}
                                                            {['Expert', 'Mentor'].map(skill => (
                                                                <span key={skill} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">{skill}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`radio-ring size-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors bg-white ${selectedTeacherId === instructor.id ? 'border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                                        <div
                                                            className={`radio-dot size-2.5 bg-primary rounded-full transition-all ${selectedTeacherId === instructor.id ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-2 text-center py-8 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        No instructors assigned yet.
                                    </div>
                                )}
                            </div>
                        </section>
                        <section>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <h2 className="text-2xl font-bold text-[#120f1a] flex items-center gap-3">
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">calendar_month</span>
                                    </div>
                                    Available Slots
                                </h2>
                                <div className="inline-flex bg-gray-100 p-1 rounded-xl">
                                    {['All', 'Morning', 'Afternoon', 'Evening'].map(filter => (
                                        <button
                                            key={filter}
                                            onClick={() => setTimeFilter(filter)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === filter
                                                ? 'bg-white shadow-sm text-primary'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                {loadingSlots ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                        Loading available slots...
                                    </div>
                                ) : timeSlots.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200 m-4">
                                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">event_busy</span>
                                        <p>No available slots for the selected instructor.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <div className="col-span-3">Time Period</div>
                                            <div className="col-span-6">Time Slot</div>
                                            <div className="col-span-3 text-center">Select</div>
                                        </div>
                                        {timeSlots
                                            .filter(slot => slot.status === 'available')
                                            .filter(slot => {
                                                if (timeFilter === 'All') return true;
                                                return getTimePeriod(slot.slot_start) === timeFilter;
                                            })
                                            .map((slot, index) => {
                                                const timePeriod = getTimePeriod(slot.slot_start);
                                                const startTime12 = formatTime12Hour(slot.slot_start);
                                                const endTime12 = formatTime12Hour(slot.slot_end);
                                                const timeRange = `${startTime12} - ${endTime12}`;

                                                const periodConfig = {
                                                    'Morning': { icon: 'wb_sunny', color: 'bg-amber-50 text-amber-600', iconColor: 'text-amber-600' },
                                                    'Afternoon': { icon: 'wb_twilight', color: 'bg-orange-50 text-orange-600', iconColor: 'text-orange-600' },
                                                    'Evening': { icon: 'nights_stay', color: 'bg-indigo-50 text-indigo-600', iconColor: 'text-indigo-600' }
                                                };
                                                const config = periodConfig[timePeriod];

                                                return (
                                                    <label key={slot.id} className="block cursor-pointer group border-b border-gray-100 last:border-0">
                                                        <input
                                                            checked={selectedSlotId === slot.id}
                                                            onChange={() => setSelectedSlotId(slot.id)}
                                                            className="peer sr-only"
                                                            name="timeslot"
                                                            type="radio"
                                                        />
                                                        <div className={`card-selection p-4 md:p-5 transition-colors grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:bg-gray-50 ${selectedSlotId === slot.id ? 'bg-primary/5' : ''}`}>
                                                            <div className="md:hidden flex justify-between items-center w-full mb-2">
                                                                <span className="text-xs font-bold text-gray-400 uppercase">{timePeriod}</span>
                                                                <div className={`radio-ring size-5 rounded-full border-2 flex items-center justify-center transition-colors bg-white ${selectedSlotId === slot.id ? 'border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                                                    <div className={`radio-dot size-2.5 bg-primary rounded-full transition-all ${selectedSlotId === slot.id ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                                                                </div>
                                                            </div>
                                                            <div className="md:col-span-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`hidden md:flex size-10 rounded-lg ${config.color} items-center justify-center shrink-0`}>
                                                                        <span className={`material-symbols-outlined text-[20px] ${config.iconColor}`}>{config.icon}</span>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-[#120f1a] text-sm md:text-base">{timePeriod}</h4>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="md:col-span-6 flex md:block items-center justify-between">
                                                                <span className="md:hidden text-xs text-gray-500 font-medium">Time:</span>
                                                                <div className="text-sm md:text-base font-bold text-gray-700">{timeRange}</div>
                                                            </div>
                                                            <div className="hidden md:flex col-span-3 justify-center">
                                                                <div className={`radio-ring size-5 rounded-full border-2 flex items-center justify-center transition-colors bg-white ${selectedSlotId === slot.id ? 'border-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                                                    <div className={`radio-dot size-2.5 bg-primary rounded-full transition-all ${selectedSlotId === slot.id ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                    </>
                                )}
                            </div>
                        </section>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-6">
                            <div
                                className="bg-white rounded-[2rem] p-6 shadow-glow border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent-purple">
                                </div>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-[#120f1a] mb-2">Ready to Enroll?</h3>
                                    <p className="text-sm text-gray-500">Secure your spot in the next cohort. Payment details
                                        collected on the next step.</p>
                                </div>
                                <div className="space-y-5 mb-8">
                                    <h4
                                        className="font-bold text-[#120f1a] text-sm uppercase tracking-wide flex items-center gap-2">
                                        <span>What's Included</span>
                                        <span className="h-px bg-gray-100 flex-1"></span>
                                    </h4>
                                    <ul className="space-y-4">
                                        {features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                                                <div className="bg-primary/10 p-1 rounded-full shrink-0">
                                                    <span
                                                        className="material-symbols-outlined text-primary text-[16px] block font-bold">check</span>
                                                </div>
                                                <span className="font-medium">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button onClick={handleEnroll}
                                    disabled={isEnrolled || enrolling}
                                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform flex items-center justify-center gap-2 ${isEnrolled
                                        ? (enrollmentStatus?.status === 'requested' ? 'bg-amber-500 text-white shadow-amber-500/25 cursor-default' : 'bg-green-500 text-white shadow-green-500/25 cursor-default')
                                        : enrolling
                                            ? 'bg-gray-400 text-white cursor-wait'
                                            : 'bg-primary text-white hover:bg-primary-dark shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0'
                                        }`}>
                                    {enrolling ? 'Enrolling...' : isEnrolled ? (enrollmentStatus?.status === 'requested' ? 'Requested' : 'Already Enrolled ✓') : 'Enroll Now'}
                                    {!isEnrolled && !enrolling && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
                                    {isEnrolled && <span className="material-symbols-outlined text-xl">check</span>}
                                </button>
                                <p
                                    className="text-center text-xs text-gray-400 mt-4 font-medium flex items-center justify-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">lock</span>
                                    30-day money-back guarantee
                                </p>
                            </div>
                            <div className="bg-[#f0f9ff] rounded-2xl p-5 border border-blue-100 flex items-start gap-4">
                                <div className="bg-blue-100 p-2.5 rounded-full text-blue-600 shrink-0">
                                    <span className="material-symbols-outlined text-[20px]">support_agent</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm mb-1">Have questions?</h4>
                                    <p className="text-xs text-blue-700 leading-relaxed mb-2 font-medium">Speak to our admission
                                        counselors to find the best fit for your career.</p>
                                    <a className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                        href="#">
                                        Chat with us
                                        <span className="material-symbols-outlined text-[12px]">arrow_outward</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="bg-primary text-white pt-20 pb-10">
                <div className="layout-container px-6 md:px-10 lg:px-40">
                    <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-16">
                        <div className="lg:w-1/3">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-white text-[20px]">school</span>
                                </div>
                                <h2 className="text-white text-xl font-bold tracking-tight">Brainx</h2>
                            </div>
                            <p className="text-indigo-200 text-sm mb-8 leading-relaxed">
                                Join our newsletter to stay up to date on features and releases. We don't send spam, just the
                                good stuff.
                            </p>
                            <form className="relative max-w-sm">
                                <input
                                    className="w-full h-12 pl-6 pr-12 rounded-full bg-white/10 border border-white/20 text-white placeholder-indigo-200/50 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all text-sm"
                                    placeholder="Enter your email" type="email" />
                                <button
                                    className="absolute right-1 top-1 h-10 w-10 bg-white rounded-full flex items-center justify-center text-primary hover:scale-105 transition-transform"
                                    type="button">
                                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                </button>
                            </form>
                        </div>
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                                <h4 className="font-bold text-white mb-6">Company</h4>
                                <ul className="space-y-4">
                                    <li><a className="text-indigo-200 hover:text-white text-sm transition-colors" href="#">About
                                        Us</a></li>
                                    <li><a className="text-indigo-200 hover:text-white text-sm transition-colors"
                                        href="#">Careers</a></li>
                                    <li><a className="text-indigo-200 hover:text-white text-sm transition-colors" href="#">Press</a>
                                    </li>
                                    <li><a className="text-indigo-200 hover:text-white text-sm transition-colors" href="#">News</a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-6">Community</h4>
                                <ul className="space-y-4">
                                    <li><a className="text-indigo-200 hover:text-white text-sm transition-colors"
                                        href="#">Events</a></li>
                                    <li><a className="text-indigo-200 hover:text-white text-sm transition-colors" href="#">Blog</a>
                                    </li>
                                    <li><a className="text-indigo-200 hover:text-white text-sm transition-colors" href="#">Forum</a>
                                    </li>
                                    <li><a className="text-indigo-200 hover:text-white text-sm transition-colors"
                                        href="#">Podcast</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-6">Resources</h4>
                                <ul className="space-y-4">
                                    <li><a className="text-indigo-200 hover:text-white text-sm transition-colors"
                                        href="#">Documentation</a></li>
                                    <li><a className="text-indigo-200 hover:text-white text-sm transition-colors" href="#">Help
                                        Center</a></li>
                                    <li><a className="text-indigo-200 hover:text-white text-sm transition-colors"
                                        href="#">Partners</a></li>
                                    <li><a className="text-indigo-200 hover:text-white text-sm transition-colors"
                                        href="#">Guides</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-6">Legal</h4>
                                <ul className="space-y-4">
                                    <li><a className="text-indigo-200 hover:text-white text-sm transition-colors"
                                        href="#">Privacy</a></li>
                                    <li><a className="text-indigo-200 hover:text-white text-sm transition-colors" href="#">Terms</a>
                                    </li>
                                    <li><a className="text-indigo-200 hover:text-white text-sm transition-colors"
                                        href="#">Security</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-indigo-200 text-sm">© 2024 Brainx Inc. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a className="text-indigo-200 hover:text-white transition-colors" href="#">
                                <span className="sr-only">Twitter</span>
                                <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a15.292 15.292 0 01-4.43 1.228 7.72 7.72 0 003.391-4.26a15.434 15.434 0 01-4.897 1.88 7.712 7.712 0 00-13.136 6.945A21.895 21.895 0 011.082 3.123 7.697 7.697 0 003.483 13.43 7.684 7.684 0 011.168 12.6v.098c0 3.729 2.653 6.84 6.175 7.548a7.718 7.718 0 01-3.483.132 7.715 7.715 0 007.2 5.353 15.46 15.46 0 01-9.563 2.695C.85 20.28 0 20.233 0 20.183c2.42 1.554 5.296 2.46 8.29 2.46">
                                    </path>
                                </svg>
                            </a>
                            <a className="text-indigo-200 hover:text-white transition-colors" href="#">
                                <span className="sr-only">GitHub</span>
                                <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path clipRule="evenodd"
                                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                        fillRule="evenodd"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
