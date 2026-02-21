import React, { useState, useEffect } from 'react';
import {
    FileText, Download, TrendingUp, AlertTriangle,
    Calendar, ArrowRight, Printer, RefreshCw, ChevronRight, Package, Search, Eye, Banknote
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import Pagination from '../../../components/Pagination.jsx';
import InvoiceDetail from '../../../components/InvoiceDetail.jsx';
import { getPOSTransactions, getPOSReports, getPOSSettings } from '../../../services/api.js';
import { useTranslation } from 'react-i18next';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    PointElement,
    LineElement,
    LineController,
    ArcElement,
    DoughnutController,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    PointElement,
    LineElement,
    LineController,
    ArcElement,
    DoughnutController,
    Title,
    Tooltip,
    Legend
);

const ReportsPage = () => {
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [compData, setCompData] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [stockAlerts, setStockAlerts] = useState([]);
    const [period, setPeriod] = useState('daily');
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        search: '',
        status: 'all'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [settings, setSettings] = useState(null);
    const itemsPerPage = 7;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = {
                    period,
                    startDate: filters.startDate,
                    endDate: filters.endDate
                };

                const [tRes, sRes, cRes, tpRes, saRes] = await Promise.all([
                    getPOSTransactions(params),
                    getPOSReports('sales', params),
                    getPOSReports('comprehensive', params),
                    getPOSReports('top-products', { limit: 5 }),
                    getPOSReports('stock-alerts', { limit: 10 })
                ]);

                if (tRes.status === 'success') {
                    setTransactions(tRes.data || []);
                }
                if (sRes.status === 'success') setSalesData(sRes.data || []);
                if (cRes.status === 'success') setCompData(cRes.data || null);
                if (tpRes.status === 'success') setTopProducts(tpRes.data || []);
                if (saRes.status === 'success') setStockAlerts(saRes.data || []);

                const settingsRes = await getPOSSettings();
                if (settingsRes.status === 'success') setSettings(settingsRes.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [period, filters.startDate, filters.endDate]);

    // Local filtering for audit log
    const filteredTransactions = transactions.filter(txn => {
        const query = filters.search.toLowerCase();
        const matchesSearch = (
            txn.id.toLowerCase().includes(query) ||
            (txn.member?.name || 'guest').toLowerCase().includes(query) ||
            txn.paymentMethod.toLowerCase().includes(query)
        );

        // Use real status from transaction if available
        const status = txn.status?.toLowerCase() || 'completed';
        const matchesStatus = filters.status === 'all' || status === filters.status.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const exportToExcel = () => {
        const data = transactions.map(txn => ({
            ID: txn.id,
            Date: new Date(txn.createdAt).toLocaleString(),
            Cashier: txn.cashier?.name,
            Member: txn.member?.name || 'Guest',
            Payment: txn.paymentMethod,
            Discount: txn.discount,
            Total: txn.total
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
        XLSX.writeFile(wb, `Sales_Report_${new Date().toLocaleDateString()}.xlsx`);
    };

    // Chart Configurations
    const mainChartOptions = {
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
            x: {
                grid: { display: false },
                ticks: {
                    color: '#94a3b8',
                    font: { family: 'Outfit', size: 10, weight: '700' }
                }
            },
            y: {
                grid: { color: '#f1f5f9', borderDash: [4, 4], drawBorder: false },
                ticks: {
                    color: '#94a3b8',
                    font: { family: 'Outfit', size: 10, weight: '700' },
                    callback: (val) => val.toLocaleString()
                }
            }
        }
    };

    const paymentChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { family: 'Outfit', size: 9, weight: '700' },
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#1e293b',
                bodyColor: '#1e293b',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12
            }
        },
        cutout: '70%',
    };

    const categoryChartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `Rp ${context.parsed.x.toLocaleString()}`
                }
            }
        },
        scales: {
            x: { display: false },
            y: {
                grid: { display: false },
                ticks: {
                    color: '#1e293b',
                    font: { family: 'Outfit', size: 10, weight: '700' }
                }
            }
        }
    };

    return (
        <div className="h-full bg-white flex flex-col font-normal overflow-hidden">
            <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 lg:p-10 bg-slate-50/30 overflow-hidden">
                {/* Left: Intelligence Dashboard */}
                <div className="flex-1 flex flex-col min-w-0 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
                                {t('reports.title')}
                            </h1>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mt-2">
                                {t('reports.subtitle')}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                                <Calendar size={14} className="text-slate-400" />
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                                    className="text-[11px] font-medium uppercase outline-none bg-transparent num-montserrat"
                                />
                                <ArrowRight size={12} className="text-slate-300" />
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                                    className="text-[11px] font-medium uppercase outline-none bg-transparent num-montserrat"
                                />
                            </div>
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
                            >
                                <option value="daily">{t('reports.daily_view')}</option>
                                <option value="monthly">{t('reports.monthly_view')}</option>
                            </select>
                            <button
                                onClick={exportToExcel}
                                className="h-11 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200/50 hover:bg-slate-800 transition-all active:scale-95"
                            >
                                <Download size={14} /> {t('reports.export_csv')}
                            </button>
                        </div>
                    </header>

                    {/* Summary Scorecards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {[
                            {
                                label: t('reports.stats.total_sales'),
                                val: `Rp ${(compData?.summary?.totalRevenue || 0).toLocaleString()}`,
                                delta: '+12.5%',
                                icon: TrendingUp,
                                color: 'bg-indigo-50 text-indigo-600',
                                deltaColor: 'text-emerald-500'
                            },
                            {
                                label: 'AVG TRANSACTION',
                                val: `Rp ${(compData?.summary?.avgOrderValue || 0).toLocaleString()}`,
                                delta: '+3.2%',
                                icon: RefreshCw,
                                color: 'bg-emerald-50 text-emerald-600',
                                deltaColor: 'text-emerald-500'
                            },
                            {
                                label: 'MEMBER LOYALTY',
                                val: `${(compData?.summary?.loyaltyRate || 0).toFixed(1)}%`,
                                delta: '-1.4%',
                                icon: Package,
                                color: 'bg-slate-100 text-slate-600',
                                deltaColor: 'text-rose-500'
                            },
                            {
                                label: t('reports.stats.alerts'),
                                val: stockAlerts.length,
                                delta: 'STABLE',
                                icon: AlertTriangle,
                                color: 'bg-rose-50 text-rose-600',
                                deltaColor: 'text-slate-400'
                            }
                        ].map((stat) => (
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <span className={`text-[10px] font-bold num-montserrat ${stat.deltaColor} bg-slate-50 px-2 py-1 rounded-lg`}>
                                        {stat.delta}
                                    </span>
                                </div>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-xl font-extrabold italic tracking-tighter text-slate-900 num-montserrat">{stat.val}</p>
                            </div>
                        ))}
                    </div>

                    {/* Revenue Delta Chart */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-sm font-extrabold uppercase italic tracking-tight text-slate-900">
                                    {t('reports.performance_delta')}
                                </h3>
                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
                                    {t('reports.revenue_audit')}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-600" />
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Revenue</span>
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <Bar
                                options={mainChartOptions}
                                data={{
                                    labels: salesData.map(d => d.date),
                                    datasets: [{
                                        label: 'Revenue',
                                        data: salesData.map(d => d.total),
                                        backgroundColor: '#4f46e5',
                                        borderRadius: 4,
                                        barPercentage: 0.5,
                                    }]
                                }}
                            />
                        </div>
                    </div>

                    {/* Transaction Audit Table */}
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                        <header className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-6">
                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <Banknote size={14} className="text-indigo-600" />
                                    {t('reports.audit_log')}
                                </p>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="SEARCH BY ID OR CUSTOMER..."
                                        value={filters.search}
                                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                                        className="h-10 pl-10 pr-6 bg-white border border-slate-200 rounded-xl text-[9px] font-medium uppercase tracking-widest focus:outline-none focus:border-indigo-500 w-72 shadow-sm transition-all placeholder:text-slate-300"
                                    />
                                </div>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                                    className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest focus:outline-none focus:border-indigo-500 shadow-sm transition-all cursor-pointer text-slate-500"
                                >
                                    <option value="all">ALL STATUS</option>
                                    <option value="completed">COMPLETED</option>
                                    <option value="pending">PENDING</option>
                                    <option value="failed">FAILED</option>
                                </select>
                                {(filters.search || filters.status !== 'all') && (
                                    <button
                                        onClick={() => setFilters({ ...filters, search: '', status: 'all' })}
                                        className="h-10 px-4 bg-rose-50 border border-rose-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-100 transition-all shadow-sm"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-slate-900/5 px-3 py-1.5 rounded-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest num-montserrat">
                                        {filteredTransactions.length} {t('reports.logs_count')}
                                    </span>
                                </div>
                                <button
                                    onClick={exportToExcel}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    <Download size={14} />
                                    Export
                                </button>
                            </div>
                        </header>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/30 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedTransactions.map(txn => (
                                        <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-4">
                                                <p className="text-[11px] font-bold text-indigo-600 num-montserrat">
                                                    #{txn._id?.substring(txn._id.length - 7).toUpperCase() || txn.id}
                                                </p>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-400 shrink-0">
                                                        {(txn.member?.name?.[0] || 'G')}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-semibold text-slate-900 uppercase italic tracking-tight truncate">{txn.member?.name || t('reports.guest')}</p>
                                                        <p className="text-[9px] font-medium text-slate-400 truncate">{txn.member?.email || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <p className="text-sm font-extrabold text-slate-900 tracking-tighter num-montserrat">
                                                    Rp {txn.total.toLocaleString()}
                                                </p>
                                            </td>
                                            <td className="px-8 py-4">
                                                <p className="text-[11px] font-medium text-slate-400 num-montserrat">
                                                    {new Date(txn.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </td>
                                            <td className="px-8 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm inline-block ${(txn.status || 'completed').toLowerCase() === 'completed'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        : (txn.status || '').toLowerCase() === 'pending'
                                                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                            : 'bg-rose-50 text-rose-600 border-rose-100'
                                                    }`}>
                                                    {txn.status || 'Completed'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-center">
                                                <button
                                                    onClick={() => setSelectedTransaction(txn)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 hover:bg-slate-900 hover:text-white rounded-lg transition-all text-slate-400 border border-slate-100 hover:border-slate-900 group-hover:text-slate-900 group-hover:bg-white"
                                                >
                                                    <Eye size={14} />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest">View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/30">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Insight Sidebar */}
                <div className="w-full lg:w-[400px] flex flex-col gap-6 overflow-y-auto custom-scrollbar shrink-0 pr-2">
                    {/* Payment Breakdown (Pie) */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <header className="mb-8">
                            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-3">
                                <span className="h-[2px] w-6 bg-indigo-600 rounded-full" />
                                PAYMENT METHODS
                            </h3>
                        </header>
                        <div className="h-56 w-full">
                            <Doughnut
                                options={paymentChartOptions}
                                data={{
                                    labels: compData?.payments?.map(p => p.method) || [],
                                    datasets: [{
                                        data: compData?.payments?.map(p => p.total) || [],
                                        backgroundColor: ['#4f46e5', '#1e293b', '#6366f1', '#94a3b8', '#cbd5e1'],
                                        borderWidth: 0,
                                    }]
                                }}
                            />
                        </div>
                    </div>

                    {/* Top Moving Items */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col h-[520px]">
                        <header className="mb-8 flex items-center justify-between">
                            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-3">
                                <span className="h-[2px] w-6 bg-emerald-500 rounded-full" />
                                {t('reports.velocity_insights')}
                            </h3>
                            <button className="text-[9px] font-semibold text-indigo-600 uppercase tracking-widest hover:underline">
                                View All
                            </button>
                        </header>
                        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                            {topProducts.map((p, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100 hover:border-slate-200 group">
                                    <div className="w-12 h-12 shrink-0 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                                        <Package className="text-slate-200" size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-[11px] font-semibold uppercase italic text-slate-900 truncate tracking-tight">{p.name}</p>
                                            <p className="text-[10px] font-extrabold text-indigo-600 num-montserrat">#{i + 1}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
                                                {p.category || 'General'}
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                            <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-tight">
                                                <span className="num-montserrat">{p.sales}</span> {t('reports.units_sold')}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Category Sales (Horizontal Bar) */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col">
                        <header className="mb-8">
                            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-3">
                                <span className="h-[2px] w-6 bg-slate-900 rounded-full" />
                                CATEGORY SALES
                            </h3>
                        </header>
                        <div className="h-56 w-full">
                            <Bar
                                options={categoryChartOptions}
                                data={{
                                    labels: compData?.categories?.map(c => c.category) || [],
                                    datasets: [{
                                        label: 'Revenue',
                                        data: compData?.categories?.map(c => c.revenue) || [],
                                        backgroundColor: '#1e293b',
                                        borderRadius: 4,
                                        barPercentage: 0.3,
                                    }]
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedTransaction && (
                    <InvoiceDetail
                        transaction={selectedTransaction}
                        settings={settings}
                        onClose={() => setSelectedTransaction(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReportsPage;
