import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="size-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-lg">school</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">Brainx</span>
                </div>
                <div className="text-slate-500 text-sm">
                    © 2024 Brainx Inc. All rights reserved.
                </div>
                <div className="flex gap-6">
                    <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
                    <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">mail</span></a>
                </div>
            </div>
        </footer>
    );
}
