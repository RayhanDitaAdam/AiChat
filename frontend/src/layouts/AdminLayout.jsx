import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, Store, Settings, MessageSquare, MessageSquareOff,
    Menu, User as UserIcon, LogOut, ChevronLeft
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import LogoutModal from '../components/LogoutModal.jsx';
import WeatherBox from '../components/WeatherBox.jsx';
import { PATHS } from '../routes/paths.js';
import { decode } from '../routes/obfuscator.js';

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

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

    const navItems = [
        { id: 'ADMIN_DASHBOARD', name: 'Analytics', path: PATHS.ADMIN_DASHBOARD, icon: LayoutDashboard },
        { id: 'ADMIN_STORES', name: 'Stores & Approval', path: PATHS.ADMIN_STORES, icon: Store },
        { id: 'ADMIN_LIVE_CHAT', name: 'Configure Live Chat Store', path: PATHS.ADMIN_LIVE_CHAT, icon: MessageSquare },
        { id: 'ADMIN_MISSING', name: 'Missing Requests', path: PATHS.ADMIN_MISSING, icon: MessageSquareOff },
        { id: 'ADMIN_SYSTEM', name: 'System Config', path: PATHS.ADMIN_SYSTEM, icon: Settings },
        { id: 'ADMIN_MENUS', name: 'Menu Management', path: PATHS.ADMIN_MENUS, icon: Menu },
    ];

    return (
        <div className="flex h-screen w-full bg-[#f9f9f9] text-slate-900 overflow-hidden font-sans">
            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {sidebarOpen && (
                    <Motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 260, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="h-full bg-[#0f172a] text-white flex flex-col border-r border-white/10 overflow-hidden shrink-0 z-50"
                    >
                        <div className="p-3 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8 px-2 py-4">
                                <Link to="/" className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center font-bold text-sm">A</div>
                                    <span className="font-bold text-lg tracking-tight">Heart Admin</span>
                                </Link>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex-1 space-y-1">
                                {navItems.map((item) => {
                                    if (user?.disabledMenus?.includes(item.name)) return null;
                                    const currentInternalId = decode(location.pathname);
                                    const isActive = currentInternalId === item.id;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${isActive
                                                ? 'bg-white/10 text-white font-medium'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 ${isActive ? 'text-sky-400' : ''}`} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="mt-auto pt-4 border-t border-white/10 space-y-1">
                                <div className="px-3 py-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-[10px] font-bold">A</div>
                                    <div className="flex-1 truncate">
                                        <p className="text-sm font-medium truncate">{user?.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role}</p>
                                    </div>
                                </div>
                                <WeatherBox />
                                <button
                                    onClick={() => setShowLogoutModal(true)}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </Motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative h-full overflow-hidden bg-white">
                {/* Header / Sidebar Toggle */}
                <header className="h-14 flex items-center justify-between px-4 shrink-0 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        {!sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        )}
                        <h2 className="font-semibold text-slate-700">
                            {navItems.find(i => i.id === decode(location.pathname))?.name || 'Admin'}
                        </h2>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto w-full custom-scrollbar bg-[#fcfcfc]">
                    <div className="max-w-7xl mx-auto px-6 py-10">
                        {children || <Outlet />}
                    </div>
                </main>
            </div>

            {/* Logout Confirmation */}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={logout}
                userEmail={user?.email}
            />
        </div>
    );
};

export default AdminLayout;
