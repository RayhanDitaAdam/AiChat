import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    MessageSquare, SquarePen, Wallet, ShoppingBag,
    Menu, User as UserIcon, LogOut, ChevronLeft, Store, ChevronDown, Plus, Trash2, Trash
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import { useChat } from '../context/ChatContext.js';
import LogoutModal from '../components/LogoutModal.jsx';
import WeatherBox from '../components/WeatherBox.jsx';

const UserLayout = () => {
    const { user, logout } = useAuth();
    const {
        sessions, currentSessionId, selectSession,
        startNewChat, deleteSession
    } = useChat();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [chatAccordionOpen, setChatAccordionOpen] = useState(true);

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
        { name: 'Chat Assistant', path: '/chat', icon: MessageSquare },
        { name: 'Shopping Queue', path: '/shopping-list', icon: ShoppingBag },
        { name: 'Wallet', path: '/wallet', icon: Wallet },
        { name: 'Profile', path: '/profile', icon: UserIcon },
    ];

    const handleNewChatClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await startNewChat();
        if (location.pathname !== '/chat') {
            navigate('/chat');
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#212121] text-white overflow-hidden font-sans">
            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {sidebarOpen && (
                    <Motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 260, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="h-full bg-[#171717] flex flex-col border-r border-white/10 overflow-hidden shrink-0 z-50"
                    >
                        <div className="p-3 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8 px-2 py-4">
                                <Link to="/" className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm text-white">H</div>
                                    <span className="font-bold text-lg tracking-tight text-white">Heart</span>
                                </Link>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            </div>

                            {user?.memberOf && (
                                <div className="mx-3 mb-8 p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 shrink-0">
                                            <Store className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/80 mb-0.5">
                                                Active Store
                                            </p>
                                            <p className="text-sm font-black text-white truncate leading-tight">
                                                {user.memberOf.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
                                {navItems.map((item) => {
                                    if (item.name === 'Chat Assistant') {
                                        const isActive = location.pathname === '/chat';
                                        return (
                                            <div key={item.path} className="flex flex-col gap-1">
                                                <div
                                                    onClick={() => setChatAccordionOpen(!chatAccordionOpen)}
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer ${isActive
                                                        ? 'bg-white/10 text-white font-medium'
                                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
                                                        <Link to="/chat" onClick={(e) => e.stopPropagation()}>{item.name}</Link>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={handleNewChatClick}
                                                            className="p-1 hover:bg-white/10 rounded-md text-indigo-400"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                        <ChevronDown className={`w-4 h-4 transition-transform ${chatAccordionOpen ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {chatAccordionOpen && (
                                                        <Motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden flex flex-col gap-1 ml-4 border-l border-white/5 pl-2"
                                                        >
                                                            {sessions.map((s) => (
                                                                <div key={s.id} className="group/session flex items-center gap-1 pr-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            selectSession(s.id);
                                                                            if (location.pathname !== '/chat') navigate('/chat');
                                                                        }}
                                                                        className={`flex-1 text-left px-3 py-2 text-[11px] rounded-lg transition-all truncate ${currentSessionId === s.id
                                                                            ? 'bg-indigo-600/20 text-indigo-400 font-bold'
                                                                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                                                                            }`}
                                                                    >
                                                                        {s.title || "New Chat"}
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (confirm('Hapus sesi ini?')) deleteSession(s.id);
                                                                        }}
                                                                        className="opacity-0 group-hover/session:opacity-100 p-1.5 hover:bg-rose-500/20 text-rose-500 rounded-md transition-all"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </Motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    }

                                    const isActive = location.pathname === item.path;
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
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">H</div>
                                    <div className="flex-1 truncate">
                                        <p className="text-sm font-medium truncate text-white">{user?.name}</p>
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
                            {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
                        </h2>
                    </div>
                </header>

                {/* Content Area */}
                <main className={`flex-1 overflow-y-auto w-full custom-scrollbar ${location.pathname === '/chat' ? 'bg-white' : 'bg-[#fcfcfc]'}`}>
                    <div className={location.pathname === '/chat' ? 'h-full' : 'max-w-6xl mx-auto px-6 py-10'}>
                        <Outlet />
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

export default UserLayout;
