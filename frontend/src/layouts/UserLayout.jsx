import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import UserAvatar from '../components/UserAvatar.jsx';
import {
    MessageSquare, SquarePen, Wallet, ShoppingBag,
    Menu, User as UserIcon, LogOut, Store, ChevronDown, Plus, Trash2, ClipboardList, ShieldCheck
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import { useChat } from '../context/ChatContext.js';
import LogoutModal from '../components/LogoutModal.jsx';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { PATHS } from '../routes/paths.js';
import { decode } from '../routes/obfuscator.js';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import WeatherBox from '../components/WeatherBox.jsx';
import { useTranslation } from 'react-i18next';

const UserLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const {
        sessions, currentSessionId, selectSession,
        startNewChat, deleteSession, isSessionsLoading
    } = useChat();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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
        { id: 'SELECT_STORE', name: t('nav.select_store'), path: PATHS.SELECT_STORE, icon: Store, hidden: !!user?.memberOf },
        { id: 'USER_DASHBOARD', name: t('nav.chat_assistant'), path: PATHS.USER_DASHBOARD, icon: MessageSquare, hidden: !user?.memberOf },
        { id: 'USER_SHOPPING_LIST', name: t('nav.shopping_queue'), path: PATHS.USER_SHOPPING_LIST, icon: ShoppingBag, hidden: !user?.memberOf },
        { id: 'USER_WALLET', name: t('nav.wallet'), path: PATHS.USER_WALLET, icon: Wallet, hidden: !user?.memberOf },
        { id: 'USER_FACILITY_TASKS', name: t('nav.task_reporting'), path: PATHS.USER_FACILITY_TASKS, icon: ClipboardList, hidden: !user?.memberOf },
        { id: 'USER_PROFILE', name: t('nav.profile'), path: PATHS.USER_PROFILE, icon: UserIcon },
    ];

    const handleNewChatClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await startNewChat();
        if (decode(location.pathname) !== 'USER_DASHBOARD') {
            navigate(PATHS.USER_DASHBOARD);
        }
    };

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
                            <Link to={PATHS.USER_DASHBOARD} className="flex items-center ms-2 md:me-24">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm mr-3 text-white">
                                    H
                                </div>
                                <span className="self-center text-lg font-semibold whitespace-nowrap text-slate-900">
                                    Heart
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block">
                                <LanguageToggle />
                            </div>
                            <div className="flex items-center ms-3 relative">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex text-sm bg-slate-800 rounded-full focus:ring-4 focus:ring-slate-300"
                                >
                                    <UserAvatar user={user} size={32} />
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
                                                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                                                    {user?.name}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">
                                                    {user?.email}
                                                </p>
                                            </div>

                                            <div className="block md:hidden px-4 py-2 border-b border-slate-100">
                                                <LanguageToggle />
                                            </div>

                                            <div role="menu" className="p-1.5" id="user-dropdown-menu">
                                                <div role="group" aria-labelledby="account-options" className="space-y-0.5">
                                                    <div role="heading" id="account-options" className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400">{t('common.my_account')}</div>

                                                    <Link
                                                        role="menuitem"
                                                        to={PATHS.USER_PROFILE}
                                                        onClick={() => setUserDropdownOpen(false)}
                                                        className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-black uppercase italic tracking-tight text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors group"
                                                    >
                                                        <div className="flex items-center">
                                                            <UserIcon className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-indigo-600" />
                                                            {t('nav.profile')}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-slate-300 tracking-widest ml-auto">⇧⌘P</span>
                                                    </Link>

                                                    <button
                                                        role="menuitem"
                                                        className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-black uppercase italic tracking-tight text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors group"
                                                    >
                                                        <div className="flex items-center">
                                                            <ClipboardList className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-indigo-600" />
                                                            {t('nav.billing')}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-slate-300 tracking-widest ml-auto">⌘B</span>
                                                    </button>

                                                    <button
                                                        role="menuitem"
                                                        className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-black uppercase italic tracking-tight text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors group"
                                                    >
                                                        <div className="flex items-center">
                                                            <ShieldCheck className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-indigo-600" />
                                                            {t('nav.settings')}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-slate-300 tracking-widest ml-auto">⌘S</span>
                                                    </button>

                                                    <button
                                                        role="menuitem"
                                                        className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-black uppercase italic tracking-tight text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors group"
                                                    >
                                                        <div className="flex items-center">
                                                            <Menu className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-indigo-600" />
                                                            {t('nav.keyboard_shortcuts')}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-slate-300 tracking-widest ml-auto">⌘K</span>
                                                    </button>
                                                </div>

                                                <hr role="separator" className="my-1.5 border-slate-100" />

                                                <div role="group" className="space-y-0.5">
                                                    <div role="menuitem" className="flex items-center px-3 py-2 text-[11px] font-black uppercase italic tracking-tight text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer group">
                                                        GitHub
                                                    </div>
                                                    <div role="menuitem" className="flex items-center px-3 py-2 text-[11px] font-black uppercase italic tracking-tight text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer group">
                                                        {t('nav.support')}
                                                    </div>
                                                    <div role="menuitem" aria-disabled="true" className="flex items-center px-3 py-2 text-[11px] font-black uppercase italic tracking-tight text-slate-300 rounded-lg cursor-not-allowed">
                                                        {t('nav.api')}
                                                    </div>
                                                </div>

                                                <hr role="separator" className="my-1.5 border-slate-100" />

                                                <button
                                                    role="menuitem"
                                                    onClick={() => {
                                                        setUserDropdownOpen(false);
                                                        setShowLogoutModal(true);
                                                    }}
                                                    className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-black uppercase italic tracking-tight text-rose-600 hover:bg-rose-50 rounded-lg transition-colors group"
                                                >
                                                    <div className="flex items-center">
                                                        <LogOut className="w-3.5 h-3.5 mr-2" />
                                                        {t('nav.logout')}
                                                    </div>
                                                    <span className="text-[9px] font-bold text-rose-300 tracking-widest ml-auto">⇧⌘P</span>
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
                    {user?.memberOf && (
                        <div className="mx-1 mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                                    <Store className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600/80 mb-0.5">
                                        {t('common.active_store')}
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 truncate leading-tight">
                                        {user.memberOf.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <ul className="space-y-2 font-medium flex-1">
                        {navItems.map((item) => {
                            if (item.hidden) return null;
                            if (user?.disabledMenus?.includes(item.name)) return null;
                            if (item.id === 'USER_FACILITY_TASKS' && user?.role !== 'STAFF') return null;

                            if (item.name === t('nav.chat_assistant')) {
                                const isActive = currentInternalId === 'USER_DASHBOARD';
                                return (
                                    <li key={item.path} className="flex flex-col gap-1">
                                        <div
                                            onClick={() => setChatAccordionOpen(!chatAccordionOpen)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group cursor-pointer ${isActive
                                                ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                                <span className="text-[11px] font-black uppercase italic tracking-tight">{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={handleNewChatClick}
                                                    className="p-1 hover:bg-indigo-100 rounded-md text-indigo-600 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${chatAccordionOpen ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {chatAccordionOpen && (
                                                <Motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden flex flex-col gap-0.5 ml-4 border-l border-slate-100 pl-2 mt-1"
                                                >
                                                    {isSessionsLoading ? (
                                                        <div className="py-2 pl-2 text-[10px] text-slate-400 font-bold uppercase italic">
                                                            {t('common.loading')}...
                                                        </div>
                                                    ) : (
                                                        sessions.map((s) => (
                                                            <div key={s.id} className="group/session flex items-center gap-1 pr-2">
                                                                <button
                                                                    onClick={() => {
                                                                        selectSession(s.id);
                                                                        if (decode(location.pathname) !== 'USER_DASHBOARD') navigate(PATHS.USER_DASHBOARD);
                                                                    }}
                                                                    className={`flex-1 text-left px-3 py-2 text-[10px] font-black uppercase italic tracking-tight rounded-lg transition-all truncate ${currentSessionId === s.id
                                                                        ? 'bg-indigo-50 text-indigo-600'
                                                                        : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50'
                                                                        }`}
                                                                >
                                                                    {s.title || "New Chat"}
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (confirm(t('common.delete_session_confirm'))) deleteSession(s.id);
                                                                    }}
                                                                    className="opacity-0 group-hover/session:opacity-100 p-1.5 hover:bg-rose-100 text-rose-500 rounded-md transition-all"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </Motion.div>
                                            )}
                                        </AnimatePresence>
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
                                        <span className="ms-3 text-[11px] font-black uppercase italic tracking-tight">{item.name}</span>
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
            <div className="sm:ml-64 mt-14 h-full overflow-hidden bg-[#f9f9f9]">
                <div className={currentInternalId === 'USER_DASHBOARD' ? 'h-full' : 'h-full overflow-auto'}>
                    {children || <Outlet />}
                </div>
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
