import React, { useState, useEffect } from 'react';
import { getPOSTransactions, getPOSReports } from '../../../services/api.js';
import {
    FileText, Download, TrendingUp, AlertTriangle,
    Calendar, ArrowRight, Printer, RefreshCw, ChevronRight, Package
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell
} from 'recharts';
import Pagination from '../../../components/Pagination.jsx';

const ReportsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [stockAlerts, setStockAlerts] = useState([]);
    const [dateRange] = useState({ start: '', end: '' });
    const [period, setPeriod] = useState('daily');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tRes, sRes, tpRes, saRes] = await Promise.all([
                    getPOSTransactions(dateRange),
                    getPOSReports('sales', { period }), // Unified route
                    getPOSReports('top-products', { limit: 5 }),
                    getPOSReports('stock-alerts', { limit: 10 })
                ]);

                if (tRes.status === 'success') {
                    setTransactions(tRes.data || []);
                    setCurrentPage(1); // Reset to first page on new data
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

    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const paginatedTransactions = transactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const exportToExcel = () => {
        const data = transactions.map(t => ({
            ID: t.id,
            Date: new Date(t.createdAt).toLocaleString(),
            Cashier: t.cashier?.name,
            Member: t.member?.name || 'Guest',
            Payment: t.paymentMethod,
            Discount: t.discount,
            Total: t.total
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
        XLSX.writeFile(wb, `Sales_Report_${new Date().toLocaleDateString()}.xlsx`);
    };

    return (
        <div className="min-h-full flex flex-col">
            <div className="flex-1 flex h-full gap-4 p-4 bg-slate-50/50">
                {/* Left: Intelligence Dashboard */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Intelligence Hub</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit sales performance & inventory</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-slate-900 shadow-sm"
                            >
                                <option value="daily">Daily View</option>
                                <option value="monthly">Monthly View</option>
                            </select>
                            <button onClick={exportToExcel} className="h-10 px-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-200">
                                <Download size={14} /> Export CSV
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4 space-y-4">
                        {/* Stats Radar */}
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Total Sales', val: `Rp ${transactions.reduce((acc, t) => acc + t.total, 0).toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-600' },
                                { label: 'Transactions', val: transactions.length, icon: FileText, color: 'text-slate-900' },
                                { label: 'Growth', val: '+12.5%', icon: TrendingUp, color: 'text-emerald-600' },
                                { label: 'Alerts', val: stockAlerts.length, icon: AlertTriangle, color: 'text-rose-600' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                    <stat.icon size={16} className={`${stat.color} mb-3`} />
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-sm font-black italic tracking-tighter text-slate-900">{stat.val}</p>
                                </div>
                            ))}
                        </div>

                        {/* Chart Delta */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-sm font-black uppercase italic tracking-tight text-slate-900">Performance Delta</h3>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Revenue over time audit</p>
                                </div>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                                    <BarChart data={salesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                        />
                                        <Bar dataKey="total" radius={[4, 4, 4, 4]} barSize={32}>
                                            {salesData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === salesData.length - 1 ? '#4f46e5' : '#1e293b'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Transaction Audit Table */}
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <header className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Transaction Audit Log</p>
                                <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[8px] font-black">{transactions.length} LOGS</span>
                            </header>
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/30 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Epoch</th>
                                        <th className="px-6 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Target</th>
                                        <th className="px-6 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                                        <th className="px-10 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedTransactions.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3 text-[10px] font-bold text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-3">
                                                <p className="text-[10px] font-black text-slate-900 uppercase italic tracking-tight">{t.member?.name || 'GUEST'}</p>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[8px] font-black uppercase tracking-widest text-slate-500">{t.paymentMethod}</span>
                                            </td>
                                            <td className="px-10 py-3 text-right">
                                                <p className="text-[11px] font-black text-indigo-600 tracking-tighter">Rp {t.total.toLocaleString()}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Insight Sidebar */}
                <div className="w-[380px] shrink-0 flex flex-col gap-4">
                    {/* Top Moving Items */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-1/2">
                        <header className="mb-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                                <div className="h-[2px] w-4 bg-indigo-600" /> Velocity Insights
                            </h3>
                        </header>
                        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                            {topProducts.map((p, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center font-black text-[9px] text-slate-400 shadow-sm">
                                        0{i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase italic text-slate-900 truncate tracking-tight">{p.name}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{p.salesCount} Units Sold</p>
                                    </div>
                                    <ArrowRight size={12} className="text-slate-200" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Critical Stock Alerts */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-1/2">
                        <header className="mb-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                                <div className="h-[2px] w-4 bg-rose-500" /> Inventory Alerts
                            </h3>
                        </header>
                        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                            {stockAlerts.map((p, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100/50">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
                                        <Package size={14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase italic text-rose-900 truncate tracking-tight">{p.name}</p>
                                        <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest mt-0.5">Critical STK: {p.stock}</p>
                                    </div>
                                    <AlertTriangle size={12} className="text-rose-500" />
                                </div>
                            ))}
                            {stockAlerts.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-20">
                                    <RefreshCw size={32} />
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] mt-2">Inventory Clear</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
