import React from 'react';
import { Link } from 'react-router-dom';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { User, ChevronRight } from 'lucide-react';
import Button from '../components/Button.jsx';
import { PATHS } from '../routes/paths.js';

const Layout = ({ children }) => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-outfit text-gray-900 dark:text-gray-100 overflow-x-hidden relative transition-colors duration-300">
            {/* Subtle background blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-brand-500/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-brand-400/5 blur-[100px] rounded-full"></div>
            </div>

            {/* Premium Floating Header */}
            <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50">
                <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-theme-lg rounded-[2rem] px-6 py-3 flex items-center justify-between transition-all duration-300 hover:shadow-theme-xl">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-theme-sm group-hover:scale-105 transition-transform">
                            H
                        </div>
                        <div>
                            <span className="font-black text-gray-900 dark:text-white tracking-tighter text-xl hidden sm:block leading-none">HEART</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1 hidden sm:block">AI ASSISTANT</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4 md:gap-8">
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/#features" className="text-sm font-medium text-gray-500 hover:text-brand-500 transition-colors">Features</Link>
                            <Link to="/#pricing" className="text-sm font-medium text-gray-500 hover:text-brand-500 transition-colors">Pricing</Link>
                            <LanguageToggle />
                        </div>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4 pl-4 md:pl-6 border-l border-gray-100 dark:border-gray-800">
                                <Link to={user.role === 'ADMIN' ? PATHS.ADMIN_DASHBOARD : user.role === 'OWNER' ? PATHS.OWNER_DASHBOARD : PATHS.USER_DASHBOARD} className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors group">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[9px] font-black text-brand-500 uppercase tracking-widest leading-none mb-1">{user.role}</p>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">{user.name}</p>
                                    </div>
                                    <User className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors" />
                                </Link>
                                <button
                                    onClick={logout}
                                    className="p-2.5 rounded-2xl text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-all border border-transparent hover:border-error-100 dark:hover:border-error-500/20"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Link to={PATHS.LOGIN}>
                                    <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-brand-500 font-bold px-4 sm:px-6">
                                        Login
                                    </Button>
                                </Link>
                                <Link to={PATHS.REGISTER}>
                                    <Button size="sm" className="bg-brand-500 text-white px-5 sm:px-8 py-3 h-auto rounded-2xl font-black text-[11px] uppercase tracking-wider shadow-theme-md hover:bg-brand-600 hover:shadow-theme-lg transition-all flex items-center gap-2 group">
                                        Get Started
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

            {/* Subtle footer credit */}
            <footer className="relative z-10 py-10 border-t border-gray-100 dark:border-gray-800 mt-20">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-gray-400 font-medium">© 2026 Heart AI. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="text-xs font-bold text-gray-400 hover:text-brand-500 uppercase tracking-widest transition-colors">Privacy</Link>
                        <Link to="/terms" className="text-xs font-bold text-gray-400 hover:text-brand-500 uppercase tracking-widest transition-colors">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Add missing icon import
import { LogOut } from 'lucide-react';

export default Layout;
