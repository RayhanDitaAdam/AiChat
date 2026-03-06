import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, Store, Settings, MessageSquare, MessageSquareOff,
    Menu, User as UserIcon, LogOut, Search, Users2, Shield, Palette,
    BookOpen, Zap, MessageCircle, BarChart3, Brain
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import LogoutModal from '../components/LogoutModal.jsx';
import WeatherBox from '../components/WeatherBox.jsx';
import LanguageToggle from '../components/LanguageToggle.jsx';
import DigitalClock from '../components/DigitalClock.jsx';
import SearchModal from '../components/SearchModal.jsx';
import { PATHS } from '../routes/paths.js';
import { decode } from '../routes/obfuscator.js';
import { useTranslation } from 'react-i18next';

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768 && sidebarOpen) {
                setSidebarOpen(false);
            } else if (window.innerWidth >= 1024 && !sidebarOpen) {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [sidebarOpen]);

    let navItems = [
        { id: 'ADMIN_DASHBOARD', name: t('nav.dashboard'), path: PATHS.ADMIN_DASHBOARD, icon: LayoutDashboard },
        { id: 'ADMIN_ANALYTICS', name: t('nav.analytics'), path: PATHS.ADMIN_ANALYTICS, icon: LayoutDashboard },
        { id: 'ADMIN_ACCOUNT_OWNERS', name: t('nav.account_owners'), path: PATHS.ADMIN_ACCOUNT_OWNERS, icon: Users2 },
        { id: 'ADMIN_STORES', name: t('nav.stores'), path: PATHS.ADMIN_STORES, icon: Store },
        { id: 'ADMIN_LIVE_CHAT', name: t('nav.live_chat'), path: PATHS.ADMIN_LIVE_CHAT, icon: MessageSquare },
        { id: 'ADMIN_MISSING', name: t('nav.missing_requests'), path: PATHS.ADMIN_MISSING, icon: MessageSquareOff },
        { id: 'ADMIN_SYSTEM', name: t('nav.system_config'), path: PATHS.ADMIN_SYSTEM, icon: Settings },
    ];

    if (user?.role === 'SUPER_ADMIN') {
        navItems = [
            { id: 'SUPER_ADMIN_DASHBOARD', name: 'Admin Management', path: PATHS.SUPER_ADMIN_DASHBOARD, icon: Shield },
            { id: 'SUPER_ADMIN_BRANDING', name: 'Branding CMS', path: PATHS.SUPER_ADMIN_BRANDING, icon: Palette },
            { id: 'ADMIN_SYSTEM', name: 'System Config', path: PATHS.ADMIN_SYSTEM, icon: Settings },
        ];
    }

    const currentInternalId = decode(location.pathname);

    return (
        <div className="min-h-screen bg-[#f9f9f9]">
            {/* Top Navbar */}
            <nav className="fixed top-0 z-50 w-full bg-white border-b border-slate-200">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="sm:hidden text-slate-600 hover:bg-slate-100 focus:ring-4 focus:ring-slate-200 rounded-lg text-sm p-2 mr-2"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <Link to={PATHS.ADMIN_DASHBOARD} className="flex items-center ms-2 md:me-24">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm mr-3">A</div>
                                <span className="self-center text-lg font-semibold whitespace-nowrap text-slate-900">Admin Panel</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Search Button */}
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 group"
                                title="Search (⌘K)"
                            >
                                <Search className="w-5 h-5 group-hover:text-indigo-600" />
                            </button>

                            <DigitalClock />
                            <LanguageToggle />
                            <div className="flex items-center ms-3 relative">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex text-sm bg-slate-800 rounded-full focus:ring-4 focus:ring-slate-300"
                                >
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                        {user?.name?.[0] || 'A'}
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {userDropdownOpen && (
                                        <Motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 top-12 z-50 bg-white border border-slate-200 rounded-xl shadow-xl w-64 overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                                <p className="text-xs font-semibold text-slate-900 uppercase tracking-tight">
                                                    {user?.name}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">
                                                    {user?.email}
                                                </p>
                                            </div>

                                            <div role="menu" className="p-1.5">
                                                <Link
                                                    to={PATHS.ADMIN_SYSTEM}
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="flex items-center w-full px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors group"
                                                >
                                                    <Settings className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-indigo-600" />
                                                    {t('nav.settings')}
                                                </Link>

                                                <hr className="my-1.5 border-slate-100" />

                                                <button
                                                    onClick={() => {
                                                        setUserDropdownOpen(false);
                                                        setShowLogoutModal(true);
                                                    }}
                                                    className="flex items-center w-full px-3 py-2 text-[11px] font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors group"
                                                >
                                                    <LogOut className="w-3.5 h-3.5 mr-2" />
                                                    {t('nav.logout')}
                                                </button>
                                            </div>
                                        </Motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 w-64 h-screen pt-14 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } sm:translate-x-0 bg-white border-r border-slate-200`}
            >
                <div className="h-full px-3 pb-4 pt-4 overflow-y-auto flex flex-col">
                    <ul className="space-y-1 font-medium flex-1">
                        {navItems.map((item) => {
                            if (item.divider) {
                                return (
                                    <li key={item.id} className="pt-4 pb-1 px-3">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{item.label}</span>
                                        <hr className="mt-1 border-slate-100" />
                                    </li>
                                );
                            }
                            const isActive = currentInternalId === item.id;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center px-3 py-2 rounded-lg transition-all group ${isActive
                                            ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                            }`}
                                    >
                                        <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                        <span className="ms-3 text-[11px] font-medium">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="mt-auto pt-4">
                        <WeatherBox />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`sm:ml-64 bg-[#f9f9f9] min-h-screen mt-14`}>
                <div className="p-4 sm:p-8 max-w-7xl mx-auto">
                    {children || <Outlet />}
                </div>
            </div>

            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={logout}
                userEmail={user?.email}
            />

            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                navItems={navItems}
            />
        </div>
    );
};

export default AdminLayout;
