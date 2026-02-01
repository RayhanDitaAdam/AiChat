import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
        <div className="space-y-12">
            <header className="space-y-1">
                <Motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black text-slate-900 tracking-tight"
                >
                    {user?.owner?.name || 'Intelligence Hub'}<span className="text-indigo-600">.</span>
                </Motion.h1>
                <p className="text-slate-500 font-medium">Welcome back, {user?.name}. Here's your business at a glance.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Missing Requests"
                    value={stats.missingCount}
                    icon={AlertCircle}
                    color="bg-rose-500"
                    delay={0.05}
                />
                <StatCard
                    title="Average Rating"
                    value={`${stats.avgRating}/5`}
                    icon={Star}
                    color="bg-amber-500"
                    delay={0.1}
                />
                <StatCard
                    title="Total Feedback"
                    value={stats.totalRatings}
                    icon={MessageCircle}
                    color="bg-indigo-600"
                    delay={0.15}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border border-slate-100 rounded-[2rem] p-10 flex flex-col justify-between min-h-[340px] relative overflow-hidden group shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all"
                >
                    <div className="absolute top-[-40px] right-[-40px] opacity-[0.03] transition-transform duration-700 group-hover:translate-x-4 text-slate-800">
                        <TrendingUp className="w-80 h-80" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                            <TrendingUp className="w-7 h-7 text-slate-800" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 leading-tight">Inventory <br /> Dashboard</h2>
                        <p className="text-slate-500 font-medium max-w-xs leading-relaxed">Optimize your stocks and promotional pricing based on real-time data.</p>
                    </div>
                    <Link to="/owner/products" className="relative z-10 bg-black text-white px-8 py-3.5 rounded-xl font-bold text-sm w-fit hover:bg-slate-800 transition-all text-center">
                        Manage Inventory
                    </Link>
                </Motion.div>

                <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-[#171717] rounded-[2rem] p-10 flex flex-col justify-between min-h-[340px] relative overflow-hidden group shadow-xl transition-all"
                >
                    <div className="absolute top-[-40px] right-[-40px] opacity-10 transition-transform duration-700 group-hover:-translate-x-4 text-white">
                        <Users className="w-80 h-80" />
                    </div>
                    <div className="relative z-10 space-y-4">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-white leading-tight">Audience <br /> Insights</h2>
                        <p className="text-slate-400 font-medium max-w-xs leading-relaxed">Understand customer behavior and missed opportunities from AI audits.</p>
                    </div>
                    <Link to="/owner/chats" className="relative z-10 bg-white text-black px-8 py-3.5 rounded-xl font-bold text-sm w-fit hover:bg-slate-100 transition-colors text-center">
                        Review AI Logs
                    </Link>
                </Motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
