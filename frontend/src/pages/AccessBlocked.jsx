import React from 'react';
import { ShieldAlert, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useUser } from '../context/useUser';
import { useToast } from '../context/ToastContext';

const AccessBlocked = () => {
    const navigate = useNavigate();
    const { logout } = useUser();
    const { showToast } = useToast();

    const handleLogout = () => {
        logout();
        showToast('Logged out successfully', 'info');
        navigate('/', { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <Motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card max-w-md w-full p-10 text-center space-y-8"
            >
                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 relative">
                        <ShieldAlert className="w-12 h-12" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full border-4 border-white animate-pulse" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">
                        Access <span className="text-rose-500 underline decoration-rose-200 decoration-8 underline-offset-4">Blocked</span>
                    </h1>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Your account has been temporarily disabled by the administrator.
                        You no longer have access to the dashboard or system features.
                    </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-1">Status Code</p>
                    <p className="text-sm font-bold text-slate-700">ACCOUNT_SUSPENDED_403</p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        to="/"
                        className="btn btn-primary w-full h-14 flex items-center justify-center gap-2"
                    >
                        <LayoutDashboard className="w-4 h-4" /> Back to Home
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="btn btn-ghost w-full h-14 flex items-center justify-center gap-2 text-slate-500"
                    >
                        <LogOut className="w-4 h-4" /> Logout from Session
                    </button>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest pt-2">
                        Contact support if this is a mistake
                    </p>
                </div>
            </Motion.div>
        </div>
    );
};

export default AccessBlocked;
