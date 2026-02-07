import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import logo from '../assets/logo.png';
import Header from '../components/Header';
import { getCourses } from '../services/api';

export default function CourseList() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState({ academic: true, skilled: false });
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await getCourses(0, 100);
            const mappedCourses = data.map(c => ({
                id: c.id,
                title: c.title,
                description: c.description,
                image: c.image, // URL from backend
                imageFilter: 'brightness-[0.9]', // Default visual style
                badge: c.badge ? { 
                    text: c.badge.badge_text, 
                    icon: c.badge.badge_icon, 
                    className: c.badge.css_class_name 
                } : null,
                provider: c.provider ? { 
                    name: c.provider.name, 
                    logo: c.provider.logo_url, 
                    className: c.provider.css_class_name 
                } : { name: 'Brainx' },
                metaText: `${c.level} · ${c.duration_weeks} Weeks`,
                rating: '4.8', // Static for now
                price: null,
                tag: null
            }));
            setCourses(mappedCourses);
        } catch (err) {
            console.error("Failed to fetch courses:", err);
            setError("Failed to load courses.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light font-display text-[#120f1a] overflow-x-hidden antialiased">
            <Header />
            <section className="pt-24 pb-8 bg-white border-b border-gray-200">
                <div className="layout-container px-6 md:px-10 lg:px-40">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#120f1a] mb-8">Browse Courses</h1>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <span
                                className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                            <input
                                className="w-full pl-14 pr-4 h-14 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm text-lg placeholder-gray-400"
                                placeholder="Search Courses..." type="text" />
                        </div>
                        <div className="relative w-full md:w-72">
                            <span
                                className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">sort</span>
                            <select
                                className="w-full pl-14 pr-10 h-14 rounded-2xl border border-gray-200 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm appearance-none cursor-pointer text-gray-700 font-bold text-sm">
                                <option>Sort by: Newest</option>
                                <option>Sort by: Rating</option>
                                <option>Sort by: Price (Low to High)</option>
                                <option>Sort by: Price (High to Low)</option>
                            </select>
                            <span
                                className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                        </div>
                    </div>
                </div>
            </section>
            <div className="layout-container px-4 md:px-8 lg:px-12 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="w-full lg:w-56 flex-shrink-0 space-y-6">
                        <div>
                            <h3 className="font-bold text-[#120f1a] mb-3 flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-primary text-lg">category</span>
                                Category
                            </h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 group cursor-pointer">
                                    <input defaultChecked
                                        className="size-4 rounded border-gray-300 text-primary focus:ring-primary/20 transition-all checked:bg-primary"
                                        type="checkbox" />
                                    <span
                                        className="text-gray-600 font-medium text-sm group-hover:text-primary transition-colors">Academic</span>
                                    <span
                                        className="ml-auto text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">840</span>
                                </label>
                                <label className="flex items-center gap-3 group cursor-pointer">
                                    <input
                                        className="size-4 rounded border-gray-300 text-primary focus:ring-primary/20 transition-all checked:bg-primary"
                                        type="checkbox" />
                                    <span
                                        className="text-gray-600 font-medium text-sm group-hover:text-primary transition-colors">Skilled</span>
                                    <span
                                        className="ml-auto text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">400</span>
                                </label>
                            </div>
                        </div>
                        <button
                            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold text-xs hover:bg-gray-50 hover:text-[#120f1a] transition-all">
                            Reset Filters
                        </button>
                    </aside>
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                            <p className="text-gray-500 font-medium">Showing <span className="text-[#120f1a] font-bold">{courses.length}</span>
                                result{courses.length !== 1 && 's'}</p>
                            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
                                <button className="p-2 rounded-lg bg-primary/10 text-primary shadow-sm transition-all">
                                    <span className="material-symbols-outlined text-[20px] block">grid_view</span>
                                </button>
                                <button
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
                                    <span className="material-symbols-outlined text-[20px] block">view_list</span>
                                </button>
                            </div>
                        </div>
                        
                        {loading ? (
                            <div className="text-center py-20 text-gray-500">Loading courses...</div>
                        ) : error ? (
                            <div className="text-center py-20 text-red-500">{error}</div>
                        ) : courses.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">No courses found.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {courses.map((course) => (
                                    <CourseCard key={course.id} {...course} />
                                ))}
                            </div>
                        )}

                        <div className="mt-16 flex justify-center">
                            <nav className="flex items-center gap-2">
                                {/* Pagination (Static for now) */}
                                <a className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                                    href="#">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </a>
                                <a className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white font-bold text-sm shadow-md shadow-primary/30"
                                    href="#">1</a>
                                <a className="h-10 px-4 flex items-center justify-center rounded-full bg-white text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all shadow-sm gap-1 pl-5"
                                    href="#">
                                    Next
                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                </a>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
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
