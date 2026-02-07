import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="fixed top-0 w-full z-50 transition-all duration-300">
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"></div>
            <div className="relative layout-container px-6 md:px-10 lg:px-40 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 text-primary">
                    <div className="size-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[20px]">school</span>
                    </div>
                    <h2 className="text-primary text-xl font-bold tracking-tight">Brainx</h2>
                </Link>
                <nav className="hidden md:flex items-center gap-8">
                    <Link to="/course-list" className="text-gray-600 hover:text-primary text-sm font-medium transition-colors">Courses</Link>
                    <a className="text-gray-600 hover:text-primary text-sm font-medium transition-colors" href="#">Universities</a>
                    <a className="text-gray-600 hover:text-primary text-sm font-medium transition-colors" href="#">Business</a>
                    <a className="text-gray-600 hover:text-primary text-sm font-medium transition-colors" href="#">Pricing</a>
                </nav>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="hidden sm:flex h-10 px-6 items-center justify-center rounded-full hover:bg-gray-100 text-gray-700 text-sm font-bold border border-gray-200 transition-all">
                        Login
                    </Link>
                    <Link to="/signup" className="flex h-10 px-6 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark text-sm font-bold shadow-lg shadow-primary/20 transition-all">
                        Get Started
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
