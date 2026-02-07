import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, Package, MessageSquare, MessageSquareText,
    Menu, User as UserIcon, LogOut, ChevronLeft, ShieldCheck, Headset, ClipboardList, Users
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import LogoutModal from '../components/LogoutModal.jsx';
import WeatherBox from '../components/WeatherBox.jsx';
import { PATHS } from '../routes/paths.js';
import { decode } from '../routes/obfuscator.js';

const OwnerLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const isApproved = user?.owner?.isApproved !== false;

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
        { id: 'OWNER_DASHBOARD', name: 'Dashboard', path: PATHS.OWNER_DASHBOARD, icon: LayoutDashboard },
        { id: 'OWNER_PRODUCTS', name: 'Inventory', path: PATHS.OWNER_PRODUCTS, icon: Package },
        { id: 'OWNER_CHATS', name: 'AI Audit Logs', path: PATHS.OWNER_CHATS, icon: MessageSquareText },
        { id: 'OWNER_CHAT_ASSISTANT', name: 'Chat Assistant', path: PATHS.OWNER_CHAT_ASSISTANT, icon: MessageSquare },
        { id: 'OWNER_LIVE_SUPPORT', name: 'Live Support', path: PATHS.OWNER_LIVE_SUPPORT, icon: Headset },
        { id: 'OWNER_SETTINGS', name: 'Store Settings', path: PATHS.OWNER_SETTINGS, icon: ShieldCheck },
        { id: 'OWNER_FACILITY_TASKS', name: 'Facility Tasks', path: PATHS.OWNER_FACILITY_TASKS, icon: ClipboardList },
        { id: 'OWNER_TEAM', name: 'Staff Management', path: PATHS.OWNER_TEAM, icon: Users },
        { id: 'OWNER_PROFILE', name: 'Profile', path: PATHS.OWNER_PROFILE, icon: UserIcon },
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
                        className="h-full bg-[#171717] text-white flex flex-col border-r border-white/10 overflow-hidden shrink-0 z-50"
                    >
                        <div className="p-3 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8 px-2 py-4">
                                <Link to="/" className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
                                        {user?.owner?.name?.[0] || 'H'}
                                    </div>
                                    <span className="font-bold text-lg tracking-tight">
                                        {user?.owner?.name || 'Heart Admin'}
                                    </span>
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
                                    const currentInternalId = decode(location.pathname);
                                    const isActive = currentInternalId === item.id;
                                    const isDisabled = !isApproved && item.path !== PATHS.OWNER_DASHBOARD;
                                    const isManuallyDisabled = user?.disabledMenus?.includes(item.name);

                                    if (isDisabled || isManuallyDisabled) return null;

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${isActive
                                                ? 'bg-white/10 text-white font-medium'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="mt-auto pt-4 border-t border-white/10 space-y-1">
                                <div className="px-3 py-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold">H</div>
                                    <div className="flex-1 truncate">
                                        <p className="text-sm font-medium truncate">{user?.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role === 'STAFF' ? 'Store Staff' : user?.role}</p>
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
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            {user?.owner?.name && (
                                <>
                                    <span className="text-indigo-600 font-black">{user.owner.name}</span>
                                    <span className="text-slate-300">/</span>
                                </>
                            )}
                            {navItems.find(i => i.path === location.pathname)?.name || 'Admin'}
                        </h2>
                    </div>
                </header>

                <main className={`flex-1 overflow-y-auto w-full custom-scrollbar ${location.pathname === PATHS.OWNER_CHAT_ASSISTANT ? 'bg-white' : 'bg-[#fcfcfc]'}`}>
                    <div className={location.pathname === PATHS.OWNER_CHAT_ASSISTANT ? 'h-full' : 'max-w-7xl mx-auto px-6 py-10'}>
                        {isApproved ? (
                            children || <Outlet />
                        ) : (
                            <Motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center border border-amber-100">
                                    <ShieldCheck className="w-10 h-10 text-amber-500" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Account Pending Approval</h2>
                                    <p className="text-slate-500 max-w-md mx-auto font-medium">
                                        Your store access is currently being reviewed by our administrators.
                                        You'll be able to manage your inventory once approved.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact support if this takes more than 24h</p>
                                </div>
                            </Motion.div>
                        )}
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

export default OwnerLayout;
