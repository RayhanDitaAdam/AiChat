import React from 'react';
import { Lock, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useUser } from '../context/useUser';
import { useToast } from '../context/ToastContext';
import { PATHS } from '../routes/paths.js';

const MenuRestricted = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useUser();
    const { showToast } = useToast();
    const queryParams = new URLSearchParams(location.search);
    const menuName = queryParams.get('menu') || 'This Feature';

    const handleLogout = () => {
        logout();
        showToast('Logged out successfully', 'info');
        navigate('/', { replace: true });
    };

    const getDashboardPath = () => {
        if (!user) return PATHS.HOME;
        switch (user.role) {
            case 'ADMIN': return PATHS.ADMIN_DASHBOARD;
            case 'OWNER': return PATHS.OWNER_DASHBOARD;
            case 'CONTRIBUTOR': return PATHS.CONTRIBUTOR_DASHBOARD;
            case 'STAFF': return PATHS.USER_FACILITY_TASKS;
            default: return PATHS.USER_DASHBOARD;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-medium">
            <Motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card max-w-md w-full p-10 text-center space-y-8"
            >
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-500 relative">
                        <Lock className="w-12 h-12" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full border-4 border-white animate-pulse" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-medium text-slate-900 tracking-tight leading-tight uppercase italic">
                        Access <span className="text-amber-500 underline decoration-amber-200 decoration-8 underline-offset-4">Restricted</span>
                    </h1>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Oops! The <span className="font-bold text-slate-900">"{menuName}"</span> menu has been disabled for your account by the administrator.
                    </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] uppercase font-medium tracking-[0.2em] text-slate-400 mb-1">Authorization Status</p>
                    <p className="text-sm font-bold text-slate-700">FEATURE_DISABLED_403</p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        to={getDashboardPath()}
                        className="btn btn-primary w-full h-14 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                    >
                        <LayoutDashboard className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="btn btn-ghost w-full h-14 flex items-center justify-center gap-2 text-slate-500"
                    >
                        <LogOut className="w-4 h-4" /> Logout from Session
                    </button>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest pt-2">
                        Contact admin to enable this menu
                    </p>
                </div>
            </Motion.div>
        </div>
    );
};

export default MenuRestricted;
