import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, MessageSquareOff, Settings, Users, Activity, ExternalLink, MessageSquare } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { PATHS } from '../../routes/paths';
import { getAdminStats } from '../../services/api';
import { useTranslation } from 'react-i18next';

const AdminOverview = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        stores: { approved: 0, pending: 0, rejected: 0 },
        users: { total: 0, owners: 0, contributors: 0 },
        chatBots: { totalLimit: 0, totalPdfs: 0, totalTextUrls: 0 }
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getAdminStats();
                if (response.success && response.data) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch admin overview stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('nav.dashboard')}</h1>
                <p className="text-slate-500 mt-1">Overview of your platform's core modules.</p>
            </div>

            <Motion.div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Stores Management Box */}
                <Motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                                <Store className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 text-lg">{t('nav.stores')}</h2>
                                <p className="text-xs text-slate-500 font-medium">Manage & Approve</p>
                            </div>
                        </div>
                        <Link to={PATHS.ADMIN_STORES} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-indigo-600">
                            <ExternalLink className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center">
                        {isLoading ? (
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-slate-200 rounded w-full"></div>
                                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                    <p className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wider">Approved</p>
                                    <p className="text-2xl font-bold text-emerald-700">{stats.stores.approved}</p>
                                </div>
                                <div className="bg-amber-50 rounded-xl p-4 text-center">
                                    <p className="text-xs font-semibold text-amber-600 mb-1 uppercase tracking-wider">Pending</p>
                                    <p className="text-2xl font-bold text-amber-700">{stats.stores.pending}</p>
                                </div>
                            </div>
                        )}
                        <Link to={PATHS.ADMIN_STORES} className="mt-6 w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-center group">
                            Review Applications <span className="inline-block transition-transform group-hover:translate-x-1 ml-1">&rarr;</span>
                        </Link>
                    </div>
                </Motion.div>

                {/* Live Chat Configuration Box */}
                <Motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 text-lg">{t('nav.live_chat')}</h2>
                                <p className="text-xs text-slate-500 font-medium">Real-time Assistance</p>
                            </div>
                        </div>
                        <Link to={PATHS.ADMIN_LIVE_CHAT} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-sky-600">
                            <ExternalLink className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto text-sky-500">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <p className="text-sm text-slate-600">Configure connection settings, queue limits, and notification routing for the live support network.</p>
                        <Link to={PATHS.ADMIN_LIVE_CHAT} className="mt-4 w-full py-2.5 px-4 bg-sky-50 border border-transparent text-sky-700 font-medium text-sm rounded-xl hover:bg-sky-100 transition-all text-center">
                            Manage Chat Settings
                        </Link>
                    </div>
                </Motion.div>

                {/* Missing Requests Box */}
                <Motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                                <MessageSquareOff className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 text-lg">{t('nav.missing_requests')}</h2>
                                <p className="text-xs text-slate-500 font-medium">Unanswered Queries</p>
                            </div>
                        </div>
                        <Link to={PATHS.ADMIN_MISSING} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-rose-600">
                            <ExternalLink className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
                            <MessageSquareOff className="w-8 h-8" />
                        </div>
                        <p className="text-sm text-slate-600">Monitor and resolve prompts that the AI failed to answer or requires human intervention.</p>
                        <Link to={PATHS.ADMIN_MISSING} className="mt-4 w-full py-2.5 px-4 bg-rose-50 border border-transparent text-rose-700 font-medium text-sm rounded-xl hover:bg-rose-100 transition-all text-center">
                            View Missing Logs
                        </Link>
                    </div>
                </Motion.div>

                {/* System Stats / Config */}
                <Motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:col-span-2 xl:col-span-3">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center">
                                <Settings className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900 text-lg">{t('nav.system_config')}</h2>
                                <p className="text-xs text-slate-500 font-medium">Global AI & User Settings</p>
                            </div>
                        </div>
                        <Link to={PATHS.ADMIN_SYSTEM} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-800">
                            <ExternalLink className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="p-6 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* User Base */}
                            <div className="bg-white border text-center border-slate-200 p-5 rounded-xl">
                                <Users className="w-6 h-6 text-indigo-500 mb-3 mx-auto" />
                                <h3 className="font-bold text-slate-800 mb-1">User Base</h3>
                                <p className="text-sm text-slate-500 mb-4">Total accounts registered</p>
                                <div className="text-3xl font-bold text-slate-900">{isLoading ? '...' : stats.users.total}</div>
                            </div>

                            {/* Usage Limits */}
                            <div className="bg-white border text-center border-slate-200 p-5 rounded-xl">
                                <Activity className="w-6 h-6 text-emerald-500 mb-3 mx-auto" />
                                <h3 className="font-bold text-slate-800 mb-1">Global AI Quota</h3>
                                <p className="text-sm text-slate-500 mb-4">Current AI processing load</p>
                                <div className="text-3xl font-bold text-slate-900">{isLoading ? '...' : stats.chatBots.totalLimit}</div>
                            </div>

                            {/* Navigate CTA */}
                            <div className="flex flex-col justify-center items-center text-center p-4">
                                <p className="text-sm text-slate-600 mb-4">Need to adjust token limits, system variables, or clear cache?</p>
                                <Link to={PATHS.ADMIN_SYSTEM} className="w-full py-3 px-6 bg-slate-900 text-white font-medium text-sm rounded-xl hover:bg-slate-800 transition-all shadow-sm">
                                    Open System Config
                                </Link>
                            </div>
                        </div>
                    </div>
                </Motion.div>

            </Motion.div>
        </div>
    );
};

export default AdminOverview;
