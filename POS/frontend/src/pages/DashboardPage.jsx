import React, { useState, useEffect } from 'react';
import { getTransactions, getMembers } from '../services/api';
import {
    DollarSign, ShoppingBag, Users, AlertCircle,
    TrendingUp, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const StatCard = (props) => {
    const { label, value, trend, icon: IconComponent } = props;
    return (
        <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
        >
            <header className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-foreground shadow-sm">
                    <IconComponent size={24} strokeWidth={1.5} />
                </div>
                {trend && (
                    <div className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </header>
            <section>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{label}</p>
                <h3 className="text-3xl font-black tracking-tighter">{value}</h3>
            </section>
        </Motion.div>
    );
};

const DashboardPage = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalTransactions: 0,
        totalMembers: 0,
        lowStockItems: 0,
        recentTransactions: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [transactionsRes, membersRes] = await Promise.all([
                    getTransactions(),
                    getMembers()
                ]);

                if (transactionsRes.status === 'success') {
                    const total = transactionsRes.data.reduce((acc, curr) => acc + curr.total, 0);
                    setStats(prev => ({
                        ...prev,
                        totalRevenue: total,
                        totalTransactions: transactionsRes.data.length,
                        recentTransactions: transactionsRes.data.slice(0, 5)
                    }));
                }
                if (membersRes.status === 'success') {
                    setStats(prev => ({ ...prev, totalMembers: membersRes.data.length }));
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Revenue"
                    value={`Rp ${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    trend={12}
                />
                <StatCard
                    label="Sales Count"
                    value={stats.totalTransactions}
                    icon={ShoppingBag}
                    trend={5}
                />
                <StatCard
                    label="Total Members"
                    value={stats.totalMembers}
                    icon={Users}
                    trend={8}
                />
                <StatCard
                    label="Stock Alerts"
                    value={stats.lowStockItems}
                    icon={AlertCircle}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Transactions */}
                <div className="lg:col-span-2 card overflow-hidden">
                    <header className="flex items-center justify-between px-8 py-6 bg-muted/20 border-b">
                        <h2 className="text-xl font-black tracking-tighter">Recent Sales</h2>
                        <button className="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors">View All Activities</button>
                    </header>
                    <section className="px-0">
                        {stats.recentTransactions.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground text-[10px] uppercase font-black tracking-[0.3em] opacity-40">No transactions yet</div>
                        ) : stats.recentTransactions.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between px-8 py-6 transition-all duration-300 group hover:bg-foreground hover:text-background border-b border-border/50 last:border-0 cursor-pointer">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground transition-all duration-300 group-hover:bg-background group-hover:text-foreground shadow-sm">
                                        <ShoppingBag size={20} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm tracking-tight">#{tx.id.slice(-6).toUpperCase()}</p>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 transition-colors group-hover:text-background/60">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-base tracking-tighter">Rp {tx.total.toLocaleString()}</p>
                                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 transition-colors ${tx.paymentMethod === 'CASH' ? 'text-amber-600 group-hover:text-amber-400' : 'text-sky-600 group-hover:text-sky-300'}`}>
                                        {tx.paymentMethod}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>

                {/* System Activity */}
                <div className="card">
                    <header>
                        <h2 className="text-lg font-bold">Performance</h2>
                    </header>
                    <section className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground mb-3">
                                <span>Target Achievement</span>
                                <span>75%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <Motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '75%' }}
                                    className="h-full bg-foreground shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="bg-muted p-4 rounded border">
                            <TrendingUp className="w-6 h-6 mb-3 opacity-70" />
                            <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                                Peak sales period identified between <span className="text-foreground font-bold">12:00 - 14:00</span>. Consider allocating more staff members.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
