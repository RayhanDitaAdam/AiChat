import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import UserAvatar from '../components/UserAvatar.jsx';
import {
    MessageSquare, LogOut, Store, Headset, ClipboardList, User as UserIcon, ShieldCheck, Menu, Search, ChevronDown
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import useSidebar from '../hooks/useSidebar.js';
import LogoutModal from '../components/LogoutModal.jsx';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { ThemeToggleButton } from '../components/ThemeToggleButton.jsx';
import { PATHS } from '../routes/paths.js';
import { decode } from '../routes/obfuscator.js';
import WeatherBox from '../components/WeatherBox.jsx';
import { useTranslation } from 'react-i18next';
import DigitalClock from '../components/DigitalClock.jsx';

const StaffLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleSidebar, toggleMobileSidebar } = useSidebar();
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const navItems = [
        { id: 'STAFF_LIVE_SUPPORT', name: t('nav.chat_with_user') || 'Live Support', path: PATHS.STAFF_LIVE_SUPPORT, icon: Headset },
        { id: 'USER_FACILITY_TASKS', name: t('nav.task_reporting') || 'Task Reporting', path: PATHS.USER_FACILITY_TASKS, icon: ClipboardList },
        { id: 'USER_DASHBOARD', name: t('nav.chat_assistant') || 'AI Chat', path: PATHS.USER_DASHBOARD, icon: MessageSquare },
        { id: 'USER_PROFILE', name: t('nav.profile') || 'Profile', path: PATHS.USER_PROFILE, icon: UserIcon },
    ];

    const currentInternalId = decode(location.pathname);
    const handleToggle = () => {
        if (window.innerWidth >= 1024) {
            toggleSidebar();
        } else {
            toggleMobileSidebar();
        }
    };

    const sidebarVisible = isExpanded || isHovered || isMobileOpen;

    return (
        <div className="min-h-screen lg:flex">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 bg-white dark:bg-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 dark:border-gray-800
                    ${sidebarVisible ? "w-[290px]" : "w-[90px]"}
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0`}
                onMouseEnter={() => !isExpanded && setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Logo */}
                <div className={`py-8 px-5 flex ${!sidebarVisible ? "lg:justify-center" : "justify-start"}`}>
                    <Link to={PATHS.STAFF_LIVE_SUPPORT}>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-white text-sm mr-3">
                                S
                            </div>
                            {sidebarVisible && (
                                <span className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">
                                    Staff Portal
                                </span>
                            )}
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex flex-col h-[calc(100vh-120px)] overflow-y-auto no-scrollbar px-5">
                    <div className={`mb-4 px-3 py-1 ${!sidebarVisible ? "lg:hidden" : ""}`}>
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Main Menu</span>
                    </div>
                    <nav className="mb-6 flex-1">
                        <ul className="flex flex-col gap-2">
                            {navItems.map((item) => {
                                const active = currentInternalId === item.id;
                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`menu-item group ${active ? "menu-item-active" : "menu-item-inactive"} ${!sidebarVisible ? "lg:justify-center" : "lg:justify-start"}`}
                                        >
                                            <span className={`menu-item-icon-size ${active ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                                                <item.icon className="w-6 h-6" />
                                            </span>
                                            {sidebarVisible && (
                                                <span className="menu-item-text">{item.name}</span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Weather Widget */}
                    {sidebarVisible && (
                        <div className="mt-auto pt-4 pb-6 border-t border-gray-100 dark:border-gray-800">
                            {user?.memberOf?.name && (
                                <div className="px-3 mb-3">
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{t('nav.join_store')}:</p>
                                    <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200 truncate">{user.memberOf.name}</p>
                                </div>
                            )}
                            <WeatherBox />
                        </div>
                    )}
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleMobileSidebar}
                />
            )}

            {/* Main Content */}
            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${sidebarVisible ? "lg:ml-[290px]" : "lg:ml-[90px]"} ${isMobileOpen ? "ml-0" : ""}`}
            >
                {/* Header */}
                <header className="sticky top-0 flex w-full bg-white border-gray-200 z-999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
                    <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
                        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
                            {/* Toggle Button */}
                            <button
                                className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg dark:border-gray-800 dark:text-gray-400 lg:h-11 lg:w-11 hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={handleToggle}
                                aria-label="Toggle Sidebar"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {/* Digital Clock - Desktop */}
                            <div className="hidden md:block">
                                <DigitalClock />
                            </div>

                            {/* Search Bar - Desktop */}
                            <div className="hidden lg:block">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder={t('common.search') || "Search..."}
                                        className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400 xl:w-[330px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center justify-between w-full gap-4 px-5 py-4 lg:justify-end lg:px-0 lg:w-auto">
                            <div className="flex items-center gap-2">
                                <LanguageToggle />
                                <ThemeToggleButton />
                            </div>

                            {/* User Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <UserAvatar user={user} size={40} />
                                    <div className="hidden lg:block text-left">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user?.name}
                                        </p>
                                        <p className="text-xs text-brand-500 font-bold uppercase tracking-wider">
                                            Staff
                                        </p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </button>

                                <AnimatePresence>
                                    {userDropdownOpen && (
                                        <Motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 top-14 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-theme-lg w-64 overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {user?.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                    {user?.email}
                                                </p>
                                            </div>

                                            <div className="p-2">
                                                <Link to={PATHS.USER_PROFILE} onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                                    <UserIcon className="w-4 h-4" /> {t('nav.profile')}
                                                </Link>
                                                <hr className="my-2 border-gray-200 dark:border-gray-800" />
                                                <button onClick={() => { setUserDropdownOpen(false); setShowLogoutModal(true); }} className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-error-600 dark:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-lg transition-colors">
                                                    <LogOut className="w-4 h-4" /> {t('nav.logout')}
                                                </button>
                                            </div>
                                        </Motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className={`p-4 mx-auto max-w-screen-2xl md:p-6 ${(currentInternalId === 'USER_DASHBOARD' || currentInternalId === 'STAFF_LIVE_SUPPORT') ? 'h-[calc(100vh-80px)] overflow-hidden' : 'min-h-[calc(100vh-80px)]'}`}>
                    <div className={(currentInternalId === 'USER_DASHBOARD' || currentInternalId === 'STAFF_LIVE_SUPPORT') ? 'h-full' : ''}>
                        {children || <Outlet />}
                    </div>
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

export default StaffLayout;
