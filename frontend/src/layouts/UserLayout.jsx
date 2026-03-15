import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    MessageSquare, SquarePen, Wallet, ShoppingBag,
    Menu, User as UserIcon, LogOut, ChevronLeft, Store, ChevronDown, Plus, Trash2, ClipboardList, Search, Headset, UserPlus, Briefcase
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import { useChat } from '../context/ChatContext.js';
import LogoutModal from '../components/LogoutModal.jsx';
import WeatherBox from '../components/WeatherBox.jsx';
import LanguageToggle from '../components/LanguageToggle.jsx';
import DigitalClock from '../components/DigitalClock.jsx';
import SearchModal from '../components/SearchModal.jsx';
import { PATHS } from '../routes/paths.js';
import { decode } from '../routes/obfuscator.js';
import { useTranslation } from 'react-i18next';
import { useSystemContext } from '../context/SystemContext.jsx';

const UserLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const { companyName, companyLogo } = useSystemContext();
    const shortName = companyName?.replace(/ai$/i, '').toUpperCase() || 'HEART';

    const {
        sessions, currentSessionId, selectSession,
        startNewChat, deleteSession
    } = useChat();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [chatAccordionOpen, setChatAccordionOpen] = useState(true);
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

    const navItems = [
        { id: 'USER_LIVE_SUPPORT', name: t('nav.chat_live_staff'), path: PATHS.USER_LIVE_SUPPORT, icon: Headset },
        { id: 'USER_SHOPPING_LIST', name: t('nav.shopping_queue'), path: PATHS.USER_SHOPPING_LIST, icon: ShoppingBag },
        { id: 'USER_WALLET', name: t('nav.wallet'), path: PATHS.USER_WALLET, icon: Wallet },
        { id: 'USER_VACANCIES', name: t('nav.job_vacancies', 'Lowongan Kerja'), path: PATHS.USER_VACANCIES, icon: Briefcase },
        { id: 'USER_PROFILE', name: t('nav.profile'), path: PATHS.USER_PROFILE, icon: UserIcon },
        { id: 'BECOME_CONTRIBUTOR', name: t('nav.become_contributor') || 'Become a Contributor', path: PATHS.BECOME_CONTRIBUTOR, icon: UserPlus },
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

    const isFullHeight = ['USER_DASHBOARD', 'USER_LIVE_SUPPORT', 'CHAT_ASSISTANT', 'CHAT_WITH_STAFF'].includes(currentInternalId);

    return (
        <div className={isFullHeight ? 'h-screen overflow-hidden bg-[#f9f9f9]' : 'min-h-screen bg-[#f9f9f9]'}>
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
                            <Link to="/" className="flex items-center ms-2 md:me-24">
                                {companyLogo ? (
                                    <img src={companyLogo} alt={`${companyName} Logo`} className="h-8 w-auto mr-3 object-contain" />
                                ) : (
                                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-semibold text-sm mr-3 text-white">
                                        {shortName.charAt(0)}
                                    </div>
                                )}
                                <span className="self-center text-lg font-semibold whitespace-nowrap text-slate-900">{companyName}</span>
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
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                                        {user?.name?.[0] || 'U'}
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
                                                <p className="text-[10px] font-normal text-slate-400 truncate mt-0.5">
                                                    {user?.email}
                                                </p>
                                            </div>

                                            <div role="menu" className="p-1.5">
                                                <Link
                                                    to={PATHS.USER_PROFILE}
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className="flex items-center w-full px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors group"
                                                >
                                                    <UserIcon className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-indigo-600" />
                                                    {t('nav.profile')}
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
                    <ul className="space-y-2 font-medium flex-1">
                        {/* Chat Sessions Accordion */}
                        <li>
                            <div className="flex items-center group">
                                <button
                                    onClick={() => setChatAccordionOpen(!chatAccordionOpen)}
                                    className="flex-1 flex items-center justify-between px-3 py-2 rounded-lg transition-all text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                                >
                                    <div className="flex items-center">
                                        <ClipboardList className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                                        <span className="ms-3 text-[11px] font-medium">{t('nav.chat_sessions')}</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${chatAccordionOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <button
                                    onClick={handleNewChatClick}
                                    title={t('nav.new_chat')}
                                    className="p-1.5 mr-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <AnimatePresence>
                                {chatAccordionOpen && (
                                    <Motion.ul
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="py-1.5 space-y-0.5 overflow-hidden max-h-64 overflow-y-auto"
                                    >
                                        {sessions.map((session) => (
                                            <li key={session.id} className="group/item">
                                                <div className="pl-10 flex items-center justify-between px-3 py-2 rounded-lg transition-all hover:bg-slate-50">
                                                    <button
                                                        onClick={() => {
                                                            selectSession(session.id);
                                                            if (decode(location.pathname) !== 'USER_DASHBOARD') {
                                                                navigate(PATHS.USER_DASHBOARD);
                                                            }
                                                        }}
                                                        className={`flex-1 text-left text-[10px] font-medium ${currentSessionId === session.id
                                                            ? 'text-indigo-600'
                                                            : 'text-slate-500 hover:text-indigo-600'
                                                            }`}
                                                    >
                                                        {session.title || `Chat ${session.id.slice(0, 8)}`}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteSession(session.id);
                                                        }}
                                                        className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-rose-100 rounded transition-all"
                                                    >
                                                        <Trash2 className="w-3 h-3 text-rose-500" />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </Motion.ul>
                                )}
                            </AnimatePresence>
                        </li>

                        {navItems.map((item) => {
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
                        {user?.memberOf?.name && (
                            <div className="px-3 mb-2">
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1 opacity-70">{t('nav.join_store')}:</p>
                                <p className="text-[11px] font-semibold text-slate-700 truncate">{user.memberOf.name}</p>
                            </div>
                        )}
                        <WeatherBox />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`sm:ml-64 mt-14 bg-[#f9f9f9] ${isFullHeight ? 'h-[calc(100vh-3.5rem)] overflow-hidden' : 'min-h-[calc(100vh-3.5rem)]'}`}>
                <div className={isFullHeight ? 'h-full' : ''}>
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

export default UserLayout;
