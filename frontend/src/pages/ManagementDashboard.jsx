import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import {
    getMissingRequests, getRatings,
    getPOSTransactions, getPOSReports,
    getOwnerVacancies, getAllOwnerApplicants
} from '../services/api.js';
import {
    Star, MessageCircle, AlertCircle, Users, Package,
    TrendingUp, ArrowUpRight, ChevronRight, Activity, Clock,
    Briefcase, CheckCircle2
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import StatCard from '../components/StatCard.jsx';
import Pagination from '../components/Pagination.jsx';
import { getValueColorClass, formatCurrency } from '../utils/formatters.js';
import { PATHS } from '../routes/paths.js';
import {
    Chart as ChartJS,
    registerables
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(...registerables);

const ManagementDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isOwner = user?.role === 'OWNER';

    const [stats, setStats] = useState({
        missingCount: 0,
        avgRating: 0,
        totalRatings: 0,
        revenue: 0,
        profit: 0,
        units: 0,
        avgSale: 0,
        alerts: 0,
        activeVacancies: 0,
        totalApplicants: 0
    });
    const [ratingsList, setRatingsList] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [recruitmentData, setRecruitmentData] = useState({ labels: [], data: [] });
    const [ratingFilter, setRatingFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);

    // Pagination for Technical Logs
    const [currentPageLog, setCurrentPageLog] = useState(1);
    const itemsPerPageLog = 10;

    const fetchDashboardData = useCallback(async () => {
        const ownerId = user?.ownerId || user?.memberOfId;
        if (!ownerId) return;

        try {
            setLoading(true);
            const [missingData, ratingsData, tRes, sRes, tpRes, saRes, vRes, aRes] = await Promise.all([
                getMissingRequests(ownerId),
                getRatings(ownerId),
                getPOSTransactions({ limit: 50 }),
                getPOSReports('sales', { period: period === 7 ? 'daily' : 'daily' }), // getPOSReports doesn't seem to differentiate yet, but we'll filter locally if needed. 
                // Actually getSalesAnalytics for owner already returns 30 days.
                getPOSReports('top-products', { limit: 5 }),
                getPOSReports('stock-alerts', { limit: 10 }),
                getOwnerVacancies(),
                getAllOwnerApplicants()
            ]);

            // Owner Stats
            const missingList = missingData.requests || [];
            const rList = ratingsData.ratings || [];
            const avg = rList.length > 0
                ? (rList.reduce((acc, r) => acc + r.score, 0) / rList.length).toFixed(1)
                : 0;

            // Contributor Stats
            let revenue = 0;
            let profit = 0;
            let avgSale = 0;
            if (sRes.status === 'success') {
                const data = sRes.data || [];
                setSalesData(data);
                revenue = data.reduce((acc, d) => acc + d.total, 0);
                profit = data.reduce((acc, d) => acc + (d.profit || 0), 0);
                avgSale = data.length ? Math.round(revenue / data.length) : 0;
            }

            if (tRes.status === 'success') setRecentTransactions(tRes.data || []);
            if (tpRes.status === 'success') setTopProducts(tpRes.data || []);

            // Recruitment Data
            const vacs = vRes.status === 'success' ? vRes.vacancies : [];
            const apps = aRes.status === 'success' ? aRes.applicants : [];

            setRecruitmentData({
                labels: vacs.map(v => v.title.length > 15 ? v.title.substring(0, 12) + '...' : v.title),
                data: vacs.map(v => v._count?.applications || 0)
            });

            setStats({
                missingCount: missingList.length,
                avgRating: avg,
                totalRatings: rList.length,
                revenue,
                profit,
                units: tRes.totalCount || tRes.data?.length || 0,
                avgSale,
                alerts: saRes.data?.length || 0,
                activeVacancies: vacs.length,
                totalApplicants: apps.length
            });

            setRatingsList(rList);
        } catch (err) {
            console.error('Failed to fetch management dashboard data:', err);
        } finally {
            setLoading(false);
        }
    }, [user, period]);

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
        },
        onClick: (event, elements) => {
            if (!elements.length) return;
            const index = elements[0].index;
            const dataPoint = salesData[index];
            if (dataPoint && dataPoint.date) {
                const date = dataPoint.date;
                const path = isOwner ? PATHS.OWNER_TRANSACTIONS : PATHS.STAFF_TRANSACTIONS;
                navigate(`${path}?startDate=${date}&endDate=${date}`);
            }
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
                    value={formatCurrency(stats.revenue)}
                    icon={TrendingUp}
                    color={isOwner ? "bg-indigo-600" : "bg-emerald-500"}
                    delay={0.05}
                    valueClass={getValueColorClass(stats.revenue)}
                />
                <StatCard
                    title="Net Profit"
                    value={formatCurrency(stats.profit)}
                    icon={Activity}
                    color="bg-emerald-500"
                    delay={0.08}
                    valueClass={getValueColorClass(stats.profit)}
                />
                <StatCard
                    title="Missing Requests"
                    value={stats.missingCount}
                    icon={AlertCircle}
                    color="bg-rose-500"
                    delay={0.1}
                    trend={stats.missingCount > 0 ? "down" : "neutral"}
                />
                <StatCard
                    title="Average Rating"
                    value={`${stats.avgRating}/5`}
                    icon={Star}
                    color="bg-amber-500"
                    delay={0.15}
                    trend={stats.avgRating > 0 ? "up" : "neutral"}
                />
                <StatCard
                    title="Active Openings"
                    value={stats.activeVacancies}
                    icon={Briefcase}
                    color="bg-slate-900"
                    delay={0.2}
                    trend={stats.activeVacancies > 0 ? "up" : "neutral"}
                />
            </div>

            {/* Charts & Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Revenue Intelligence */}
                <div className="lg:col-span-12 xl:col-span-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financial Intel<span className="text-indigo-600">.</span></h2>
                            <p className="text-sm font-normal text-slate-400 mt-1">Growth performance over the last {period} days</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                                <button
                                    onClick={() => setPeriod(7)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${period === 7 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    7 days
                                </button>
                                <button
                                    onClick={() => setPeriod(30)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${period === 30 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    30 days
                                </button>
                            </div>
                            <Link to={isOwner ? PATHS.OWNER_REPORTS : PATHS.CONTRIBUTOR_REPORTS} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <ArrowUpRight size={18} className={isOwner ? "text-indigo-500" : "text-emerald-500"} />
                            </Link>
                        </div>
                    </div>
                    <div className="flex-1 p-6 h-[300px]">
                        <Line
                            options={{
                                ...chartOptions,
                                plugins: {
                                    ...chartOptions.plugins,
                                    tooltip: {
                                        ...chartOptions.plugins.tooltip,
                                        backgroundColor: '#111827',
                                        titleColor: '#fff',
                                        bodyColor: '#D1D5DB',
                                        cornerRadius: 8,
                                        padding: 12
                                    }
                                },
                                scales: {
                                    ...chartOptions.scales,
                                    x: {
                                        display: true,
                                        grid: { display: false },
                                        ticks: {
                                            color: '#94a3b8',
                                            autoSkip: true,
                                            maxRotation: 0,
                                            font: { family: 'Inter', size: 10 }
                                        }
                                    },
                                    y: {
                                        ...chartOptions.scales.y,
                                        grid: { color: '#F3F4F6', strokeDash: [4, 4] },
                                        ticks: {
                                            ...chartOptions.scales.y.ticks,
                                            font: { family: 'Inter', size: 10 }
                                        }
                                    }
                                }
                            }}
                            data={{
                                labels: salesData.slice(-period).map(d => {
                                    const date = new Date(d.date);
                                    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                                }),
                                datasets: [{
                                    label: 'Revenue',
                                    data: salesData.slice(-period).map(d => d.total),
                                    fill: true,
                                    backgroundColor: isOwner ? 'rgba(79, 70, 229, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    borderColor: isOwner ? '#4f46e5' : '#10b981',
                                    borderWidth: 3,
                                    pointRadius: period === 30 ? 2 : 4,
                                    pointHoverRadius: 6,
                                    tension: 0.4
                                }]
                            }}
                        />
                    </div>
                </div>

                {/* Top Products */}
                <div className="lg:col-span-12 xl:col-span-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col">
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

            {/* Recruitment Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                            <span className="w-6 h-[2px] bg-rose-500 rounded-full"></span>
                            Urgent Alerts
                        </h4>
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[9px] font-bold rounded-md">{stats.alerts} Alerts</span>
                    </div>
                    <div className="space-y-4 flex-1">
                        {stats.alerts > 0 ? (
                            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-start gap-3">
                                <Package size={16} className="text-rose-500 mt-1 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-900 italic uppercase">Refill Required</p>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-medium">Multiple high-velocity items are hitting critical low thresholds.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                <CheckCircle2 size={24} className="text-slate-200 mx-auto mb-3" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">All systems clear. Stock levels nominal.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight italic">Talent Pipelines.</h2>
                            <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mt-1">Applicant distribution across deployed vacancies</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-900 num-montserrat">{stats.totalApplicants}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Talent</p>
                            </div>
                            <Link to={PATHS.OWNER_VACANCIES} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <ArrowUpRight size={18} className="text-indigo-500" />
                            </Link>
                        </div>
                    </div>
                    <div className="flex-1 p-6 h-[300px]">
                        <Bar
                            options={{
                                ...chartOptions,
                                scales: {
                                    ...chartOptions.scales,
                                    x: {
                                        display: true,
                                        grid: { display: false },
                                        ticks: {
                                            color: '#94a3b8',
                                            autoSkip: false,
                                            font: { family: 'Outfit', size: 9, weight: '600' }
                                        }
                                    }
                                }
                            }}
                            data={{
                                labels: recruitmentData.labels,
                                datasets: [{
                                    label: 'Applicants',
                                    data: recruitmentData.data,
                                    backgroundColor: 'rgba(79, 70, 229, 0.8)',
                                    borderRadius: 8,
                                    barThickness: 32,
                                }]
                            }}
                        />
                    </div>
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
                                    <th className="pl-8 pr-4 py-4 font-medium w-12 text-center">#</th>
                                    <th className="px-4 py-4 font-medium">Entity</th>
                                    <th className="px-8 py-4 font-medium">Time</th>
                                    <th className="px-8 py-4 font-medium text-right">Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentTransactions
                                    .slice((currentPageLog - 1) * itemsPerPageLog, currentPageLog * itemsPerPageLog)
                                    .map((txn, i) => {
                                        const absIndex = (currentPageLog - 1) * itemsPerPageLog + i + 1;
                                        return (
                                            <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="pl-8 pr-4 py-4 text-[10px] font-bold text-slate-300 text-center w-12">{absIndex}</td>
                                                <td className="px-4 py-4 flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-500">
                                                        {txn.member?.name?.[0] || 'G'}
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-800 uppercase italic tracking-tight truncate max-w-[120px]">{txn.member?.name || 'Guest'}</span>
                                                </td>
                                                <td className="px-8 py-4 text-[10px] font-medium text-slate-400 uppercase tracking-widest">{new Date(txn.createdAt).toLocaleDateString()}</td>
                                                <td className={`px-8 py-4 text-xs font-semibold ${isOwner ? 'text-indigo-500' : 'text-emerald-500'} text-right`}>Rp {txn.total.toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                    {recentTransactions.length > itemsPerPageLog && (
                        <div className="px-8 py-4 border-t border-slate-50 bg-slate-50/30">
                            <Pagination
                                currentPage={currentPageLog}
                                totalPages={Math.ceil(recentTransactions.length / itemsPerPageLog)}
                                onPageChange={setCurrentPageLog}
                            />
                        </div>
                    )}
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
