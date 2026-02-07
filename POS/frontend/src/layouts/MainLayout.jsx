import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { PATHS } from '../routes/paths';
import {
    LayoutDashboard, ShoppingCart, Package, Users,
    HeartPulse, BarChart3, Settings, LogOut, Menu, X,
    ChevronRight, Gift
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const SidebarItem = ({ to, icon: Icon, label, isOpen }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                border-2 ${isActive ? 'bg-black text-white border-black shadow-xl shadow-black/10 scale-[1.02]' : 'bg-transparent text-gray-400 border-transparent hover:bg-black hover:text-white hover:border-black'}
                ${!isOpen ? 'justify-center px-0' : ''}
            `}
        >
            <Icon className="w-5 h-5 shrink-0" />
            <AnimatePresence mode="wait">
                {isOpen && (
                    <Motion.span
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        className="font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap"
                    >
                        {label}
                    </Motion.span>
                )}
            </AnimatePresence>
        </NavLink>
    );
};

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate(PATHS.LOGIN);
    };

    const menuItems = [
        { to: PATHS.HOME, icon: LayoutDashboard, label: 'Dashboard' },
        { to: PATHS.POS, icon: ShoppingCart, label: 'Cashier POS' },
        { to: PATHS.INVENTORY, icon: Package, label: 'Inventory' },
        { to: PATHS.MEMBERS, icon: Users, label: 'Members' },
        { to: PATHS.REWARDS, icon: Gift, label: 'Rewards' },
        { to: PATHS.HEALTH, icon: HeartPulse, label: 'Health AI' },
        { to: PATHS.REPORTS, icon: BarChart3, label: 'Analytics' },
    ];

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans text-black">
            {/* Sidebar */}
            <Motion.aside
                animate={{ width: isOpen ? 260 : 88 }}
                className="bg-white flex flex-col p-4 relative z-30 border-r border-gray-100"
            >
                <div className="flex items-center justify-between mb-12 px-2 h-16">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 rotate-3 shadow-2xl shadow-black/20">H</div>
                        {isOpen && (
                            <Motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col"
                            >
                                <span className="font-black tracking-tighter text-xl leading-none italic text-black">HEART</span>
                                <span className="text-[7px] text-gray-400 uppercase tracking-[0.4em] mt-1 font-black">Intelligenz</span>
                            </Motion.div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-black transition-colors"
                    >
                        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => (
                        <SidebarItem key={item.to} {...item} isOpen={isOpen} />
                    ))}
                </nav>

                <div className="mt-auto pt-6 space-y-4">
                    <div className={`p-4 bg-gray-50 border border-gray-100 rounded-[2rem] flex items-center gap-3 ${!isOpen && 'justify-center overflow-hidden h-14 w-14 p-0 mx-auto'}`}>
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black shrink-0 shadow-sm border border-gray-100">
                            <Users size={18} strokeWidth={1} />
                        </div>
                        {isOpen && (
                            <div className="flex flex-col min-w-0">
                                <span className="font-black text-[10px] uppercase tracking-tighter truncate leading-none text-black">{user?.name}</span>
                                <span className="text-[8px] text-gray-400 uppercase leading-none mt-1 font-black tracking-widest opacity-50">{user?.role}</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`
                            group flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-500
                            border-2 border-transparent text-gray-400 hover:bg-red-500 hover:text-white hover:border-red-500
                            ${!isOpen ? 'justify-center' : ''}
                        `}
                    >
                        <LogOut size={18} strokeWidth={2} />
                        {isOpen && <span className="font-black text-[9px] uppercase tracking-[0.3em]">Sign Out</span>}
                    </button>
                </div>
            </Motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative bg-white">
                <header className="h-16 flex items-center justify-between px-8 border-b border-gray-100 shrink-0 relative z-20 bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-[10px] font-black uppercase tracking-widest">Pages</span>
                        <ChevronRight className="w-3 h-3 text-gray-200" />
                        <span className="text-black font-black tracking-tighter italic text-xs uppercase">
                            {window.location.pathname.split('/').pop() || 'Dashboard'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-100 bg-gray-50">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">System Online</span>
                        </div>
                    </div>
                </header>

                <section className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10 bg-white">
                    <Outlet />
                </section>
            </main>
        </div>
    );
};

export default MainLayout;
