import React from 'react';
import { LayoutDashboard, Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useUser } from '../context/useUser.js';
import { PATHS } from '../routes/paths.js';

const NotFound = () => {
    const { user } = useUser();

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
        <div className="min-h-screen bg-white flex items-center justify-center p-6 font-medium">
            <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full text-center space-y-12"
            >
                {/* 404 Visual */}
                <div className="relative inline-block">
                    <h1 className="text-[12rem] font-bold text-slate-50 leading-none select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-40 h-40 bg-indigo-50 rounded-[3rem] flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-100/50 rotate-12">
                            <Search className="w-20 h-20 -rotate-12" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight italic uppercase">Lost in <span className="text-indigo-600">Space.</span></h2>
                    <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to={getDashboardPath()}
                        className="btn btn-primary w-full sm:w-auto h-14 px-8 flex items-center justify-center gap-3 shadow-lg shadow-indigo-100"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Back to Dashboard
                    </Link>
                    <Link
                        to={PATHS.HOME}
                        className="btn btn-ghost w-full sm:w-auto h-14 px-8 flex items-center justify-center gap-3 text-slate-500 hover:text-indigo-600"
                    >
                        <Home className="w-5 h-5" />
                        Go to Home
                    </Link>
                </div>

                <div className="pt-8 border-t border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-[0.3em]">
                        Error Reference: RESOURCE_NOT_FOUND_404
                    </p>
                </div>
            </Motion.div>
        </div>
    );
};

export default NotFound;
