import React, { useState, useEffect } from 'react';
import { getAdminStats } from '../../services/api.js';
import { Users, Store, MessageCircle, Package, TrendingUp, Activity } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import StatCard from '../../components/StatCard.jsx';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        owners: 0,
        totalChats: 0,
        totalProducts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getAdminStats();
                if (res.status === 'success') {
                    setStats(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
    );

    return (
        <div className="space-y-12">
            <header className="space-y-1">
                <Motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black text-slate-900 tracking-tight"
                >
                    System Analytics<span className="text-sky-500">.</span>
                </Motion.h1>
                <p className="text-slate-500 font-medium">Global perspective on platform health and user activity.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users}
                    icon={Users}
                    color="bg-sky-500"
                    delay={0.05}
                />
                <StatCard
                    title="Registered Stores"
                    value={stats.owners}
                    icon={Store}
                    color="bg-indigo-500"
                    delay={0.1}
                />
                <StatCard
                    title="AI Conversations"
                    value={stats.totalChats}
                    icon={MessageCircle}
                    color="bg-emerald-500"
                    delay={0.15}
                />
                <StatCard
                    title="Product Catalog"
                    value={stats.totalProducts}
                    icon={Package}
                    color="bg-amber-500"
                    delay={0.2}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center">
                            <Activity className="w-6 h-6 text-sky-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Platform Growth</h2>
                    </div>
                    <p className="text-slate-500 leading-relaxed">
                        The platform is currently supporting <strong>{stats.owners} stores</strong> and <strong>{stats.users} users</strong>.
                        User engagement is high with over <strong>{stats.totalChats}</strong> messages processed by AI.
                    </p>
                    <div className="pt-4">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 w-[65%] rounded-full"></div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Active Stores Utilization: 65%</p>
                    </div>
                </Motion.div>

                <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#0f172a] p-8 rounded-[2rem] shadow-xl space-y-6 text-white"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-sky-400" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">System Status</h2>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                        All modules are operating normally. AI response latency is stable at ~1.2s.
                        Memory usage is within safe limits for the current load.
                    </p>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black tracking-widest">STABLE</span>
                        <span className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded-full text-[10px] font-black tracking-widest">ONLINE</span>
                    </div>
                </Motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
