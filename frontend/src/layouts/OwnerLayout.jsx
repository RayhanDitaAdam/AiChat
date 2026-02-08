import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, Package, MessageSquare, MessageSquareText,
    Menu, User as UserIcon, LogOut, ChevronLeft, ShieldCheck, Headset, ClipboardList, Users,
    Monitor, Users2, BarChart2, Gift, HeartPulse, ChevronDown, Lock
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import LogoutModal from '../components/LogoutModal.jsx';
import WeatherBox from '../components/WeatherBox.jsx';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { PATHS } from '../routes/paths.js';
import { decode } from '../routes/obfuscator.js';
import { useTranslation } from 'react-i18next';

const OwnerLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [posMenuOpen, setPosMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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


    const regularNavItems = [
        { id: 'OWNER_DASHBOARD', name: t('nav.dashboard'), path: PATHS.OWNER_DASHBOARD, icon: LayoutDashboard },
        { id: 'OWNER_PRODUCTS', name: t('nav.inventory'), path: PATHS.OWNER_PRODUCTS, icon: Package },
        { id: 'OWNER_CHATS', name: t('nav.ai_audit_logs'), path: PATHS.OWNER_CHATS, icon: MessageSquareText },
        { id: 'OWNER_CHAT_ASSISTANT', name: t('nav.chat_assistant'), path: PATHS.OWNER_CHAT_ASSISTANT, icon: MessageSquare },
        { id: 'OWNER_LIVE_SUPPORT', name: t('nav.live_support'), path: PATHS.OWNER_LIVE_SUPPORT, icon: Headset },
        { id: 'OWNER_SETTINGS', name: t('nav.store_settings'), path: PATHS.OWNER_SETTINGS, icon: ShieldCheck },
        { id: 'OWNER_FACILITY_TASKS', name: t('nav.facility_tasks'), path: PATHS.OWNER_FACILITY_TASKS, icon: ClipboardList },
        { id: 'OWNER_TEAM', name: t('nav.staff_management'), path: PATHS.OWNER_TEAM, icon: Users },
        { id: 'OWNER_PROFILE', name: t('nav.profile'), path: PATHS.OWNER_PROFILE, icon: UserIcon },
    ];

    const posSubItems = [
        { id: 'OWNER_POS', name: t('nav.pos_system'), path: PATHS.OWNER_POS, icon: Monitor },
        { id: 'OWNER_MEMBERS', name: t('nav.members'), path: PATHS.OWNER_MEMBERS, icon: Users2 },
        { id: 'OWNER_REPORTS', name: t('nav.sales_reports'), path: PATHS.OWNER_REPORTS, icon: BarChart2 },
        { id: 'OWNER_REWARDS', name: t('nav.loyalty_rewards'), path: PATHS.OWNER_REWARDS, icon: Gift },
        { id: 'OWNER_HEALTH', name: t('nav.health_intel'), path: PATHS.OWNER_HEALTH, icon: HeartPulse },
    ];

    const currentInternalId = decode(location.pathname);
    const isPosActive = posSubItems.some(item => item.id === currentInternalId);


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
                            <Link to={PATHS.OWNER_DASHBOARD} className="flex items-center ms-2 md:me-24">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm mr-3">
                                    {user?.owner?.name?.[0] || 'H'}
                                </div>
                                <span className="self-center text-lg font-semibold whitespace-nowrap text-slate-900">
                                    {user?.owner?.name || 'Heart Admin'}
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
                                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                        {user?.name?.[0] || 'H'}
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
                                                        to={PATHS.OWNER_PROFILE}
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

                                                    <Link
                                                        role="menuitem"
                                                        to={PATHS.OWNER_SETTINGS}
                                                        onClick={() => setUserDropdownOpen(false)}
                                                        className="flex items-center justify-between w-full px-3 py-2 text-[11px] font-black uppercase italic tracking-tight text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors group"
                                                    >
                                                        <div className="flex items-center">
                                                            <ShieldCheck className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-indigo-600" />
                                                            {t('nav.settings')}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-slate-300 tracking-widest ml-auto">⌘S</span>
                                                    </Link>

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
                    <ul className="space-y-2 font-medium flex-1">

                        {regularNavItems.map((item) => {
                            const isActive = currentInternalId === item.id;
                            const isDisabled = !isApproved && item.path !== PATHS.OWNER_DASHBOARD;
                            const isManuallyDisabled = user?.disabledMenus?.includes(item.name);

                            if (isDisabled || isManuallyDisabled) return null;

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

                        {/* POS Dropdown Menu */}
                        <li>
                            {user?.disabledMenus?.includes('POS System') ? (
                                <Link
                                    to={`${PATHS.RESTRICTED}?menu=${encodeURIComponent('POS System')}`}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg transition-all group text-slate-400 hover:bg-slate-50"
                                >
                                    <div className="flex items-center">
                                        <Monitor className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                                        <span className="ms-3 text-[11px] font-black uppercase italic tracking-tight">POS System</span>
                                    </div>
                                    <Lock size={14} className="text-amber-500" />
                                </Link>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setPosMenuOpen(!posMenuOpen)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group ${isPosActive
                                            ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <Monitor className={`w-4 h-4 transition-colors ${isPosActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                            <span className="ms-3 text-[11px] font-black uppercase italic tracking-tight">POS System</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${posMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {posMenuOpen && (
                                            <Motion.ul
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="py-1.5 space-y-0.5 overflow-hidden"
                                            >
                                                {posSubItems.map((item) => {
                                                    const isActive = currentInternalId === item.id;
                                                    const isManuallyDisabled = user?.disabledMenus?.includes(item.name);

                                                    if (isManuallyDisabled) return null;

                                                    return (
                                                        <li key={item.path}>
                                                            <Link
                                                                to={item.path}
                                                                className={`pl-10 flex items-center px-3 py-2 rounded-lg transition-all group ${isActive
                                                                    ? 'bg-indigo-50/50 text-indigo-600'
                                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                                                                    }`}
                                                            >
                                                                <item.icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                                                                <span className="ms-3 text-[10px] font-black uppercase italic tracking-tight">{item.name}</span>
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </Motion.ul>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                        </li>
                    </ul>
                    <div className="mt-auto pt-4">
                        <WeatherBox />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="sm:ml-64 mt-14 h-full overflow-hidden bg-[#f9f9f9]">
                <div className={location.pathname === PATHS.OWNER_CHAT_ASSISTANT ? 'h-full' : 'h-full overflow-auto'}>
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
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('common.pending_approval')}</h2>
                                <p className="text-slate-500 max-w-md mx-auto font-medium">
                                    {t('common.pending_approval_desc')}
                                </p>
                            </div>
                            <div className="pt-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('common.contact_support')}</p>
                            </div>
                        </Motion.div>
                    )}
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

export default OwnerLayout;
