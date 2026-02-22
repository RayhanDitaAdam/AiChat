import React, { useState, useEffect } from 'react';
import { getPOSTransactions, getPOSReports } from '../../services/api.js';
import {
    FileText, Download, TrendingUp, AlertTriangle,
    ArrowRight, Package, Search, ChevronRight
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import Pagination from '../../components/Pagination.jsx';
import { useTranslation } from 'react-i18next';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    Title,
    Tooltip,
    Legend
);

const ContributorReports = () => {
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [stockAlerts, setStockAlerts] = useState([]);
    const [dateRange] = useState({ start: '', end: '' });
    const [period, setPeriod] = useState('daily');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Backend will filter based on the logged-in contributor's ID
                const [tRes, sRes, tpRes, saRes] = await Promise.all([
                    getPOSTransactions(dateRange),
                    getPOSReports('sales', { period }),
                    getPOSReports('top-products', { limit: 10 }),
                    getPOSReports('stock-alerts', { limit: 10 })
                ]);

                if (tRes.status === 'success') {
                    setTransactions(tRes.data || []);
                    setCurrentPage(1);
                }
                if (sRes.status === 'success') setSalesData(sRes.data || []);
                if (tpRes.status === 'success') setTopProducts(tpRes.data || []);
                if (saRes.status === 'success') setStockAlerts(saRes.data || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [dateRange, period]);

    const filteredTransactions = transactions.filter(txn =>
        (txn.member?.name || 'Guest').toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const exportToExcel = () => {
        const data = transactions.map(txn => ({
            ID: txn.id,
            Date: new Date(txn.createdAt).toLocaleString(),
            Customer: txn.member?.name || 'Guest',
            Payment: txn.paymentMethod,
            Total: txn.total
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "My Contribution Report");
        XLSX.writeFile(wb, `Contributor_Sales_${new Date().toLocaleDateString()}.xlsx`);
    };

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

    return (
        <div className="min-h-full bg-white flex flex-col font-normal overflow-x-hidden">
            <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 lg:p-10 bg-slate-50/30 overflow-x-hidden">
                {/* Left: Intelligence Dashboard */}
                <div className="flex-1 flex flex-col min-w-0 space-y-6 min-h-0">
                    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">
                                Sales Audit
                            </h1>
                            <p className="text-[10px] font-normal text-emerald-600 uppercase tracking-[0.2em] mt-2">
                                CONTRIBUTOR PERSPECTIVE
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-medium uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all"
                            >
                                <option value="daily">{t('reports.daily_view')}</option>
                                <option value="monthly">{t('reports.monthly_view')}</option>
                            </select>
                            <button
                                onClick={exportToExcel}
                                className="h-11 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200/50 hover:bg-slate-800 transition-all active:scale-95"
                            >
                                <Download size={14} /> EXPORT XLS
                            </button>
                        </div>
                    </header>

                    {/* Summary Scorecards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {[
                            {
                                label: 'TOTAL CONTRIBUTION',
                                val: `Rp ${transactions.reduce((acc, txn) => acc + txn.total, 0).toLocaleString()}`,
                                delta: '+12.5%',
                                icon: TrendingUp,
                                color: 'bg-emerald-50 text-emerald-600',
                                deltaColor: 'text-emerald-500'
                            },
                            {
                                label: 'UNITS LINKED',
                                val: transactions.length,
                                delta: '+3.2%',
                                icon: Package,
                                color: 'bg-indigo-50 text-indigo-600',
                                deltaColor: 'text-emerald-500'
                            },
                            {
                                label: 'AVG SALE',
                                val: `Rp ${transactions.length ? (transactions.reduce((acc, t) => acc + t.total, 0) / transactions.length).toLocaleString() : 0}`,
                                delta: 'STABLE',
                                icon: FileText,
                                color: 'bg-slate-100 text-slate-600',
                                deltaColor: 'text-slate-400'
                            },
                            {
                                label: 'STOCK ALERTS',
                                val: stockAlerts.length,
                                delta: 'STABLE',
                                icon: AlertTriangle,
                                color: 'bg-rose-50 text-rose-600',
                                deltaColor: 'text-slate-400'
                            }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <span className={`text-[10px] font-medium num-montserrat ${stat.deltaColor} bg-slate-50 px-2 py-1 rounded-lg`}>
                                        {stat.delta}
                                    </span>
                                </div>
                                <p className="text-[10px] font-normal text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-xl font-bold tracking-tighter text-slate-900 num-montserrat">{stat.val}</p>
                            </div>
                        ))}
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                                    Velocity Delta
                                </h3>
                                <p className="text-[9px] font-normal text-slate-500 uppercase tracking-widest mt-1">
                                    REVENUE PERFORMANCE BY {period.toUpperCase()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Revenue</span>
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <Bar
                                options={chartOptions}
                                data={{
                                    labels: salesData.map(d => d.date),
                                    datasets: [{
                                        label: 'Revenue',
                                        data: salesData.map(d => d.total),
                                        backgroundColor: '#059669',
                                        borderRadius: 4,
                                        barPercentage: 0.5,
                                    }]
                                }}
                            />
                        </div>
                    </div>

                    {/* Transaction Audit Table */}
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                        <header className="px-4 sm:px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
                            <div className="flex flex-wrap items-center gap-3 sm:gap-6 min-w-0">
                                <p className="text-[11px] font-semibold text-slate-900 uppercase tracking-widest italic">
                                    Sales Log
                                </p>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="SEARCH TRANSACTIONS..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-10 pl-10 pr-6 bg-white border border-slate-200 rounded-xl text-[9px] font-bold uppercase tracking-widest focus:outline-none focus:border-emerald-500 w-full min-w-0 sm:w-64 shadow-sm transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-900/5 px-3 py-1.5 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest num-montserrat">
                                    {filteredTransactions.length} RECORDS
                                </span>
                            </div>
                        </header>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/30 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-4 text-[9px] font-medium text-slate-500 uppercase tracking-widest">Epoch</th>
                                        <th className="px-8 py-4 text-[9px] font-medium text-slate-500 uppercase tracking-widest">Entity</th>
                                        <th className="px-8 py-4 text-[9px] font-medium text-slate-500 uppercase tracking-widest">Method</th>
                                        <th className="px-8 py-4 text-[9px] font-medium text-slate-500 uppercase tracking-widest text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedTransactions.map(txn => (
                                        <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-4">
                                                <p className="text-[11px] font-bold text-slate-400 num-montserrat group-hover:text-slate-600 transition-colors">
                                                    {new Date(txn.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-400">
                                                        {(txn.member?.name?.[0] || 'G')}
                                                    </div>
                                                    <p className="text-[11px] font-semibold text-slate-900 uppercase italic tracking-tight">{txn.member?.name || 'GUEST USER'}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-semibold uppercase tracking-widest text-slate-500 shadow-sm group-hover:text-emerald-600 transition-colors">
                                                    {txn.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <p className="text-sm font-semibold text-emerald-600 tracking-tighter num-montserrat">
                                                    Rp {txn.total.toLocaleString()}
                                                </p>
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
                <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0 min-w-0">
                    {/* Top Moving Items */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col min-h-[400px]">
                        <header className="mb-8 flex items-center justify-between">
                            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-3">
                                <span className="h-[2px] w-6 bg-emerald-500 rounded-full" />
                                Velocity
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
                                            <p className="text-[10px] font-semibold text-indigo-600 num-montserrat">#{i + 1}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                {p.category || 'General'}
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                                            <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-tight">
                                                <span className="num-montserrat">{p.salesCount}</span> Units
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stock Warnings */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-3 mb-8">
                            <span className="h-[2px] w-6 bg-rose-500 rounded-full" />
                            CRITICALS
                        </h3>
                        <div className="space-y-4">
                            {stockAlerts.map((p, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-rose-50/20 rounded-2xl border border-rose-100 transition-all hover:bg-rose-50 hover:border-rose-200 group">
                                    <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm group-hover:shadow-md transition-all">
                                        <Package size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-semibold uppercase italic text-rose-900 truncate tracking-tight">{p.name}</p>
                                        <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest mt-1">
                                            Stock Level: <span className="num-montserrat text-rose-600">{p.stock}</span>
                                        </p>
                                    </div>
                                    <AlertTriangle size={14} className="text-rose-300 group-hover:text-rose-500 transition-colors" />
                                </div>
                            ))}
                            {stockAlerts.length === 0 && (
                                <div className="py-12 flex flex-col items-center text-center opacity-30">
                                    <Package size={32} className="mb-3 text-slate-400" />
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Inventory Optimal</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContributorReports;
