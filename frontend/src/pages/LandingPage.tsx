import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';
import CourseCard from '../components/CourseCard';
import { getCourses } from '../services/api';

interface Course {
    id: number | string;
    title: string;
    description: string;
    image?: string;
    level?: string;
    duration_weeks?: number;
    badge?: { text: string; className: string } | null;
    provider?: { name: string; logo?: string; shorthand?: string; shorthandBg?: string };
    metaText?: string;
    rating?: string | number;
    category_id?: number | string;
    status?: boolean;
}

const LandingPage = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [trendingCourses, setTrendingCourses] = useState<Course[]>([]);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const data: any[] = await getCourses(0, 4);
                const mapped: Course[] = data.map(c => ({
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    image: c.image,
                    rating: '4.8',
                    badge: c.badge ? { text: c.badge.badge_text, className: c.badge.css_class_name } : null,
                    provider: c.provider ? { name: c.provider.name, logo: c.provider.logo_url } : { name: 'Brainx' },
                    metaText: `${c.level}`
                }));
                setTrendingCourses(mapped);
            } catch (err) {
                console.error("Failed to fetch trending courses", err);
            }
        };
        fetchTrending();
    }, []);

    const heroImages = [
        "https://brainx.b-cdn.net/portrait-smiling-blond-girl-student-studying-home-elearning-writing-down-notes-notebook.jpg", // Original
        "https://brainx.b-cdn.net/portrait-young-asian-woman-working-laptop-making-notes-writing-down-while-attending-online.jpg", // Math
        "https://brainx.b-cdn.net/smiley-teacher-classroom.jpg" // Code
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const scrollToContent = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    };
    return (
        <div className="bg-background-light font-display text-[#120f1a] overflow-x-hidden antialiased">
            <Header />
            <section className="relative pt-20 group carousel-container">
                <div className="relative w-full h-[500px] md:h-[450px] lg:h-[500px] overflow-hidden bg-gray-900">
                    <div
                        className="absolute inset-0 w-full h-full flex transition-transform duration-1000 ease-in-out"
                        style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                    >
                        {heroImages.map((img, index) => (
                            <div
                                key={index}
                                className="min-w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url('${img}')` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#5022c3]/90 via-[#5022c3]/40 to-transparent"></div>
                            </div>
                        ))}
                    </div>
                    {/* 
                    <div className="absolute inset-0 w-full h-full pointer-events-none">
                         <div
                            className="absolute right-[15%] top-[20%] w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl rotate-12 flex items-center justify-center shadow-lg animate-pulse">
                            <span className="material-symbols-outlined text-white text-5xl drop-shadow-md">shield</span>
                        </div>
                        <div className="absolute right-[25%] bottom-[20%] w-20 h-20 bg-blue-400/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg"
                            style={{ animationDelay: "1s" }}>
                            <span className="material-symbols-outlined text-white text-4xl drop-shadow-md">auto_graph</span>
                        </div>
                    </div> */}

                    <div className="layout-container px-6 md:px-10 lg:px-40 h-full relative z-10 flex items-center pointer-events-none">
                        <div className="bg-white p-8 md:p-10 max-w-lg shadow-card-float rounded-[4px] relative z-20 pointer-events-auto">
                            <h1
                                className="text-3xl md:text-4xl font-extrabold text-[#120f1a] mb-4 leading-tight tracking-tight">
                                Master tomorrow's skills today
                            </h1>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                Power up your career with expert-led courses designed for the modern professional.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    className="h-12 px-6 bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 flex items-center justify-center">
                                    Get Personal Plan
                                </button>
                                <button
                                    className="h-12 px-6 bg-white text-primary border border-primary font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={scrollToContent}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 hover:text-white transition-colors animate-bounce z-20 pointer-events-auto"
                        aria-label="Scroll down"
                    >
                        <span className="material-symbols-outlined text-4xl">keyboard_arrow_down</span>
                    </button>
                </div>
            </section>

            <section className="bg-white py-12 border-b border-[#ebe8f2]">
                <div className="layout-container px-6 md:px-10 lg:px-40">
                    <div
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#ebe8f2]">
                        <div className="flex flex-col items-center justify-center p-4">
                            <span className="material-symbols-outlined text-primary text-4xl mb-3 opacity-80">groups</span>
                            <h3 className="text-4xl font-bold text-primary mb-1">50k+</h3>
                            <p className="text-[#120f1a] font-medium text-sm tracking-wide uppercase opacity-70">Active Learners</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4">
                            <span
                                className="material-symbols-outlined text-primary text-4xl mb-3 opacity-80">workspace_premium</span>
                            <h3 className="text-4xl font-bold text-primary mb-1">94%</h3>
                            <p className="text-[#120f1a] font-medium text-sm tracking-wide uppercase opacity-70">Completion Rate</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4">
                            <span className="material-symbols-outlined text-primary text-4xl mb-3 opacity-80">handshake</span>
                            <h3 className="text-4xl font-bold text-primary mb-1">100+</h3>
                            <p className="text-[#120f1a] font-medium text-sm tracking-wide uppercase opacity-70">Industry Partners
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-[#f9f8fb] py-20 overflow-hidden">
                <div className="layout-container px-6 md:px-10 lg:px-16">
                    <div className="mb-20">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-[#120f1a] text-3xl font-bold mb-2">Academic Excellence</h2>
                                <p className="text-[#655393] text-base">Top-tier university courses from world-renowned
                                    institutions.</p>
                            </div>
                            <Link to="/course-list" className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <CourseCard
                                title="Modern European History"
                                description="An in-depth analysis of political and social movements from 1789."
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuAw5ouygVjHBJAMbKvNO82eO9Vnbh2mGNzFV_JUw1R_acPWoC4N2DH4iqDHJREoE9GGnAYIzYnrTrORp4erZIgVMQBKqxBoEdvtYMSfdi76IUp5S8B6NL2K_hNSxPt078Vd4Oq6cAVQcpIh1DNIvlZmxy97FrALUMSc69ES0KhtBBsHOfFKWOIcD7njHUMuZDi85XyAjv8DskrcQ1-JNMWeJwyoH1ntA3ZLCBzkeQGsaCeiO5bVvSZXBme49GFkgx58tl-ceG3cwQk"
                                badge={{ text: 'Humanities', className: 'bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider' }}
                                rating="4.8"
                                metaText="History Dept."
                                provider={{ name: 'Oxford Univ.', logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkky04Ox5SRgP6_Y8J_4L4dXdfRY6Ovhnodv16D0h4JEYRgNViUrncVaIFX_1hAJta9DWdoeLdG64dKOg7PIaawsTftxs3S_lx-0mmdZXQ7m4VRA8-ObiQUOkngbyngTDw-XhBDHXfzOsslLCix_RT9XXUOUJ1NCBy1YAOgD8N3vE9fR0wF8fJZ9nRlpEvoALeVoIKidH_CKFhO549JnozMJjfrFnB--BTVNNHRYRXh8D9nPUAk50mrAL-0ZNxvavQr6XJJ1u4Ey4' }}
                            />
                            <CourseCard
                                title="Advanced Calculus"
                                description="Understanding limits, derivatives, integrals, and infinite series."
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuC5jeA5kJD9PH6vFYDZuQ-cOvWsQemoyH7k-g3YOC94qKRFQFKjJsUoFzogEb9UTD5_aei3Om-iHjLjSzNiqr3AMR0TETUBQ_U2pzzSXVDnfN_nQU89Utk-_glTsBQqxHk0OpRClGikV__gA8iYEBHzHgrsvtISKbcqeUEm8mzZk8U3TsKqxQBT1YU-Yr9O-S2iHtosKagFAaLBsfheOF6rmXsFjq49tv_IC-DWTyF2bRbmPgR5EGTNipuCObOIDAtGbbWa8MOuk_w"
                                badge={{ text: 'Math', className: 'bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider' }}
                                rating="4.7"
                                metaText="Math Dept."
                                provider={{ name: 'MIT OpenWare', shorthand: 'MIT', shorthandBg: 'bg-red-800' }}
                            />
                            <CourseCard
                                title="Ethics & Society"
                                description="Exploring moral dilemmas in the modern technological landscape."
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuAw5ouygVjHBJAMbKvNO82eO9Vnbh2mGNzFV_JUw1R_acPWoC4N2DH4iqDHJREoE9GGnAYIzYnrTrORp4erZIgVMQBKqxBoEdvtYMSfdi76IUp5S8B6NL2K_hNSxPt078Vd4Oq6cAVQcpIh1DNIvlZmxy97FrALUMSc69ES0KhtBBsHOfFKWOIcD7njHUMuZDi85XyAjv8DskrcQ1-JNMWeJwyoH1ntA3ZLCBzkeQGsaCeiO5bVvSZXBme49GFkgx58tl-ceG3cwQk"
                                imageFilter="hue-rotate(45deg)"
                                badge={{ text: 'Philosophy', className: 'bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider' }}
                                rating="4.9"
                                metaText="Philosophy Dept."
                                provider={{ name: 'Yale Univ.', shorthand: 'YALE', shorthandBg: 'bg-blue-900' }}
                            />
                            <CourseCard
                                title="Quantum Mechanics"
                                description="A fundamental introduction to quantum physics and wave theory."
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuC5jeA5kJD9PH6vFYDZuQ-cOvWsQemoyH7k-g3YOC94qKRFQFKjJsUoFzogEb9UTD5_aei3Om-iHjLjSzNiqr3AMR0TETUBQ_U2pzzSXVDnfN_nQU89Utk-_glTsBQqxHk0OpRClGikV__gA8iYEBHzHgrsvtISKbcqeUEm8mzZk8U3TsKqxQBT1YU-Yr9O-S2iHtosKagFAaLBsfheOF6rmXsFjq49tv_IC-DWTyF2bRbmPgR5EGTNipuCObOIDAtGbbWa8MOuk_w"
                                imageFilter="hue-rotate(180deg)"
                                badge={{ text: 'Physics', className: 'bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider' }}
                                rating="4.6"
                                metaText="Science Dept."
                                provider={{ name: 'Princeton', shorthand: 'PU', shorthandBg: 'bg-orange-700' }}
                            />
                        </div>
                    </div>

                    <div className="mb-20">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-[#120f1a] text-3xl font-bold mb-2">Professional Skills</h2>
                                <p className="text-[#655393] text-base">Job-ready skills taught by industry experts.</p>
                            </div>
                            <Link to="/course-list" className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <CourseCard
                                title="Full-Stack React"
                                description="Master modern web development with React, Node.js, and cloud deployment."
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuAAm4CMB9p_vM-2WRCkGAFih7mJxIS5wsSQR4yXoWP7aczzyy31vvd6n5d7GVz1hr1p6VCxA7xdKd6BvhzaQ4gZX-b0-vfz1a5twEECOxh4jaXxrPcr0B_D89Cx2KEb0bi5rVyDTQVYH3bGJWEbAlCpGqDDB0cmtLjENjxRE-d2FDhS_HiYdNlYI_kNXcLyPlfeOe4VrKQuYO0ph-7Q2Z47vlTWabG4E2oX5wLkt7-G_uLhjL5Axn3AIwPnwo6iEM40hVo_ZkyoPoY"
                                badge={{ text: 'Dev', className: 'bg-primary text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md' }}
                                rating="4.9"
                                metaText="Tech Track"
                                provider={{ name: 'DevAcademy', shorthand: 'DEV', shorthandBg: 'bg-black' }}
                            />
                            <CourseCard
                                title="Python for Data Science"
                                description="Learn to analyze data, create visualizations, and build ML models."
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuAAm4CMB9p_vM-2WRCkGAFih7mJxIS5wsSQR4yXoWP7aczzyy31vvd6n5d7GVz1hr1p6VCxA7xdKd6BvhzaQ4gZX-b0-vfz1a5twEECOxh4jaXxrPcr0B_D89Cx2KEb0bi5rVyDTQVYH3bGJWEbAlCpGqDDB0cmtLjENjxRE-d2FDhS_HiYdNlYI_kNXcLyPlfeOe4VrKQuYO0ph-7Q2Z47vlTWabG4E2oX5wLkt7-G_uLhjL5Axn3AIwPnwo6iEM40hVo_ZkyoPoY"
                                imageFilter="hue-rotate(90deg)"
                                badge={{ text: 'Data', className: 'bg-primary text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md' }}
                                rating="4.7"
                                metaText="Data Science"
                                provider={{ name: 'PyInstitute', shorthand: 'PY', shorthandBg: 'bg-blue-600' }}
                            />
                            <CourseCard
                                title="Digital Growth Strategies"
                                description="SEO, SEM, and content marketing strategies for 2024."
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuAAm4CMB9p_vM-2WRCkGAFih7mJxIS5wsSQR4yXoWP7aczzyy31vvd6n5d7GVz1hr1p6VCxA7xdKd6BvhzaQ4gZX-b0-vfz1a5twEECOxh4jaXxrPcr0B_D89Cx2KEb0bi5rVyDTQVYH3bGJWEbAlCpGqDDB0cmtLjENjxRE-d2FDhS_HiYdNlYI_kNXcLyPlfeOe4VrKQuYO0ph-7Q2Z47vlTWabG4E2oX5wLkt7-G_uLhjL5Axn3AIwPnwo6iEM40hVo_ZkyoPoY"
                                imageFilter="hue-rotate(220deg) sepia(0.5)"
                                badge={{ text: 'Marketing', className: 'bg-primary text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md' }}
                                rating="4.5"
                                metaText="Marketing"
                                provider={{ name: 'GrowthLabs', shorthand: 'MK', shorthandBg: 'bg-orange-500' }}
                            />
                            <CourseCard
                                title="UI/UX Masterclass"
                                description="From wireframing to high-fidelity prototyping with Figma."
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuAAm4CMB9p_vM-2WRCkGAFih7mJxIS5wsSQR4yXoWP7aczzyy31vvd6n5d7GVz1hr1p6VCxA7xdKd6BvhzaQ4gZX-b0-vfz1a5twEECOxh4jaXxrPcr0B_D89Cx2KEb0bi5rVyDTQVYH3bGJWEbAlCpGqDDB0cmtLjENjxRE-d2FDhS_HiYdNlYI_kNXcLyPlfeOe4VrKQuYO0ph-7Q2Z47vlTWabG4E2oX5wLkt7-G_uLhjL5Axn3AIwPnwo6iEM40hVo_ZkyoPoY"
                                imageFilter="invert(0.1)"
                                badge={{ text: 'Design', className: 'bg-primary text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md' }}
                                rating="4.8"
                                metaText="Design"
                                provider={{ name: 'DesignCo', shorthand: 'UX', shorthandBg: 'bg-pink-500' }}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-[#120f1a] text-3xl font-bold mb-2">Trending Courses</h2>
                                <p className="text-[#655393] text-base">The most popular courses our community is learning this
                                    week.</p>
                            </div>
                            <Link to="/course-list" className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {trendingCourses.length > 0 ? (
                                trendingCourses.map(course => (
                                    <CourseCard key={course.id} {...course} />
                                ))
                            ) : (
                                <div className="col-span-4 text-center text-gray-400">Loading trending courses...</div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white py-24 relative overflow-hidden">
                <div
                    className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/50 to-transparent pointer-events-none">
                </div>
                <div className="layout-container px-6 md:px-10 lg:px-40 relative z-10">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-[#120f1a] text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Voices of our
                            Community</h2>
                        <p className="text-[#655393] text-lg md:text-xl font-light leading-relaxed">
                            Real stories from learners who have transformed their careers and achieved academic excellence
                            through our platform.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                        <div
                            className="bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_-15px_rgba(80,34,195,0.15)] border border-indigo-50 hover:-translate-y-2 transition-transform duration-300">
                            <span className="material-symbols-outlined text-4xl text-primary/20 mb-6">format_quote</span>
                            <p className="text-lg text-[#120f1a] font-medium leading-relaxed mb-8">
                                "The transition from academia to industry was daunting, but the <span
                                    className="text-primary font-bold">Skilled Track</span> gave me the exact portfolio pieces I
                                needed to land my dream role."
                            </p>
                            <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                                <div
                                    className="size-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                                    <img alt="User Avatar" className="w-full h-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMlcIOe2w9oljqude9je0US63l-XlYS6HSVgFuZjYDdNAtMDY2YN5C_JEjRGBWNXJQ4lkOpCRMlNO1nXGrO0tCrEDkfeF2fJv1h3SJF1rvmRfVxiJI8mR6eVFmLEpZF7L4MIDi87gBOV1YnQqGTWOBCTmVW2BBDqYSbq_Or2LrKxPoldv_ddoLeGbIdJk10eORHol5pmqvqp5j1IS9Rvmze-oysA-1ftapUlt1Qi-d87ZsNIqfmnJxNV_M6aznwd5rA0Tcup9_CzM" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#120f1a] text-base">Sarah Jenkins</h4>
                                    <p className="text-sm text-gray-500 font-medium">Software Engineer at <span
                                        className="text-primary font-semibold">Google</span></p>
                                </div>
                            </div>
                        </div>
                        <div
                            className="bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_-15px_rgba(80,34,195,0.15)] border border-indigo-50 hover:-translate-y-2 transition-transform duration-300 md:translate-y-8">
                            <span className="material-symbols-outlined text-4xl text-primary/20 mb-6">format_quote</span>
                            <p className="text-lg text-[#120f1a] font-medium leading-relaxed mb-8">
                                "I never thought online learning could match the rigor of my university courses until I tried
                                the <span className="text-primary font-bold">Academic Modules</span> here. Absolutely world-class
                                content."
                            </p>
                            <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                                <div
                                    className="size-12 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                                    <img alt="User Avatar" className="w-full h-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsJdJCgif9XtzdHOqBL7_wwUf5zN9PnurkpQ5n8a4kCgsOrY83BizmiYmEl3pCVelA0xoz0k4134IH4RWwWtafLBZ6wsxGYMgDxFaEHGYvJWUf6LiBy9X7S2051NesyYvtG3Y0vr4FCV9-OhiLJ1xciPx90lXgzKSGF7nriJhUZRQ1HUeGYwpEJIZObXk7tQnpU19BFV5AJ4TUElP5klsT1ETFkr-MSK1jalc6ABtTiu5_ztKS_SU2vdVOZjmuMEYfV22d4NLqFb8" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#120f1a] text-base">David Chen</h4>
                                    <p className="text-sm text-gray-500 font-medium">PhD Candidate at <span
                                        className="text-primary font-semibold">Stanford</span></p>
                                </div>
                            </div>
                        </div>
                        <div
                            className="bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_-15px_rgba(80,34,195,0.15)] border border-indigo-50 hover:-translate-y-2 transition-transform duration-300">
                            <span className="material-symbols-outlined text-4xl text-primary/20 mb-6">format_quote</span>
                            <p className="text-lg text-[#120f1a] font-medium leading-relaxed mb-8">
                                "The community support is unmatched. Being able to collaborate with peers on <span
                                    className="text-primary font-bold">real-world projects</span> made all the difference in my
                                learning journey."
                            </p>
                            <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                                <div className="size-12 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden">
                                    <img alt="User Avatar" className="w-full h-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnDmXuHZ7PM3laSH0jpJudBI1ZLemSGwLKDBVaXAzLGCQp4LJjcSY5PgsPcYIFeUGFSC-Mrrg0t9wgc3DbeV5RAE3NKNMWdWTRqcWTXa7gI8IAMJehP1u36HnjKR3kGe4FfQGHOdeLx61D7dFbr37yi8TsY9mavo_UOXJ9V0eYX_gfBpdhdcZIbdQrgCAE9LjnE_khY_w_xMyQ9V21bkfIczDqqiwZucjBKRNZ161VsMjXt9kavK4gvZPcqvtmy1ahCA6WnADtdxc" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#120f1a] text-base">Elena Rodriguez</h4>
                                    <p className="text-sm text-gray-500 font-medium">Product Designer at <span
                                        className="text-primary font-semibold">Airbnb</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-primary text-white pt-20 pb-10">
                <div className="layout-container px-6 md:px-10 lg:px-40">
                    <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-16">
                        <div className="lg:w-1/3">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-white text-[20px]">school</span>
                                </div>
                                <h2 className="text-white text-xl font-bold tracking-tight">Premier LMS</h2>
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
                        <p className="text-indigo-200 text-sm">© 2024 Premier LMS Inc. All rights reserved.</p>
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
};

export default LandingPage;
