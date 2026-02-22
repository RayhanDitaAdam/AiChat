import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import {
    getMissingRequests, getRatings,
    getPOSTransactions, getPOSReports
} from '../services/api.js';
import {
    Star, MessageCircle, AlertCircle, Users, Package,
    TrendingUp, ArrowUpRight, ChevronRight, Activity, Clock
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import StatCard from '../components/StatCard.jsx';
import { PATHS } from '../routes/paths.js';
import {
    Chart as ChartJS,
    registerables
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(...registerables);

const ManagementDashboard = () => {
    const { user } = useAuth();
    const isOwner = user?.role === 'OWNER';

    const [stats, setStats] = useState({
        missingCount: 0,
        avgRating: 0,
        totalRatings: 0,
        revenue: 0,
        units: 0,
        avgSale: 0,
        alerts: 0
    });
    const [ratingsList, setRatingsList] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [ratingFilter, setRatingFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        const ownerId = user?.ownerId || user?.memberOfId;
        if (!ownerId) return;

        try {
            setLoading(true);
            const [missingData, ratingsData, tRes, sRes, tpRes, saRes] = await Promise.all([
                getMissingRequests(ownerId),
                getRatings(ownerId),
                getPOSTransactions({ limit: 5 }),
                getPOSReports('sales', { period: 'daily' }),
                getPOSReports('top-products', { limit: 5 }),
                getPOSReports('stock-alerts', { limit: 10 })
            ]);

            // Owner Stats
            const missingList = missingData.requests || [];
            const rList = ratingsData.ratings || [];
            const avg = rList.length > 0
                ? (rList.reduce((acc, r) => acc + r.score, 0) / rList.length).toFixed(1)
                : 0;

            // Contributor Stats
            let revenue = 0;
            let avgSale = 0;
            if (sRes.status === 'success') {
                const data = sRes.data || [];
                setSalesData(data);
                revenue = data.reduce((acc, d) => acc + d.total, 0);
                avgSale = data.length ? Math.round(revenue / data.length) : 0;
            }

            if (tRes.status === 'success') setRecentTransactions(tRes.data || []);
            if (tpRes.status === 'success') setTopProducts(tpRes.data || []);

            setStats({
                missingCount: missingList.length,
                avgRating: avg,
                totalRatings: rList.length,
                revenue,
                units: tRes.totalCount || tRes.data?.length || 0,
                avgSale,
                alerts: saRes.data?.length || 0
            });

            setRatingsList(rList);
        } catch (err) {
            console.error('Failed to fetch management dashboard data:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#1e293b',
                bodyColor: '#1e293b',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                boxPadding: 4,
                callbacks: {
                    label: (context) => `Rp ${context.parsed.y.toLocaleString()}`
                }
            }
        },
        scales: {
            x: { display: false },
            y: {
                grid: { color: '#f1f5f9', borderDash: [4, 4], drawBorder: false },
                ticks: {
                    color: '#94a3b8',
                    font: { family: 'Outfit', size: 10, weight: '600' },
                    callback: (val) => {
                        if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}k`;
                        return `Rp ${val}`;
                    }
                },
                beginAtZero: true
            }
        },
        elements: {
            line: { tension: 0.4, borderWidth: 4, borderColor: isOwner ? '#4f46e5' : '#10b981' },
            point: { radius: 2, hoverRadius: 6, hoverBorderWidth: 4, hoverBackgroundColor: '#ffffff', hoverBorderColor: isOwner ? '#4f46e5' : '#10b981' }
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-[#f9f9f9]/50">
                <div className="flex flex-col items-center gap-4">
                    <div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${isOwner ? 'border-indigo-600' : 'border-emerald-600'}`}></div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Gathering intelligence...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full p-4 lg:p-8 bg-[#f9f9f9]/50 space-y-8">
            <header className="space-y-1">
                <div className="flex items-center gap-3 mb-2">
                    <Motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`px-4 py-1.5 ${isOwner ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'} text-[10px] font-semibold uppercase tracking-[0.2em] rounded-full border`}
                    >
                        Management Center
                    </Motion.span>
                </div>
                <Motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-slate-900 tracking-tight"
                >
                    {user?.owner?.name || user?.memberOf?.name || 'Authorized'}<span className={isOwner ? 'text-indigo-600' : 'text-emerald-600'}>.</span>
                </Motion.h1>
                <p className="text-slate-500 font-medium">
                    Welcome back, {user?.name}. System operational status is <span className="text-emerald-500 font-bold uppercase">nominal</span>.
                </p>
            </header>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Live Revenue"
                    value={`Rp ${stats.revenue.toLocaleString()}`}
                    icon={TrendingUp}
                    color={isOwner ? "bg-indigo-600" : "bg-emerald-500"}
                    delay={0.05}
                />
                <StatCard
                    title="Missing Requests"
                    value={stats.missingCount}
                    icon={AlertCircle}
                    color="bg-rose-500"
                    delay={0.1}
                />
                <StatCard
                    title="Average Rating"
                    value={`${stats.avgRating}/5`}
                    icon={Star}
                    color="bg-amber-500"
                    delay={0.15}
                />
                <StatCard
                    title="Stock Alerts"
                    value={stats.alerts}
                    icon={Package}
                    color="bg-slate-900"
                    delay={0.2}
                />
            </div>

            {/* Charts & Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Revenue Intelligence */}
                <div className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic">Financial Intel.</h2>
                            <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mt-1">Growth performance by technical session (Last 30 days)</p>
                        </div>
                        <Link to={isOwner ? PATHS.OWNER_REPORTS : PATHS.CONTRIBUTOR_REPORTS} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                            <ArrowUpRight size={18} className={isOwner ? "text-indigo-500" : "text-emerald-500"} />
                        </Link>
                    </div>
                    <div className="flex-1 p-6 h-[300px]">
                        <Line
                            options={{
                                ...chartOptions,
                                scales: {
                                    ...chartOptions.scales,
                                    x: {
                                        display: true,
                                        grid: { display: false },
                                        ticks: {
                                            color: '#94a3b8',
                                            autoSkip: true,
                                            maxRotation: 0,
                                            font: { family: 'Outfit', size: 9, weight: '600' }
                                        }
                                    }
                                }
                            }}
                            data={{
                                labels: salesData.map(d => {
                                    const date = new Date(d.date);
                                    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
                                }),
                                datasets: [{
                                    label: 'Revenue',
                                    data: salesData.map(d => d.total),
                                    fill: true,
                                    backgroundColor: isOwner ? 'rgba(79, 70, 229, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    borderColor: isOwner ? '#4f46e5' : '#10b981',
                                }]
                            }}
                        />
                    </div>
                </div>

                {/* Top Products */}
                <div className="lg:col-span-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 mb-8">
                        <span className={`w-6 h-[2px] ${isOwner ? 'bg-indigo-500' : 'bg-emerald-500'} rounded-full`}></span>
                        High Velocity
                    </h4>
                    <div className="space-y-5 flex-1 overflow-y-auto scrollbar-hide">
                        {topProducts.map((p, i) => (
                            <div key={i} className="flex items-center gap-4 group p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white transition-all cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-300 shadow-sm group-hover:scale-110 transition-transform">
                                    <Package size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-slate-900 truncate uppercase italic tracking-tight">{p.name}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className={`text-[10px] font-semibold ${isOwner ? 'text-indigo-500' : 'text-emerald-500'} uppercase tracking-widest`}>
                                            {p.salesCount} Sold
                                        </span>
                                        <ChevronRight size={12} className="text-slate-300" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link to={isOwner ? PATHS.OWNER_PRODUCTS : PATHS.CONTRIBUTOR_PRODUCTS} className={`mt-8 text-center text-[9px] font-semibold ${isOwner ? 'text-indigo-500' : 'text-emerald-500'} uppercase tracking-[0.3em] hover:underline cursor-pointer`}>
                        Full Analysis
                    </Link>
                </div>
            </div>

            {/* Bottom: Logs & Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
                {/* Operational Logs */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                    <header className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between text-slate-900 font-semibold text-xs uppercase tracking-widest italic">
                        Technical Logs
                        <Link to={isOwner ? PATHS.OWNER_REPORTS : PATHS.CONTRIBUTOR_REPORTS} className={`text-[10px] font-semibold ${isOwner ? 'text-indigo-500' : 'text-emerald-500'} hover:underline`}>Audit</Link>
                    </header>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-500 font-medium tracking-widest">
                                <tr>
                                    <th className="px-8 py-4 font-medium">Entity</th>
                                    <th className="px-8 py-4 font-medium">Time</th>
                                    <th className="px-8 py-4 font-medium text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentTransactions.map((txn, i) => (
                                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-8 py-4 flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-500">
                                                {txn.member?.name?.[0] || 'G'}
                                            </div>
                                            <span className="text-xs font-semibold text-slate-800 uppercase italic tracking-tight truncate max-w-[120px]">{txn.member?.name || 'Guest'}</span>
                                        </td>
                                        <td className="px-8 py-4 text-[10px] font-medium text-slate-400 uppercase tracking-widest">{new Date(txn.createdAt).toLocaleDateString()}</td>
                                        <td className={`px-8 py-4 text-xs font-semibold ${isOwner ? 'text-indigo-500' : 'text-emerald-500'} text-right`}>Rp {txn.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Audience Intelligence (Feedback) */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Audience Sentiment</h3>
                        </div>
                        <div className="flex gap-1">
                            {['all', 5, 4, 3].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setRatingFilter(f)}
                                    className={`px-3 py-1 text-[9px] font-semibold rounded-lg uppercase tracking-widest transition-all ${ratingFilter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    {f === 'all' ? 'All' : `${f}*`}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
                        {ratingsList
                            .filter(r => ratingFilter === 'all' || r.score === ratingFilter)
                            .slice(0, 4)
                            .map((rating) => (
                                <div key={rating.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-2.5 h-2.5 ${i < rating.score ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-[9px] font-medium text-slate-300 uppercase">{new Date().toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-600 leading-relaxed truncate">"{rating.feedback || 'Signal captured with no content.'}"</p>
                                </div>
                            ))}
                        {ratingsList.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/30 rounded-3xl border border-dashed border-slate-200">
                                <MessageCircle className="w-8 h-8 text-slate-200 mb-2" />
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">No sentiment logs</p>
                            </div>
                        )}
                    </div>
                    <Link to={PATHS.OWNER_CHATS} className={`mt-8 text-center text-[9px] font-semibold ${isOwner ? 'text-indigo-500' : 'text-emerald-500'} uppercase tracking-[0.3em] hover:underline cursor-pointer`}>
                        Review Comms
                    </Link>
                </div>
            </div>
        </div >
    );
};

export default ManagementDashboard;
