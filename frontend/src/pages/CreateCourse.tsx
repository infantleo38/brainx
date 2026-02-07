import React, { useState, useEffect } from 'react';
import { getCategories, createCourse, uploadProfileImage, getProviders, getBadges, createProvider, createBadge } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Category {
    id: number | string;
    name: string;
}

interface Provider {
    id: number | string;
    name: string;
}

interface Badge {
    id: number | string;
    badge_text: string;
    badge_type?: string;
}

interface FormData {
    title: string;
    description: string;
    category_id: string | number;
    level: string;
    duration_hours: string | number;
    duration_weeks: string | number;
    image: string;
    status: boolean;
    provider_id: string | number;
    badge_id: string | number;
}

export default function CreateCourse() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState<Category[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal state
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
    const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
    const [newProviderName, setNewProviderName] = useState('');
    const [newBadgeText, setNewBadgeText] = useState('');
    const [newBadgeType, setNewBadgeType] = useState('hot');

    // Form State
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        category_id: '',
        level: 'Beginner',
        duration_hours: '',
        duration_weeks: '',
        image: '',
        status: true, // Default to active? Checkbox logic might need to be verified
        provider_id: '',
        badge_id: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [categoriesData, providersData, badgesData] = await Promise.all([
                    getCategories(),
                    getProviders(),
                    getBadges()
                ]);
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
                setProviders(Array.isArray(providersData) ? providersData : []);
                setBadges(Array.isArray(badgesData) ? badgesData : []);
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const publicUrl = await uploadProfileImage(file);
            setFormData(prev => ({ ...prev, image: publicUrl }));
        } catch (error) {
            console.error("Failed to upload image:", error);
            alert("Failed to upload image.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    // Additional validaton checks could go here before nextStep

    const handlePublish = async () => {
        setIsSubmitting(true);
        try {
            // Prepare payload matching API requirements
            const payload = {
                title: formData.title,
                description: formData.description,
                level: formData.level,
                duration_hours: parseInt(String(formData.duration_hours)) || 0,
                duration_weeks: parseInt(String(formData.duration_weeks)) || 0,
                status: formData.status,
                image: formData.image,
                category_id: parseInt(String(formData.category_id)) || 0,
                provider_id: formData.provider_id ? parseInt(String(formData.provider_id)) : null,
                badge_id: formData.badge_id ? parseInt(String(formData.badge_id)) : null,
            };

            await createCourse(payload);
            // Navigate to course listing or show success message
            // navigate('/admin/courses'); or similar
            alert('Course created successfully!'); // Placeholder feedback
            setStep(1);
            setFormData({
                title: '',
                description: '',
                category_id: '',
                level: 'Beginner',
                duration_hours: '',
                duration_weeks: '',
                image: '',
                status: true,
                provider_id: '',
                badge_id: ''
            });
        } catch (error) {
            console.error("Failed to create course:", error);
            alert("Failed to create course. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateProvider = async () => {
        if (!newProviderName.trim()) return;
        try {
            const newProvider = await createProvider({ name: newProviderName });
            setProviders([...providers, newProvider]);
            setFormData({ ...formData, provider_id: newProvider.id });
            setIsProviderModalOpen(false);
            setNewProviderName('');
        } catch (error) {
            console.error("Failed to create provider:", error);
            alert("Failed to create provider.");
        }
    };

    const handleCreateBadge = async () => {
        if (!newBadgeText.trim()) return;
        try {
            const newBadge = await createBadge({ 
                badge_text: newBadgeText,
                badge_type: newBadgeType
            });
            setBadges([...badges, newBadge]);
            setFormData({ ...formData, badge_id: newBadge.id });
            setIsBadgeModalOpen(false);
            setNewBadgeText('');
            setNewBadgeType('hot');
        } catch (error) {
            console.error("Failed to create badge:", error);
            alert("Failed to create badge.");
        }
    };

    const getCategoryName = (id: string | number) => {
        const cat = categories.find(c => c.id === (typeof id === 'string' ? parseInt(id) : id));
        return cat ? cat.name : 'Unknown';
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark h-full relative">
            <header className="bg-white dark:bg-[#15202b] border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between md:hidden z-30">
                <div className="flex items-center gap-2">
                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-xl">school</span>
                    </div>
                    <span className="font-bold">Brainx</span>
                </div>
                <button className="p-2 text-slate-500"><span className="material-symbols-outlined">menu</span></button>
            </header>
            <div className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-8">
                <div className="max-w-4xl mx-auto w-full space-y-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/courses')}
                            className="size-10 flex items-center justify-center rounded-xl bg-white dark:bg-[#15202b] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary hover:border-primary/50 transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Course</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Configure course details, curriculum, and
                                instructors.</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <nav aria-label="Progress">
                        <ol className="flex items-center w-full" role="list">
                            {/* Step 1 */}
                            <li className="relative pr-8 sm:pr-20">
                                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                    <div className="h-0.5 w-full bg-primary"></div>
                                </div>
                                <a className={`relative flex size-8 items-center justify-center rounded-full transition-colors ${step > 1
                                    ? 'bg-emerald-500 hover:bg-emerald-600'
                                    : 'bg-primary hover:bg-blue-600'
                                    }`}
                                    href="#" onClick={(e) => { e.preventDefault(); setStep(1); }}>
                                    {step > 1 ? (
                                        <span className="material-symbols-outlined text-white text-sm">check</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-white text-sm">edit_document</span>
                                    )}
                                    <span className={`absolute -bottom-8 text-xs font-semibold whitespace-nowrap ${step > 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'
                                        }`}>Basic Info</span>
                                </a>
                            </li>
                            {/* Step 2 */}
                            <li className="relative pr-8 sm:pr-20">
                                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                    <div className={`h-0.5 w-full ${step >= 2 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                </div>
                                <a className={`relative flex size-8 items-center justify-center rounded-full transition-colors ${step === 2
                                    ? 'bg-primary ring-4 ring-blue-50 dark:ring-blue-900/20 z-10'
                                    : step > 2
                                        ? 'bg-emerald-500'
                                        : 'bg-white dark:bg-[#15202b] border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400'
                                    }`}
                                    href="#" onClick={(e) => { e.preventDefault(); if (step > 2) setStep(2); }}>
                                    {step > 2 ? (
                                        <span className="material-symbols-outlined text-white text-sm">check</span>
                                    ) : step === 2 ? (
                                        <span className="material-symbols-outlined text-white text-sm">edit_calendar</span>
                                    ) : (
                                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">2</span>
                                    )}
                                    <span className={`absolute -bottom-8 text-xs whitespace-nowrap ${step === 2 ? 'font-bold text-primary' : 'font-medium text-slate-500 dark:text-slate-400'
                                        }`}>Details</span>
                                </a>
                            </li>
                            {/* Step 3 */}
                            <li className="relative pr-8 sm:pr-20">
                                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                    <div className={`h-0.5 w-full ${step >= 3 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                </div>
                                <a className={`relative flex size-8 items-center justify-center rounded-full transition-colors ${step === 3
                                    ? 'bg-primary ring-4 ring-blue-50 dark:ring-blue-900/20 z-10'
                                    : step > 3
                                        ? 'bg-emerald-500'
                                        : 'bg-white dark:bg-[#15202b] border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400'
                                    }`}
                                    href="#">
                                    {step === 3 ? (
                                        <span className="material-symbols-outlined text-white text-sm">group</span>
                                    ) : (
                                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">3</span>
                                    )}
                                    <span className={`absolute -bottom-8 text-xs font-medium whitespace-nowrap ${step === 3 ? 'text-primary font-bold' : 'text-slate-500 dark:text-slate-400'
                                        }`}>Instructors</span>
                                </a>
                            </li>
                            {/* Step 4 */}
                            <li className="relative">
                                <a className={`relative flex size-8 items-center justify-center rounded-full transition-colors ${step === 4
                                    ? 'bg-primary ring-4 ring-blue-50 dark:ring-blue-900/20 z-10'
                                    : 'bg-white dark:bg-[#15202b] border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400'
                                    }`}
                                    href="#">
                                    {step === 4 ? (
                                        <span className="material-symbols-outlined text-white text-sm">flag</span>
                                    ) : (
                                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">4</span>
                                    )}
                                    <span className={`absolute -bottom-8 text-xs font-medium whitespace-nowrap ${step === 4 ? 'text-primary font-bold' : 'text-slate-500 dark:text-slate-400'
                                        }`}>Status</span>
                                </a>
                            </li>
                        </ol>
                    </nav>

                    <div className="bg-white dark:bg-[#15202b] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mt-8">
                        <div className="p-6 md:p-8 space-y-8">

                            {/* Step 1 Content: Basic Info */}
                            {step === 1 && (
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                                        <div
                                            className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-lg">edit_square</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h3>
                                    </div>

                                    {/* Image Upload */}
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                                        <div className="relative group cursor-pointer">
                                            <div className="size-32 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                                                {formData.image ? (
                                                    <img src={formData.image} alt="Course Thumbnail" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-4xl text-slate-400">image</span>
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                                <span className="material-symbols-outlined text-white">upload</span>
                                            </div>
                                            <input type="file" onChange={handleImageUpload} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">Upload Course Thumbnail</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                                htmlFor="title">Course Title</label>
                                            <div className="relative">
                                                <input
                                                    className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-4"
                                                    id="title" name="title"
                                                    value={formData.title} onChange={handleChange}
                                                    placeholder="e.g. Advanced Machine Learning Patterns" type="text" />
                                            </div>
                                        </div>
                                        <div className="md:col-span-1 space-y-1.5">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                                htmlFor="category_id">Category</label>
                                            <select
                                                className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-4"
                                                id="category_id" name="category_id"
                                                value={formData.category_id} onChange={handleChange}>
                                                <option value="">Select a category</option>
                                                {isLoading ? (
                                                    <option disabled>Loading...</option>
                                                ) : (
                                                    categories.map((cat) => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-1.5">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                                htmlFor="description">Description</label>
                                            <textarea
                                                className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-4 placeholder:text-slate-400"
                                                id="description" name="description"
                                                value={formData.description} onChange={handleChange}
                                                placeholder="Enter a comprehensive description of the course curriculum and objectives..."
                                                rows={4}></textarea>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 text-right">{formData.description.length}/500 characters
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Step 2 Content: Details & Status */}
                            {step === 2 && (
                                <>
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <div
                                                className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-lg">calendar_month</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Course Details &amp; Schedule</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="space-y-1.5 col-span-1 md:col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                                    htmlFor="level">Course Level</label>
                                                <div className="relative">
                                                    <select
                                                        className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-4 appearance-none"
                                                        id="level" name="level"
                                                        value={formData.level} onChange={handleChange}>
                                                        <option value="Beginner">Beginner</option>
                                                        <option value="Intermediate">Intermediate</option>
                                                        <option value="Advanced">Advanced</option>
                                                    </select>
                                                    <div
                                                        className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                                        <span className="material-symbols-outlined text-lg">expand_more</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">Select the difficulty tier.</p>
                                            </div>
                                            <div className="space-y-1.5 col-span-1 md:col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                                    htmlFor="duration_hours">Duration (Hours)</label>
                                                <div className="relative rounded-md shadow-sm">
                                                    <div
                                                        className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <span
                                                            className="material-symbols-outlined text-slate-400 text-lg">schedule</span>
                                                    </div>
                                                    <input
                                                        className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white pl-10 focus:border-primary focus:ring-primary sm:text-sm py-2.5"
                                                        id="duration_hours" name="duration_hours" placeholder="e.g. 24"
                                                        value={formData.duration_hours} onChange={handleChange}
                                                        type="number" />
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">Total video content length.</p>
                                            </div>
                                            <div className="space-y-1.5 col-span-1 md:col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                                    htmlFor="duration_weeks">Duration (Weeks)</label>
                                                <div className="relative rounded-md shadow-sm">
                                                    <div
                                                        className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <span
                                                            className="material-symbols-outlined text-slate-400 text-lg">date_range</span>
                                                    </div>
                                                    <input
                                                        className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white pl-10 focus:border-primary focus:ring-primary sm:text-sm py-2.5"
                                                        id="duration_weeks" name="duration_weeks" placeholder="e.g. 8"
                                                        value={formData.duration_weeks} onChange={handleChange}
                                                        type="number" />
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">Estimated time to complete.</p>
                                            </div>
                                            <div className="space-y-1.5 col-span-1 md:col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                                    htmlFor="provider_id">Provider</label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <select
                                                            className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-4 appearance-none"
                                                            id="provider_id" name="provider_id"
                                                            value={formData.provider_id} onChange={handleChange}>
                                                            <option value="">Select Provider</option>
                                                            {providers.map((p) => (
                                                                <option key={p.id} value={p.id}>{p.name}</option>
                                                            ))}
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                                            <span className="material-symbols-outlined text-lg">expand_more</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsProviderModalOpen(true)}
                                                        className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">add</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 col-span-1 md:col-span-1">
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                                                    htmlFor="badge_id">Badge</label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <select
                                                            className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-4 appearance-none"
                                                            id="badge_id" name="badge_id"
                                                            value={formData.badge_id} onChange={handleChange}>
                                                            <option value="">Select Badge</option>
                                                            {badges.map((b) => (
                                                                <option key={b.id} value={b.id}>{b.badge_text}</option>
                                                            ))}
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                                            <span className="material-symbols-outlined text-lg">expand_more</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsBadgeModalOpen(true)}
                                                        className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">add</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                    <section className="space-y-6 pt-6">
                                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                                            <div
                                                className="size-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-lg">visibility</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Status</h3>
                                        </div>
                                        <div
                                            className="flex items-center justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                                            <div className="flex gap-4">
                                                <div
                                                    className="size-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-slate-600">
                                                    <span className="material-symbols-outlined">power_settings_new</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Active Status
                                                    </h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Toggle to
                                                        make this course active immediately. Inactive courses are hidden from the
                                                        student catalog.</p>
                                                </div>
                                            </div>
                                            <div
                                                className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input
                                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:border-primary transition-all duration-300 peer left-0 checked:translate-x-full"
                                                    id="status" name="status" type="checkbox"
                                                    checked={formData.status} onChange={handleChange} />
                                                <label
                                                    className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer peer-checked:bg-primary transition-colors duration-300"
                                                    htmlFor="status"></label>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}

                            {/* Step 3 Placeholder */}
                            {step === 3 && (
                                <section className="space-y-6 text-center py-10">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-3xl text-slate-400">group_add</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Instructor Assignment</h3>
                                            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">This section would contain the instructor selection and assignment interface.</p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Step 4 Content: Final Review */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                                        <div
                                            className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-lg">fact_check</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Review Summary</h3>
                                    </div>
                                    <section className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div
                                            className="bg-slate-50 dark:bg-slate-800/30 px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                            <h4
                                                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Basic Info</h4>
                                            <button
                                                onClick={(e) => { e.preventDefault(); setStep(1); }}
                                                className="text-primary hover:text-blue-700 dark:hover:text-blue-400 text-sm font-medium flex items-center gap-1 transition-colors">
                                                <span className="material-symbols-outlined text-base">edit</span>
                                                <span>Edit</span>
                                            </button>
                                        </div>
                                        <div className="p-5 flex flex-col md:flex-row gap-6">
                                            <div
                                                className="size-24 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm text-white">
                                                <span className="material-symbols-outlined text-4xl">code</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Course
                                                        Title</span>
                                                    <h5 className="text-lg font-bold text-slate-900 dark:text-white">{formData.title || 'Untitled Course'}</h5>
                                                </div>
                                                <div>
                                                    <span
                                                        className="text-xs text-slate-500 dark:text-slate-400 font-medium">Category</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span
                                                            className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                            {getCategoryName(formData.category_id)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                    <section className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div
                                            className="bg-slate-50 dark:bg-slate-800/30 px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                            <h4
                                                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Details &amp; Schedule</h4>
                                            <button
                                                onClick={(e) => { e.preventDefault(); setStep(2); }}
                                                className="text-primary hover:text-blue-700 dark:hover:text-blue-400 text-sm font-medium flex items-center gap-1 transition-colors">
                                                <span className="material-symbols-outlined text-base">edit</span>
                                                <span>Edit</span>
                                            </button>
                                        </div>
                                        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div>
                                                <span
                                                    className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Level</span>
                                                <p
                                                    className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                    <span
                                                        className="material-symbols-outlined text-base text-yellow-500">trending_up</span>
                                                    {formData.level}
                                                </p>
                                            </div>
                                            <div>
                                                <span
                                                    className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Duration</span>
                                                <p
                                                    className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-base text-slate-400">schedule</span>
                                                    {formData.duration_weeks} Weeks
                                                </p>
                                            </div>
                                            <div>
                                                <span
                                                    className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Hours</span>
                                                <p
                                                    className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                    <span
                                                        className="material-symbols-outlined text-base text-slate-400">library_books</span>
                                                    {formData.duration_hours} Hours
                                                </p>
                                            </div>
                                            <div>
                                                <span
                                                    className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Language</span>
                                                <p
                                                    className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-base text-slate-400">language</span>
                                                    English
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                    <section className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div
                                            className="bg-slate-50 dark:bg-slate-800/30 px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                            <h4
                                                className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Course Instructors</h4>
                                            <button
                                                onClick={(e) => { e.preventDefault(); setStep(3); }}
                                                className="text-primary hover:text-blue-700 dark:hover:text-blue-400 text-sm font-medium flex items-center gap-1 transition-colors">
                                                <span className="material-symbols-outlined text-base">edit</span>
                                                <span>Edit</span>
                                            </button>
                                        </div>
                                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="text-slate-500 italic text-sm p-2">No instructors assigned yet.</div>
                                        </div>
                                    </section>
                                </div>
                            )}

                        </div>

                        {/* Footer / Actions */}
                        <div
                            className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            {step > 1 ? (
                                <button
                                    onClick={prevStep}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-[#15202b] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
                                    type="button">
                                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                                    <span>Previous</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/courses')}
                                    className="text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2 text-sm"
                                    type="button">Cancel</button>
                            )}

                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400 hidden sm:block">Step {step} of 4</span>
                                {step < 4 ? (
                                    <button
                                        onClick={nextStep}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors font-medium text-sm"
                                        type="button">
                                        <span>Save &amp; Continue</span>
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handlePublish}
                                        disabled={isSubmitting}
                                        className={`flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors font-bold text-sm ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        type="button">
                                        <span className="material-symbols-outlined text-lg">rocket_launch</span>
                                        <span>{isSubmitting ? 'Publishing...' : 'Publish Course'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isProviderModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add New Provider</h3>
                            <button onClick={() => setIsProviderModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Provider Name</label>
                                <input
                                    type="text"
                                    value={newProviderName}
                                    onChange={(e) => setNewProviderName(e.target.value)}
                                    placeholder="Enter provider name"
                                    className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-4"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setIsProviderModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateProvider}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                                >
                                    Create Provider
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isBadgeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add New Badge</h3>
                            <button onClick={() => setIsBadgeModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Badge Text</label>
                                <input
                                    type="text"
                                    value={newBadgeText}
                                    onChange={(e) => setNewBadgeText(e.target.value)}
                                    placeholder="Enter badge text (e.g. Best Seller)"
                                    className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-4"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Badge Type</label>
                                <div className="relative">
                                    <select
                                        value={newBadgeType}
                                        onChange={(e) => setNewBadgeType(e.target.value)}
                                        className="block w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 px-4 appearance-none"
                                    >
                                        <option value="hot">Hot</option>
                                        <option value="new">New</option>
                                        <option value="trending">Trending</option>
                                        <option value="popular">Popular</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                        <span className="material-symbols-outlined text-lg">expand_more</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setIsBadgeModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateBadge}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                                >
                                    Create Badge
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
