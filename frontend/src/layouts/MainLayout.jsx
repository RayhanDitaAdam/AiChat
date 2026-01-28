import React from 'react';
import { Link } from 'react-router-dom';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { User } from 'lucide-react';
import Button from '../components/Button.jsx';

const Layout = ({ children }) => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-[#fafbff] font-sans text-slate-900 overflow-x-hidden relative">
            {/* Subtle static background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-indigo-50/40 blur-[80px] rounded-full"></div>
                <div className="absolute bottom-[-5%] right-[-5%] w-[25%] h-[25%] bg-rose-50/30 blur-[60px] rounded-full"></div>
            </div>

            {/* Floating Header */}
            <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50">
                <nav className="bg-white/90 backdrop-blur-xl border border-slate-100 shadow-sm rounded-3xl px-8 py-4 flex items-center justify-between transition-shadow duration-300 hover:shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm">H</div>
                        <div>
                            <span className="font-black text-slate-900 tracking-tighter text-xl hidden sm:block leading-none">HEART</span>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 hidden sm:block">AI Assistant</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:block">
                            <LanguageToggle />
                        </div>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
                                <div className="text-right hidden md:block">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] leading-none mb-1.5">{user.role}</p>
                                    <p className="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors text-slate-400 border border-slate-100 shadow-sm"
                                >
                                    <User className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="hidden sm:block">
                                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-indigo-600 font-bold px-6">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="bg-indigo-600 text-white px-8 py-3 h-auto rounded-2xl font-black text-xs shadow-sm hover:bg-indigo-700 transition-colors">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
            </header>

            <main className="relative z-10 pt-32 pb-20 min-h-screen">
                {children}
            </main>
        </div>
    );
};

export default Layout;
