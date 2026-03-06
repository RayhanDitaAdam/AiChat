import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, Package, MessageSquare, MessageSquareText,
    Menu, User as UserIcon, LogOut, ChevronLeft, ShieldCheck, Headset,
    BarChart2, Search, Plus, Trash2, ClipboardList, ChevronDown, CalendarClock,
    Monitor, Users2, Gift, HeartPulse, Settings2, Users, CreditCard, Briefcase, LayoutGrid, FileText, Wrench,
    Brain, BookOpen, Fingerprint, History
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import { useChat } from '../context/ChatContext.js';
import { useSystemContext } from '../context/SystemContext.jsx';
import LogoutModal from '../components/LogoutModal.jsx';
import UserAvatar from '../components/UserAvatar.jsx';
import WeatherBox from '../components/WeatherBox.jsx';
import LanguageToggle from '../components/LanguageToggle.jsx';
import DigitalClock from '../components/DigitalClock.jsx';
import SearchModal from '../components/SearchModal.jsx';
import { PATHS } from '../routes/paths.js';
import { decode } from '../routes/obfuscator.js';
import { useTranslation } from 'react-i18next';

const ManagementLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const { companyName } = useSystemContext();
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

    const isOwner = user?.role === 'OWNER';
    const isStoreTeam = user?.role === 'OWNER' || user?.role === 'STAFF';
    const isApproved = user?.owner?.isApproved !== false;
    const isBengkel = user?.owner?.businessCategory === 'AUTO_REPAIR';

    // Dynamic Permission Helper
    const hasPermission = (moduleId) => {
        if (isOwner || user?.role === 'CONTRIBUTOR') return true;
        if (user?.role === 'STAFF' && user?.disabledMenus?.includes('__OVERRIDE__')) {
            return !user.disabledMenus.includes(moduleId);
        }
        if (user?.disabledMenus?.includes(moduleId)) return false;
        if (!user?.staffRole?.permissions) return false;
        return !!user.staffRole.permissions[moduleId];
    };

    const getPath = (baseId) => {
        if (isOwner) return PATHS[`OWNER_${baseId}`];
        if (user?.role === 'STAFF') return PATHS[`STAFF_${baseId}`];
        return PATHS[`CONTRIBUTOR_${baseId}`] || PATHS[`OWNER_${baseId}`];
    };

    const posSubItems = [
        { id: 'POS', name: t('nav.pos_system'), path: getPath('POS'), icon: Monitor },
        { id: 'OWNER_TRANSACTIONS', name: t('nav.transactions', 'Transactions'), path: getPath('TRANSACTIONS'), icon: CreditCard },
        { id: 'MEMBERS', name: t('nav.members'), path: getPath('MEMBERS'), icon: Users2 },
        { id: 'REPORTS', name: t('nav.sales_reports'), path: getPath('REPORTS'), icon: BarChart2 },
        { id: 'REWARDS', name: t('nav.loyalty_rewards'), path: getPath('REWARDS'), icon: Gift },
        { id: 'POS_SETTINGS', name: 'Point Rules', path: getPath('POS_SETTINGS'), icon: Settings2 },
    ];

    const inventorySubItems = [
        { id: 'PRODUCTS', name: t('nav.inventory'), path: getPath('PRODUCTS'), icon: Package },
        { id: 'RAK_LORONG', name: 'Store Layout', path: getPath('RAK_LORONG'), icon: LayoutGrid },
        { id: 'EXPIRY', name: 'Expiry', path: getPath('EXPIRY'), icon: CalendarClock },
    ];
    const currentInternalId = decode(location.pathname);

    const isPosActive = posSubItems.some(item => decode(item.path) === currentInternalId);
    const isInventoryActive = inventorySubItems.some(item => decode(item.path) === currentInternalId);

    const [posMenuOpen, setPosMenuOpen] = useState(isPosActive);
    const [inventoryMenuOpen, setInventoryMenuOpen] = useState(isInventoryActive);

    const isFullHeight = [
        'OWNER_CHAT_ASSISTANT', 'OWNER_LIVE_SUPPORT', 'CONTRIBUTOR_CHAT', 'CONTRIBUTOR_LIVE_SUPPORT',
        'OWNER_TEAM_SUITE',
        'OWNER_FACILITY_TASKS', 'STAFF_CHAT_ASSISTANT', 'STAFF_LIVE_SUPPORT',
        'STAFF_TEAM_SUITE',
        'STAFF_FACILITY_TASKS', 'OWNER_VACANCIES'
    ].includes(currentInternalId);

    const isRecruitmentActive = currentInternalId === decode(getPath('VACANCIES'));
    const [recruitmentMenuOpen, setRecruitmentMenuOpen] = useState(isRecruitmentActive);

    // Team Suite
    const isTeamActive = currentInternalId === decode(getPath('TEAM_SUITE'));
    const [teamMenuOpen, setTeamMenuOpen] = useState(isTeamActive);

    // Workshop Suite
    const isWorkshopActive = currentInternalId && currentInternalId.includes('WORKSHOP');
    const [workshopMenuOpen, setWorkshopMenuOpen] = useState(isWorkshopActive);

    // AI Suite
    const isAIActive = currentInternalId && currentInternalId.includes('OWNER_AI');
    const [aiMenuOpen, setAiMenuOpen] = useState(isAIActive);

    const query = new URLSearchParams(location.search);
    const activeTab = query.get('tab');
    const activeRecruitmentTab = activeTab || 'listings';

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

    const handleNewChatClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await startNewChat();
        const chatPath = getPath('CHAT_ASSISTANT');
        if (location.pathname !== chatPath) {
            navigate(chatPath);
        }
    };

    const navItems = [
        { id: 'DASHBOARD', name: t('nav.dashboard'), path: getPath('DASHBOARD'), icon: LayoutDashboard },
        { id: 'CHATS', name: t('nav.ai_audit_logs'), path: getPath('CHATS'), icon: MessageSquareText },
    ];

    if (isStoreTeam) {
        navItems.push(
            { id: 'SOP', name: 'SOP Perusahaan', path: getPath('SOP'), icon: FileText },
            { id: 'OWNER_LIVE_SUPPORT', name: t('nav.live_support'), path: getPath('LIVE_SUPPORT'), icon: Headset },
            { id: 'OWNER_FACILITY_TASKS', name: t('nav.facility_tasks'), path: getPath('FACILITY_TASKS'), icon: ClipboardList }
        );
    } else {
        navItems.push(
            { id: 'CONTRIBUTOR_LIVE_SUPPORT', name: t('nav.live_support'), path: getPath('LIVE_SUPPORT'), icon: Headset },
            { id: 'CONTRIBUTOR_REPORTS', name: t('nav.sales_reports'), path: getPath('REPORTS'), icon: BarChart2 },
        );
    }

    const filteredNavItems = navItems.filter(item => {
        if (item.id.includes('DASHBOARD')) return hasPermission('dashboard');
        if (item.id.includes('PRODUCTS')) return hasPermission('products');
        if (item.id.includes('RAK_LORONG')) return hasPermission('products');
        if (item.id.includes('EXPIRY')) return hasPermission('products');
        if (item.id.includes('SOP')) return true; // Accessible by all owner/staff teams roughly 
        if (item.id.includes('CHATS')) return hasPermission('chat_history');
        if (item.id.includes('LIVE_SUPPORT')) return hasPermission('live_support');
        if (item.id.includes('FACILITY_TASKS')) return hasPermission('tasks');
        if (item.id.includes('TEAM')) return hasPermission('team');
        if (item.id.includes('CONTRIBUTORS')) return hasPermission('team');
        if (item.id.includes('VACANCIES')) return hasPermission('team');
        if (item.id.includes('REPORTS')) return hasPermission('pos');
        return true;
    });

    const filteredPosSubItems = posSubItems.filter(item => {
        if (!hasPermission('pos')) return false;
        if (item.id === 'OWNER_TRANSACTIONS') return hasPermission('pos_transactions');
        if (item.id === 'MEMBERS') return hasPermission('pos_members');
        if (item.id === 'REPORTS') return hasPermission('pos_reports');
        if (item.id === 'REWARDS') return hasPermission('pos_rewards');
        if (item.id === 'POS_SETTINGS') return hasPermission('pos_settings');
        return true;
    });

    const filteredInventorySubItems = inventorySubItems.filter(_item => {
        return hasPermission('products');
    });


    const allSearchItems = [...filteredNavItems, ...filteredPosSubItems, ...filteredInventorySubItems];

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
                                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 overflow-hidden shadow-lg shadow-slate-200/50 shrink-0">
                                    <UserAvatar user={user} size={32} />
                                </div>
                                <span className="self-center text-lg font-medium tracking-tight whitespace-nowrap text-slate-900 group">
                                    {isStoreTeam ? (user?.owner?.name || user?.memberOf?.name || 'Store Access') : `${companyName} Contrib`}
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 group"
                                title="Search (⌘K)"
                            >
                                <Search className={`w-5 h-5 group-hover:${isStoreTeam ? 'text-indigo-600' : 'text-emerald-600'}`} />
                            </button>
                            <DigitalClock />
                            <LanguageToggle />
                            <div className="ms-3 relative">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className={`flex text-sm bg-slate-800 rounded-full focus:ring-4 focus:ring-slate-300 overflow-hidden shadow-lg ${isStoreTeam ? 'shadow-indigo-100' : 'shadow-emerald-100'}`}
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
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar user={user} size={32} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-slate-900 truncate">
                                                            {user?.name}
                                                        </p>
                                                        <p className="text-[10px] font-normal text-slate-500 truncate">
                                                            {user?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-1.5">
                                                <Link
                                                    to={getPath('PROFILE')}
                                                    onClick={() => setUserDropdownOpen(false)}
                                                    className={`flex items-center w-full px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 hover:${isStoreTeam ? 'text-indigo-600' : 'text-emerald-600'} rounded-lg transition-colors group`}
                                                >
                                                    <UserIcon className={`w-3.5 h-3.5 mr-2 text-slate-400 group-hover:${isStoreTeam ? 'text-indigo-600' : 'text-emerald-600'}`} />
                                                    {t('nav.profile')}
                                                </Link>
                                                {isStoreTeam && (
                                                    <Link
                                                        to={getPath('SETTINGS')}
                                                        onClick={() => setUserDropdownOpen(false)}
                                                        className="flex items-center w-full px-3 py-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors group"
                                                    >
                                                        <ShieldCheck className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-indigo-600" />
                                                        {t('nav.settings')}
                                                    </Link>
                                                )}
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
                className={`fixed top-0 left-0 z-40 w-64 h-screen pt-14 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 bg-white border-r border-slate-200`}
            >
                <div className="h-full px-3 pb-4 pt-4 overflow-y-auto flex flex-col scrollbar-hide">
                    {/* Role/Store Banner */}
                    <div className="mb-6 px-3">
                        <div className={`rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden group border ${isStoreTeam ? 'bg-indigo-50 border-indigo-100' : 'bg-emerald-50 border-emerald-100'}`}>
                            <div className="absolute top-0 right-0 p-1">
                                <ShieldCheck className={`w-12 h-12 ${isStoreTeam ? 'text-indigo-100' : 'text-emerald-100'} -rotate-12 transform translate-x-2 -translate-y-2`} />
                            </div>
                            <div className={`w-10 h-10 ${isStoreTeam ? 'bg-indigo-600' : 'bg-emerald-600'} rounded-xl flex items-center justify-center text-white shadow-lg z-10 shrink-0`}>
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div className="z-10 min-w-0">
                                <p className={`text-[9px] font-medium ${isStoreTeam ? 'text-indigo-600' : 'text-emerald-600'} uppercase tracking-widest leading-tight truncate`}>
                                    {isOwner ? 'Owner Access' : (user?.role === 'STAFF' ? 'Staff Access' : 'Contributor')}
                                </p>
                                <p className="text-xs font-medium text-slate-800 tracking-tight truncate">
                                    {user?.owner?.name || user?.memberOf?.name || 'Authorized'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <ul className="space-y-4 font-medium flex-1">
                        {/* AI Assistant Section */}
                        {hasPermission('ai_assistant') && (
                            <div className="space-y-1">
                                <p className="px-3 text-[9px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-2">AI Assistant</p>
                                <li>
                                    <div className="flex items-center group">
                                        <button
                                            onClick={() => setChatAccordionOpen(!chatAccordionOpen)}
                                            className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl transition-all text-slate-600 hover:bg-slate-50 hover:${isStoreTeam ? 'text-indigo-600' : 'text-emerald-600'}`}
                                        >
                                            <div className="flex items-center">
                                                <ClipboardList className={`w-4 h-4 text-slate-400 group-hover:${isStoreTeam ? 'text-indigo-600' : 'text-emerald-600'}`} />
                                                <span className="ms-3 text-[11px] font-medium tracking-tight">{t('nav.chat_sessions')}</span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${chatAccordionOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        <button
                                            onClick={handleNewChatClick}
                                            title={t('nav.new_chat')}
                                            className={`p-1.5 mr-2 ${isStoreTeam ? 'text-indigo-600' : 'text-emerald-600'} hover:bg-slate-50 rounded-lg transition-all opacity-0 group-hover:opacity-100`}
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
                                                className="py-1.5 space-y-0.5 overflow-hidden max-h-48 overflow-y-auto scrollbar-hide"
                                            >
                                                {sessions.map((session) => (
                                                    <li key={session.id} className="group/item">
                                                        <div className="pl-10 flex items-center justify-between px-3 py-1.5 rounded-xl transition-all hover:bg-slate-50">
                                                            <button
                                                                onClick={() => {
                                                                    selectSession(session.id);
                                                                    const chatPath = getPath('CHAT_ASSISTANT');
                                                                    if (location.pathname !== chatPath) navigate(chatPath);
                                                                }}
                                                                className={`flex-1 text-left text-[10px] font-normal tracking-tight truncate ${currentSessionId === session.id
                                                                    ? (isStoreTeam ? 'text-indigo-600' : 'text-emerald-600')
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
                            </div>
                        )}

                        {/* Management Section */}
                        <div className="space-y-1">
                            <p className="px-3 text-[9px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-2">Operations</p>
                            {filteredNavItems.map((item) => {
                                const isActive = currentInternalId === decode(item.path);
                                return (
                                    <li key={item.id}>
                                        <Link
                                            to={item.path}
                                            className={`flex items-center px-3 py-2.5 rounded-xl transition-all group ${isActive
                                                ? (isStoreTeam ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50' : 'bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100/50')
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                                }`}
                                        >
                                            <item.icon className={`w-4 h-4 transition-colors ${isActive ? (isStoreTeam ? 'text-indigo-600' : 'text-emerald-600') : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                            <span className="ms-3 text-[11px] font-medium tracking-tight">{item.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}

                            {/* Inventory Suite Dropdown */}
                            {filteredInventorySubItems.length > 0 && (
                                <li>
                                    <button
                                        onClick={() => setInventoryMenuOpen(!inventoryMenuOpen)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${isInventoryActive
                                            ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <Package className={`w-4 h-4 transition-colors ${isInventoryActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                            <span className="ms-3 text-[11px] font-medium tracking-tight uppercase">Inventory Suite</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${inventoryMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {inventoryMenuOpen && (
                                            <Motion.ul
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="py-1.5 space-y-0.5 overflow-hidden"
                                            >
                                                {filteredInventorySubItems.map((item) => {
                                                    const isActive = currentInternalId === decode(item.path);
                                                    return (
                                                        <li key={item.id}>
                                                            <Link
                                                                to={item.path}
                                                                className={`pl-10 flex items-center px-3 py-2 rounded-xl transition-all group ${isActive
                                                                    ? 'bg-indigo-50/50 text-indigo-600'
                                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                                                                    }`}
                                                            >
                                                                <item.icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                                                <span className="ms-3 text-[10px] font-medium tracking-tight uppercase">{item.name}</span>
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </Motion.ul>
                                        )}
                                    </AnimatePresence>
                                </li>
                            )}

                            {/* POS Dropdown (Internal/Owner specialized) */}
                            {filteredPosSubItems.length > 0 && (
                                <li>
                                    <button
                                        onClick={() => setPosMenuOpen(!posMenuOpen)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${isPosActive
                                            ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <Monitor className={`w-4 h-4 transition-colors ${isPosActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                            <span className="ms-3 text-[11px] font-medium tracking-tight uppercase">Commerce Suite</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${posMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {posMenuOpen && (
                                            <Motion.ul
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="py-1.5 space-y-0.5 overflow-hidden"
                                            >
                                                {filteredPosSubItems.map((item) => {
                                                    const isActive = currentInternalId === decode(item.path);
                                                    return (
                                                        <li key={item.id}>
                                                            <Link
                                                                to={item.path}
                                                                className={`pl-10 flex items-center px-3 py-2 rounded-xl transition-all group ${isActive
                                                                    ? 'bg-indigo-50/50 text-indigo-600'
                                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                                                                    }`}
                                                            >
                                                                <item.icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                                                <span className="ms-3 text-[10px] font-medium tracking-tight uppercase">{item.name}</span>
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </Motion.ul>
                                        )}
                                    </AnimatePresence>
                                </li>
                            )}

                            {/* Recruitment Suite Dropdown */}
                            {hasPermission('team') && isStoreTeam && (
                                <li>
                                    <button
                                        onClick={() => setRecruitmentMenuOpen(!recruitmentMenuOpen)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${isRecruitmentActive
                                            ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <Briefcase className={`w-4 h-4 transition-colors ${isRecruitmentActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                            <span className="ms-3 text-[11px] font-medium tracking-tight uppercase">Recruitment Suite</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${recruitmentMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {recruitmentMenuOpen && (
                                            <Motion.ul
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="py-1.5 space-y-0.5 overflow-hidden"
                                            >
                                                <li>
                                                    <button
                                                        onClick={() => {
                                                            const p = getPath('VACANCIES');
                                                            console.log("Navigating to Career Listings:", p);
                                                            navigate(p ? `${p}?tab=listings` : '/owner/vacancies?tab=listings');
                                                        }}
                                                        className={`w-full pl-10 flex items-center px-3 py-2 rounded-xl transition-all group ${isRecruitmentActive && activeRecruitmentTab === 'listings'
                                                            ? 'bg-indigo-50/50 text-indigo-600'
                                                            : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                                                            }`}
                                                    >
                                                        <LayoutGrid size={14} className={`transition-colors ${isRecruitmentActive && activeRecruitmentTab === 'listings' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                                        <span className="ms-3 text-[10px] font-medium tracking-tight uppercase">Career Listings</span>
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={() => {
                                                            const p = getPath('VACANCIES');
                                                            navigate(p && p !== '/' ? `${p}?tab=applicants` : (isOwner ? '/owner/vacancies?tab=applicants' : '/staff/vacancies?tab=applicants'));
                                                        }}
                                                        className={`w-full pl-10 flex items-center px-3 py-2 rounded-xl transition-all group ${isRecruitmentActive && activeRecruitmentTab === 'applicants'
                                                            ? 'bg-indigo-50/50 text-indigo-600'
                                                            : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                                                            }`}
                                                    >
                                                        <Users size={14} className={`transition-colors ${isRecruitmentActive && activeRecruitmentTab === 'applicants' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                                        <span className="ms-3 text-[10px] font-medium tracking-tight uppercase">Talent Pool</span>
                                                    </button>
                                                </li>
                                            </Motion.ul>
                                        )}
                                    </AnimatePresence>
                                </li>
                            )}
                        </div>

                        {/* Team Suite Dropdown */}
                        {hasPermission('team') && isStoreTeam && (
                            <li>
                                <button
                                    onClick={() => setTeamMenuOpen(!teamMenuOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${isTeamActive
                                        ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <Users className={`w-4 h-4 transition-colors ${isTeamActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                        <span className="ms-3 text-[11px] font-medium tracking-tight uppercase">Team Suite</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${teamMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {teamMenuOpen && (
                                        <Motion.ul
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="py-1.5 space-y-0.5 overflow-hidden"
                                        >
                                            <li>
                                                <button
                                                    onClick={() => navigate(isOwner ? `${getPath('TEAM_SUITE')}?tab=staff` : getPath('TEAM'))}
                                                    className={`w-full pl-10 flex items-center px-3 py-2 rounded-xl transition-all group ${isTeamActive && (activeTab === 'staff' || !activeTab)
                                                        ? 'bg-indigo-50/50 text-indigo-600'
                                                        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                                                        }`}
                                                >
                                                    <Users2 size={14} className={`transition-colors ${isTeamActive && (activeTab === 'staff' || !activeTab) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                                    <span className="ms-3 text-[10px] font-medium tracking-tight uppercase">Staff / Team</span>
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => navigate(isOwner ? `${getPath('TEAM_SUITE')}?tab=contributors` : getPath('CONTRIBUTORS'))}
                                                    className={`w-full pl-10 flex items-center px-3 py-2 rounded-xl transition-all group ${isTeamActive && activeTab === 'contributors'
                                                        ? 'bg-indigo-50/50 text-indigo-600'
                                                        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                                                        }`}
                                                >
                                                    <Briefcase size={14} className={`transition-colors ${isTeamActive && activeTab === 'contributors' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                                    <span className="ms-3 text-[10px] font-medium tracking-tight uppercase">{t('nav.contributors', 'Contributors')}</span>
                                                </button>
                                            </li>
                                        </Motion.ul>
                                    )}
                                </AnimatePresence>
                            </li>
                        )}

                        {/* Workshop Suite Dropdown - AUTO_REPAIR only */}
                        {isBengkel && isStoreTeam && (
                            <li>
                                <button
                                    onClick={() => setWorkshopMenuOpen(!workshopMenuOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${isWorkshopActive
                                        ? 'bg-orange-50 text-orange-600 shadow-sm shadow-orange-100/50'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-orange-600'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <Wrench className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                                        <span className="ms-3 text-[11px] font-medium tracking-tight uppercase">Workshop Suite</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${workshopMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {workshopMenuOpen && (
                                        <Motion.ul
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="py-1.5 space-y-0.5 overflow-hidden"
                                        >
                                            {[
                                                { pathKey: 'WORKSHOP_CHECKIN', label: 'Check-In', icon: Plus },
                                                { pathKey: 'WORKSHOP_QUEUE', label: 'Work Orders', icon: ClipboardList },
                                                { pathKey: 'WORKSHOP_HISTORY', label: 'Service History', icon: CalendarClock },
                                                { pathKey: 'WORKSHOP_BILLING', label: 'Billing', icon: CreditCard },
                                                null, // divider
                                                { pathKey: 'WORKSHOP_MECHANICS', label: 'Mechanics', icon: Users2 },
                                                { pathKey: 'WORKSHOP_ATTENDANCE', label: 'Attendance', icon: HeartPulse },
                                                { pathKey: 'WORKSHOP_COMMISSION', label: 'Commission', icon: Gift },
                                                null, // divider
                                                { pathKey: 'WORKSHOP_SUPPLIERS', label: 'Suppliers', icon: Package },
                                            ].map((item, idx) => {
                                                if (!item) return <hr key={idx} className="my-1 border-gray-100 mx-3" />;

                                                const targetPathKey = isOwner ? `OWNER_${item.pathKey}` : `STAFF_${item.pathKey}`;
                                                const targetPath = getPath(item.pathKey);
                                                const isActive = currentInternalId === targetPathKey;

                                                return (
                                                    <li key={item.pathKey}>
                                                        <button
                                                            onClick={() => {
                                                                console.log("Navigating Workshop Menu item:", item.pathKey, "targetPath:", targetPath);
                                                                if (!targetPath || targetPath === '/') {
                                                                    // Fallback explicitly if glitching
                                                                    let routeName = item.pathKey.replace('WORKSHOP_', '').toLowerCase().replace('_', '-');
                                                                    if (routeName === 'history') routeName = 'service-history';
                                                                    if (routeName === 'queue') routeName = 'work-orders';

                                                                    const fallback = isOwner ? `/owner/workshop/${routeName}` : `/staff/workshop/${routeName}`;
                                                                    navigate(fallback);
                                                                } else {
                                                                    navigate(targetPath);
                                                                }
                                                            }}
                                                            className={`w-full pl-10 flex items-center px-3 py-2 rounded-xl transition-all group ${isActive
                                                                ? 'bg-orange-50/80 text-orange-600'
                                                                : 'text-slate-500 hover:bg-slate-50 hover:text-orange-600'
                                                                }`}
                                                        >
                                                            <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-500'}`} />
                                                            <span className="ms-3 text-[10px] font-medium tracking-tight uppercase">{item.label}</span>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </Motion.ul>
                                    )}
                                </AnimatePresence>
                            </li>
                        )}

                        {/* AI Intelligence Suite - Only for Owners */}
                        {isOwner && (
                            <li>
                                <button
                                    onClick={() => setAiMenuOpen(!aiMenuOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${isAIActive
                                        ? 'bg-purple-50 text-purple-600 shadow-sm shadow-purple-100/50'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-purple-600'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <Brain className={`w-4 h-4 transition-colors ${isAIActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'}`} />
                                        <span className="ms-3 text-[11px] font-medium tracking-tight uppercase">AI Intelligence</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${aiMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {aiMenuOpen && (
                                        <Motion.ul
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="py-1.5 space-y-0.5 overflow-hidden"
                                        >
                                            {[
                                                { path: PATHS.OWNER_AI_TRAINING, label: 'Training Dashboard', icon: BarChart2 },
                                                { path: PATHS.OWNER_AI_KNOWLEDGE, label: 'Knowledge Base', icon: BookOpen },
                                                { path: PATHS.OWNER_AI_INTENTS, label: 'Intent Manager', icon: Fingerprint },
                                                { path: PATHS.OWNER_AI_LOGS, label: 'Conversation Logs', icon: History },
                                            ].map((item) => {
                                                const isActive = decode(location.pathname) === decode(item.path);
                                                return (
                                                    <li key={item.path}>
                                                        <Link
                                                            to={item.path}
                                                            className={`pl-10 flex items-center px-3 py-2 rounded-xl transition-all group ${isActive
                                                                ? 'bg-purple-50/50 text-purple-600'
                                                                : 'text-slate-500 hover:bg-slate-50 hover:text-purple-600'
                                                                }`}
                                                        >
                                                            <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'}`} />
                                                            <span className="ms-3 text-[10px] font-medium tracking-tight uppercase">{item.label}</span>
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </Motion.ul>
                                    )}
                                </AnimatePresence>
                            </li>
                        )}
                    </ul>

                    <div className="mt-auto pt-4 border-t border-slate-100">
                        <div className="px-3 mb-4">
                            <Link
                                to={getPath('PROFILE')}
                                className={`flex items-center p-3 rounded-2xl transition-all group ${decode(location.pathname) === decode(getPath('PROFILE'))
                                    ? (isStoreTeam ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'bg-emerald-50 text-emerald-100 shadow-sm')
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                <UserAvatar user={user} size={40} className="shrink-0" />
                                <div className="ms-3 min-w-0">
                                    <p className="text-[11px] font-medium tracking-tight truncate">{t('nav.profile')}</p>
                                    <p className="text-[9px] font-normal text-slate-500 truncate">{user?.name}</p>
                                </div>
                            </Link>
                        </div>
                        <WeatherBox />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`sm:ml-64 mt-14 bg-[#f9f9f9] ${isFullHeight ? 'h-[calc(100vh-3.5rem)] overflow-hidden' : 'min-h-[calc(100vh-3.5rem)]'}`}>
                <div className={isFullHeight ? 'h-full' : ''}>
                    {isApproved ? (
                        children || <Outlet />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <ShieldCheck className="w-16 h-16 text-amber-500 mb-6" />
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Pending Approval</h2>
                            <p className="text-slate-500 font-normal max-w-md">Your account is currently awaiting administrative approval. Some features may be restricted.</p>
                        </div>
                    )}
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
                navItems={allSearchItems}
            />
        </div>
    );
};

export default ManagementLayout;
