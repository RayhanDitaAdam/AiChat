import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { getMissingRequests, getRatings } from '../../services/api.js';
import { Star, MessageCircle, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import StatCard from '../../components/StatCard.jsx';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        missingCount: 0,
        avgRating: 0,
        totalRatings: 0
    });

    const fetchStats = useCallback(async () => {
        const ownerId = user?.ownerId;
        if (!ownerId) return;

        try {
            const [missing, ratings] = await Promise.all([
                getMissingRequests(ownerId),
                getRatings(ownerId)
            ]);

            const missingList = missing.requests || [];
            const ratingsList = ratings.ratings || [];

            const avg = ratingsList.length > 0
                ? (ratingsList.reduce((acc, r) => acc + r.score, 0) / ratingsList.length).toFixed(1)
                : 0;

            setStats({
                missingCount: missingList.length,
                avgRating: avg,
                totalRatings: ratingsList.length
            });
        } catch (err) {
            console.error('Failed to fetch dashboard stats:', err);
        }
    }, [user]);

    useEffect(() => {
        let isCancelled = false;
        const loadStats = async () => {
            if (!isCancelled) await fetchStats();
        };
        loadStats();
        return () => { isCancelled = true; };
    }, [fetchStats]);

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12 mb-20">
                <header className="space-y-1">
                    <Motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-black text-slate-900 tracking-tight"
                    >
                        Intelligence Hub <span className="text-indigo-600">.</span>
                    </Motion.h1>
                    <p className="text-slate-500 font-bold text-lg">Welcome back, {user?.name}. Here's your business at a glance.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard
                        title="Missing Requests"
                        value={stats.missingCount}
                        icon={AlertCircle}
                        color="bg-rose-500 shadow-sm"
                        delay={0.05}
                    />
                    <StatCard
                        title="Average Rating"
                        value={`${stats.avgRating}/5`}
                        icon={Star}
                        color="bg-amber-500 shadow-sm"
                        delay={0.1}
                    />
                    <StatCard
                        title="Total Feedback"
                        value={stats.totalRatings}
                        icon={MessageCircle}
                        color="bg-indigo-600 shadow-sm"
                        delay={0.15}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <Motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white border border-slate-100 rounded-[2.5rem] p-10 flex flex-col justify-between min-h-[340px] relative overflow-hidden group shadow-sm hover:border-indigo-100 transition-colors"
                    >
                        <div className="absolute top-[-40px] right-[-40px] opacity-[0.03] transition-transform duration-700 group-hover:translate-x-4">
                            <TrendingUp className="w-80 h-80 text-indigo-600" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                                <TrendingUp className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 leading-tight">Catalog <br /> Intelligence</h2>
                            <p className="text-slate-500 font-bold max-w-xs leading-relaxed">Optimize your stocks and promotional pricing based on real-time data.</p>
                        </div>
                        <Link to="/owner/products" className="relative z-10 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm w-fit shadow-sm hover:bg-indigo-700 transition-all text-center">
                            Manage Inventory
                        </Link>
                    </Motion.div>

                    <Motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col justify-between min-h-[340px] relative overflow-hidden group shadow-sm"
                    >
                        <div className="absolute top-[-40px] right-[-40px] opacity-10 transition-transform duration-700 group-hover:-translate-x-4">
                            <Users className="w-80 h-80 text-white" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-white leading-tight">Audience <br /> Insights</h2>
                            <p className="text-slate-400 font-bold max-w-xs leading-relaxed">Understand customer behavior and missed opportunities from AI audits.</p>
                        </div>
                        <Link to="/owner/chats" className="relative z-10 bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm w-fit hover:bg-slate-50 transition-colors text-center">
                            Review AI Logs
                        </Link>
                    </Motion.div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
