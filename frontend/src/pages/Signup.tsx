import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signup, login } from '../services/api';

export default function Signup() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        role: 'student',
        password: '',
        phone: '', 
        terms: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.terms) {
            setError("You must agree to the Terms of Service.");
            return;
        }

        setLoading(true);
        try {
            // Prepare payload matching backend schema
            const payload = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role.toLowerCase(), // Ensure lowercase for enum
                status: 'requested',
                password: formData.password
            };

            // Step 1: Create the account
            await signup(payload);

            // Step 2: Automatically log the user in
            const loginData = await login({
                email: formData.email,
                password: formData.password
            });

            // Step 3: Store the access token
            if (loginData.access_token) {
                localStorage.setItem('access_token', loginData.access_token);
                // Alert updated to reflect requested status
                alert("Account created! Status is 'requested' until approved by admin. Logging you in...");

                // Navigate to return path if provided, otherwise go to dashboard
                const returnTo = location.state?.returnTo;
                if (returnTo) {
                    navigate(returnTo);
                } else {
                    navigate('/student/dashboard');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-display bg-white text-slate-900 selection:bg-primary/30 antialiased h-screen overflow-hidden">
            <div className="flex h-full w-full">
                <div className="w-full lg:w-1/2 flex flex-col h-full bg-white overflow-y-auto">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center gap-2">
                            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30">
                                <span className="material-symbols-outlined text-xl">school</span>
                            </div>
                            <span className="text-lg font-bold tracking-tight text-slate-900">Brainx</span>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
                        <div className="w-full max-w-md space-y-8">
                            <div className="text-center">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h1>
                                <p className="mt-2 text-sm text-slate-600">Start your 30-day free trial. No credit card required.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700 text-sm">
                                    <img alt="Google logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2hbIFiGBTpmkpppquXPpNeueuMZIfxO1A202eFsC-Igr91aSyDjgOAFznTY92anVsFh910sVYa1e8oZtNxbqM3LkwSh53yUSv6EEEHuFlN6GkJkAn7cFb4NaQXCJ6oNQbWyzy3FPLzAekxGM3M_0nkqP6E5ykhGsKqgqa-B9eCxTHHQbbCc0tRQ8a8No_7HazvFawbZ2wvAALdZVh4ig1kiFV4a_ti1A3kn0-2qO1TmU-7716dfeWmNmrmkpAiKD8FI_jwBXH9dQ" />
                                    Sign up with Google
                                </button>
                                <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700 text-sm">
                                    <img alt="Apple logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNeOzPaf8VTCr4lKvoAtFrGkB0X_kIjkbqhUHqFpTD-FQ-1KV4PSgGC61Nu5jZC41mQ3WF_WRbMpQzxmgRseCHaknS3HQwBsvwkdzp_kYdDApJaS-E7VijBvgsOjp6dhLWmcBG-HDaxH6Y7uZhnVi1XsPLj3GCNFSeEgRW98Bk_75lJ7qdeXMHgzhwNR7mJFI8OV8_6yG7UPlHz9tDs23JZNuDg7OD9R_eLyOjmjN0fm8-cr6pSk71YqSMMisgkVFD-VoVrxvCMuQ" />
                                    Sign up with Apple
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-2 text-slate-500">Or continue with email</span>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="full_name">Full Name</label>
                                        <input
                                            className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5"
                                            id="full_name" name="full_name" placeholder="John Doe" type="text"
                                            value={formData.full_name} onChange={handleChange} required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">Work Email</label>
                                        <input
                                            className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5"
                                            id="email" name="email" placeholder="john@school.edu" type="email"
                                            value={formData.email} onChange={handleChange} required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="phone">Phone (Optional)</label>
                                        <input
                                            className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5"
                                            id="phone" name="phone" placeholder="1234567890" type="text"
                                            value={formData.phone} onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="role">Select your role</label>
                                        <select
                                            className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5"
                                            id="role" name="role"
                                            value={formData.role} onChange={handleChange}
                                        >
                                            <option value="student">Student</option>
                                            <option value="parent">Parent</option>
                                            <option value="teacher">Teacher</option>
                                            <option value="administrator">Administrator</option>
                                            <option value="coordinator">Coordinator</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">Password</label>
                                        <input
                                            className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5"
                                            id="password" name="password" placeholder="••••••••" type="password"
                                            value={formData.password} onChange={handleChange} required
                                        />
                                        <div className="mt-2 flex gap-1 h-1">
                                            <div className="flex-1 bg-emerald-500 rounded-full"></div>
                                            <div className="flex-1 bg-emerald-500 rounded-full"></div>
                                            <div className="flex-1 bg-emerald-500 rounded-full"></div>
                                            <div className="flex-1 bg-slate-200 rounded-full"></div>
                                        </div>
                                        <p className="mt-1 text-xs text-emerald-600 font-medium">Strong password</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                        id="terms" name="terms" type="checkbox"
                                        checked={formData.terms} onChange={handleChange}
                                    />
                                    <label className="ml-2 block text-sm text-slate-600" htmlFor="terms">
                                        I agree to the <a className="text-primary hover:text-primary-dark" href="#">Terms of Service</a> and <a className="text-primary hover:text-primary-dark" href="#">Privacy Policy</a>
                                    </label>
                                </div>
                                <button
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70"
                                    type="submit" disabled={loading}
                                >
                                    {loading ? 'Creating account...' : 'Sign up'}
                                </button>
                            </form>
                            <p className="text-center text-sm text-slate-600">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    state={location.state}
                                    className="font-medium text-primary hover:text-primary-dark"
                                >
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="p-6 text-center lg:hidden">
                        <p className="text-xs text-slate-400">© 2024 Brainx Inc.</p>
                    </div>
                </div>
                <div
                    className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-blue-600 to-indigo-800 items-center justify-center p-12 overflow-hidden">
                    <div
                        className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full mix-blend-overlay filter blur-3xl translate-x-1/2 -translate-y-1/2">
                    </div>
                    <div
                        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/30 rounded-full mix-blend-overlay filter blur-3xl -translate-x-1/2 translate-y-1/2">
                    </div>
                    <div className="relative w-full max-w-2xl z-10 flex flex-col items-center">
                        <div className="relative w-full perspective-1000">
                            <div
                                className="relative bg-slate-900 rounded-xl shadow-2xl shadow-blue-900/40 border border-white/20 overflow-hidden transform rotate-y-6 rotate-x-6 hover:rotate-0 transition-all duration-700 ease-out mb-12">
                                <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
                                    <div className="size-2.5 rounded-full bg-red-400/80 hover:bg-red-400 transition-colors"></div>
                                    <div className="size-2.5 rounded-full bg-amber-400/80 hover:bg-amber-400 transition-colors">
                                    </div>
                                    <div className="size-2.5 rounded-full bg-emerald-400/80 hover:bg-emerald-400 transition-colors">
                                    </div>
                                    <div className="ml-4 flex-1 h-4 bg-slate-900/50 rounded-md max-w-xs hidden sm:block opacity-50">
                                    </div>
                                </div>
                                <div className="relative bg-slate-900 w-full aspect-video p-3 flex flex-col">
                                    <div className="flex-1 grid grid-cols-2 gap-3 h-full">
                                        <div
                                            className="relative rounded-lg overflow-hidden bg-slate-800 group border border-white/5 shadow-inner">
                                            <img alt="Teacher"
                                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBawXnCYoNIS8OcMBHtS58tjWpCFFeEzmqaKeztncIy2S6PMXnk3lZVk95kHdFrMf4rqa6cDg7lRaYRSrYcBsuP2Mgrw4K6hcCxNY6aUDi8Qihq0VMwvhEm6DUBQhsMEWK6T8flHxMgHkmx1js029iUWT6bWcOHipgvgXnN1I5Vlm-wTWVGMROV7kpYwTH1vrmUlviY_yFSx08OXYX-Ho5BOuQsb7J3Kdp44DZKcQwcO_rWbAkAnMAjR8brlN96sFnpV8cM2n01WBg" />
                                            <div
                                                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                                            </div>
                                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                                <div
                                                    className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium flex items-center gap-1.5 shadow-sm">
                                                    <span className="material-symbols-outlined text-[12px]">mic</span>
                                                    Mr. Anderson (Teacher)
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="relative rounded-lg overflow-hidden bg-slate-800 border border-white/5 shadow-inner">
                                            <img alt="Student" className="w-full h-full object-cover"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuABRchQBJfayqJg7eS_v07As6ib039gbXfgY8OR6A62RMe3rtaXP8UBzaLTg-_rnkXTUw_hw8GPAyh0SwCiiBrRC0l7kGLAmysT7jQoUdwEHeHIEjXratHkfCAO-VF2Pyo8rEioCTZ_Q2TZ6dgyBZYyfsni_1xhn1Ee_xNNBIcBvf6IisKs4vE4t4wFDqLahakL18yMytTbIUScsG3Oxb0LPsX7NOlhgc0HJVRQGeD0U8X6dsI3A2MqpTATAYGE1D1rORDPMomyn04" />
                                            <div
                                                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                                            </div>
                                            <div className="absolute bottom-3 left-3">
                                                <span
                                                    className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium">Sarah
                                                    M.</span>
                                            </div>
                                        </div>
                                        <div
                                            className="relative rounded-lg overflow-hidden bg-slate-800 border border-white/5 shadow-inner">
                                            <img alt="Student" className="w-full h-full object-cover"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqR4k62nNnu7XTgndGUhBRYl995PN-sO5gxkYA-72S2zt8AKW_jlbRNnG9oJyA8Dy5ZtteXE4CTR-pj92rDk9Twf17qFFsRISYVAWoYpxPOseeaMDtGXpC02i1D-OBQNNRWcwTW-Wtyn1Awyw54VL9cqEMmwlqjo_S8LRj4P7-d-GGuwd_9BB9MyCQlEL5pXgIJY6Yx1gE3TLUxAYn7NlToUPTQBiZjkbBSdvMEHqkZS-3zakkKa-WFNMuZ_wtVQ2CQIi8y1F7BJA" />
                                            <div
                                                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                                            </div>
                                            <div className="absolute bottom-3 left-3">
                                                <span
                                                    className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium">David
                                                    K.</span>
                                            </div>
                                        </div>
                                        <div
                                            className="relative rounded-lg overflow-hidden bg-slate-800 border border-white/5 shadow-inner">
                                            <img alt="Student" className="w-full h-full object-cover"
                                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNS7RegZlRTIoayjIiZh9MLPNao1fqMCxwZFwpClf7xg4uCD6-_DmF6TfUMaVz3fYS3eqSMaTNnvR3HZgZacn3b6LAdmNdapG-uWSspTL4bJuFw797IBnSc7KlIebU6JQ0KKeyuD-AKI1JbkOqqulsOgacFiuFhx_r0dIj47ahMG3apPnMT1G17Z_gXHjzViyl9hT8JVSlBwNf5bnC-AeI7G1TCEz6a7d8I8CTNdio8hNsym_SKprg5gTTDQvkRM_WbE6avNlWNLg" />
                                            <div
                                                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                                            </div>
                                            <div className="absolute bottom-3 left-3">
                                                <span
                                                    className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium">Emily
                                                    R.</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="absolute top-5 right-5 w-28 aspect-[4/3] bg-slate-800 rounded-lg shadow-2xl ring-1 ring-white/10 overflow-hidden z-20">
                                        <img alt="Me" className="w-full h-full object-cover"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaHgFHAFf1SUUBFA9-gHfm0nC80pkXYzP-byVSvs0j1d9pzMsfGiS0TDSqfsX17jtG35YQWpKYnPTB_jXgVUxMpRgqcX9iXTj028bgpaBJmijjc-O0K1SSWZWRKDR8-w1eHYT3q3iogVVhA4dBOzJxPgsFnf-SCfIUIiD3CF2EjQRPjUgob46S4nCRoSzpm10OvzBSu8o0bDjvNnRdbs3P3exZoZtdWYmwNpT4kP-5WIo1QF7IyVzWbElOACCJCf33CyQjD9IcS58" />
                                        <div
                                            className="absolute bottom-1 right-1 size-2 bg-emerald-500 rounded-full border border-slate-800">
                                        </div>
                                    </div>
                                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
                                        <div
                                            className="flex items-center gap-1.5 p-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                                            <button
                                                className="size-10 flex items-center justify-center rounded-xl text-white hover:bg-white/10 transition-all tooltip"
                                                title="Mute">
                                                <span className="material-symbols-outlined text-[20px]">mic</span>
                                            </button>
                                            <button
                                                className="size-10 flex items-center justify-center rounded-xl text-white hover:bg-white/10 transition-all"
                                                title="Stop Video">
                                                <span className="material-symbols-outlined text-[20px]">videocam</span>
                                            </button>
                                            <button
                                                className="size-10 flex items-center justify-center rounded-xl text-emerald-400 hover:bg-white/10 transition-all"
                                                title="Share Screen">
                                                <span className="material-symbols-outlined text-[20px]">screen_share</span>
                                            </button>
                                            <button
                                                className="size-10 flex items-center justify-center rounded-xl text-white hover:bg-white/10 transition-all relative"
                                                title="Chat">
                                                <span className="material-symbols-outlined text-[20px]">chat</span>
                                                <span
                                                    className="absolute top-2.5 right-2.5 size-1.5 bg-red-500 rounded-full"></span>
                                            </button>
                                            <button
                                                className="size-10 flex items-center justify-center rounded-xl text-white hover:bg-white/10 transition-all"
                                                title="Raise Hand">
                                                <span className="material-symbols-outlined text-[20px]">front_hand</span>
                                            </button>
                                            <div className="w-px h-6 bg-white/10 mx-1"></div>
                                            <button
                                                className="h-10 px-4 flex items-center justify-center rounded-xl bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all">
                                                <span className="text-xs font-semibold whitespace-nowrap">End Call</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="absolute -bottom-10 -right-8 bg-white/95 backdrop-blur-md p-5 rounded-xl shadow-xl border border-white/50 max-w-xs transform translate-y-0 transition-transform hover:-translate-y-2 duration-300 z-40">
                                <div className="flex items-start gap-3">
                                    <img alt="Sarah J." className="size-10 rounded-full object-cover border-2 border-primary"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1hcrgAfkNXstBEoLFE2KLMhg-reYiDgZFzbeRJ6bJZ7Ulbp-VgDOFTu1yR8JGgURhbW7IGciW5mZ6T83PJ3qRNVQbAunyx2DPuL_mkFLymTgHZjypV6lcmkG4dqIl5tYASrnGaUlOYI69cSHkfHLkhKEsj2J5XITH3_wQFYOvFlqL3UrZhpTYU2Oj-vgv6Hm4JvZIj6EAKDyvNwGIDjVZ2WcvL1uDEY7fX-3fS866ynN0YwttdqY122vNIPjMHswoxP6CpUxIoAE" />
                                    <div>
                                        <div className="flex text-amber-400 text-xs mb-1">
                                            <span className="material-symbols-outlined text-sm">star</span>
                                            <span className="material-symbols-outlined text-sm">star</span>
                                            <span className="material-symbols-outlined text-sm">star</span>
                                            <span className="material-symbols-outlined text-sm">star</span>
                                            <span className="material-symbols-outlined text-sm">star</span>
                                        </div>
                                        <p className="text-xs text-slate-600 italic mb-2">"The video quality and interactive
                                            features make online classes feel just like being in the classroom."</p>
                                        <p className="text-xs font-bold text-slate-900">Sarah Jenkins</p>
                                        <p className="text-[10px] text-primary font-medium">Science Teacher, Grade 8</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-center text-blue-100 max-w-md">
                            <h2 className="text-2xl font-bold text-white mb-2">Immersive Virtual Classroom</h2>
                            <p className="text-sm opacity-90">Connect with students through high-quality video, interactive tools,
                                and seamless collaboration.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
