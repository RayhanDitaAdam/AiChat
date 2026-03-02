import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Download, Search, ChevronRight, Eye, Calendar,
    Home, FileText, ChevronLeft, Printer
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import Pagination from '../../../components/Pagination.jsx';
import InvoiceDetail from '../../../components/InvoiceDetail.jsx';
import { getPOSTransactions, getPOSSettings } from '../../../services/api.js';
import { useTranslation } from 'react-i18next';
import { PATHS } from '../../../routes/paths.js';
import { getValueColorClass } from '../../../utils/formatters.js';

const datePresets = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: 'all', label: 'All time' }
];

const getDateRange = (preset) => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    let start = new Date(now);
    start.setHours(0, 0, 0, 0);

    switch (preset) {
        case 'today':
            return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
        case 'yesterday':
            start.setDate(start.getDate() - 1);
            end.setDate(end.getDate() - 1);
            return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
        case '7d':
            start.setDate(start.getDate() - 7);
            return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
        case '30d':
            start.setDate(start.getDate() - 30);
            return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
        default:
            return { startDate: '', endDate: '' };
    }
};

const TransactionsPage = () => {
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [datePreset, setDatePreset] = useState('7d');
    const [settings, setSettings] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const dateRange = getDateRange(datePreset);

    const query = new URLSearchParams(window.location.search);
    const qStart = query.get('startDate');
    const qEnd = query.get('endDate');
    const qStatus = query.get('status');
    const qSearch = query.get('search');

    useEffect(() => {
        if (qStatus) setStatusFilter(qStatus);
        if (qSearch) setSearch(qSearch);
    }, [qStatus, qSearch]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = {
                    startDate: qStart || dateRange.startDate,
                    endDate: qEnd || dateRange.endDate,
                    status: qStatus || statusFilter
                };

                // If query params are present, we should probably reflect that in the UI
                // For simplicity, we'll just use them if they exist

                const [tRes, sRes] = await Promise.all([
                    getPOSTransactions(params),
                    getPOSSettings()
                ]);
                if (tRes.status === 'success') setTransactions(tRes.data || []);
                if (sRes.status === 'success') setSettings(sRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [datePreset, dateRange.startDate, dateRange.endDate, qStart, qEnd, qStatus, statusFilter]);

    const filteredTransactions = transactions.filter(txn => {
        const q = search.toLowerCase();
        const matchesSearch = (
            (txn.id?.toLowerCase() || '').includes(q) ||
            (txn.member?.name || 'guest').toLowerCase().includes(q) ||
            (txn.member?.email || '').toLowerCase().includes(q) ||
            (txn.paymentMethod || '').toLowerCase().includes(q)
        );
        const status = (txn.status || 'completed').toLowerCase();
        const matchesStatus = statusFilter === 'all' || status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginated = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const exportToExcel = () => {
        const data = transactions.map(txn => ({
            ID: txn.id?.toUpperCase() || txn.id,
            Date: new Date(txn.createdAt).toLocaleString(),
            Customer: txn.member?.name || 'Guest',
            Email: txn.member?.email || '',
            Payment: txn.paymentMethod,
            Status: txn.status || 'Completed',
            Total: txn.total
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        XLSX.writeFile(wb, `Transactions_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    if (selectedTransaction) {
        return (
            <div className="min-h-full bg-slate-50/50 font-normal overflow-x-hidden p-6 lg:p-10">
                {/* Breadcrumb back to list */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
                    <button onClick={() => setSelectedTransaction(null)} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                        <ChevronLeft size={16} />
                        <span className="font-medium">Transactions</span>
                    </button>
                    <ChevronRight size={16} className="text-slate-300" />
                    <span className="text-slate-900 font-bold tracking-tight italic uppercase">#{selectedTransaction.id?.substring(selectedTransaction.id.length - 7).toUpperCase() || selectedTransaction.id}</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content (Order Details) */}
                    <div className="flex-1 space-y-6">
                        <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tighter uppercase italic leading-none">Order #{selectedTransaction.id?.substring(selectedTransaction.id.length - 7).toUpperCase() || selectedTransaction.id}</h1>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${selectedTransaction.status === 'completed' || !selectedTransaction.status ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {selectedTransaction.status || 'Completed'}
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                                        {new Date(selectedTransaction.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsPrinting(true)}
                                    className="px-6 py-3 hover:bg-slate-100 bg-slate-50 border border-slate-200 rounded-xl transition-all text-slate-900 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest shadow-sm"
                                >
                                    <Printer size={16} /> {t('reports.invoice.print')}
                                </button>
                            </div>
                        </header>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 italic">Order Details</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Qty</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Price</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {selectedTransaction.items?.map((item, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-900 text-[11px] uppercase tracking-tight">{item.product?.name || item.name || item.productId}</p>
                                                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{item.product?.category || 'General'}</p>
                                                </td>
                                                <td className="px-6 py-4 text-[11px] font-bold text-slate-600 num-montserrat text-center">{item.quantity}</td>
                                                <td className="px-6 py-4 text-[11px] font-bold text-slate-600 text-right num-montserrat">Rp {item.price?.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-[11px] font-bold text-slate-900 text-right num-montserrat">Rp {(item.quantity * item.price).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-6 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-t border-slate-100">
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Payment Info</h3>
                                    <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{selectedTransaction.paymentMethod || 'CASH'}</p>
                                </div>
                                <div className="w-full md:w-64 space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span className="num-montserrat text-slate-600">Rp {(selectedTransaction.total + (selectedTransaction.discount || 0)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                                        <span>Discount</span>
                                        <span className="num-montserrat">- Rp {(selectedTransaction.discount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-4 border-t-2 border-slate-900">
                                        <span className="text-xs font-bold text-slate-900 uppercase italic tracking-widest">Grand Total</span>
                                        <span className={`text-2xl font-bold tracking-tighter italic num-montserrat ${getValueColorClass(selectedTransaction.total)}`}>Rp {selectedTransaction.total?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Customer & History) */}
                    <div className="w-full lg:w-[360px] space-y-6 shrink-0">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 italic mb-6">Customer Details</h2>
                            <ul className="space-y-5">
                                <li className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{(selectedTransaction.member?.name?.[0] || 'G')}</span>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Name</p>
                                            <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{selectedTransaction.member?.name || 'Guest'}</p>
                                        </div>
                                    </div>
                                </li>
                                <li className="pl-11">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Contact</p>
                                    <p className="text-xs font-semibold text-slate-600 num-montserrat">{selectedTransaction.member?.email || '-'}</p>
                                    <p className="text-xs font-semibold text-slate-600 num-montserrat mt-1">{selectedTransaction.member?.phone || '-'}</p>
                                </li>
                                {selectedTransaction.member?.points > 0 && (
                                    <li className="pl-11 pt-4 border-t border-slate-50">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Loyalty Points Earned</p>
                                        <span className="inline-flex px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-widest">
                                            {selectedTransaction.pointsEarned || 0} Pts
                                        </span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 italic mb-6">Staff Details</h2>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase">{(selectedTransaction.cashier?.name?.[0] || 'S')}</span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Cashier</p>
                                    <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{selectedTransaction.cashier?.name || 'System'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-normal overflow-x-hidden">
            {/* Header & Controls Area */}
            <div className="p-6 lg:p-10 pb-0">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
                    <Link to={PATHS.OWNER_DASHBOARD} className="flex items-center gap-1.5 font-normal hover:text-indigo-600 transition-colors">
                        <Home size={16} />
                        <span>Home</span>
                    </Link>
                    <ChevronRight size={16} className="text-slate-300" />
                    <Link to={PATHS.OWNER_POS} className="font-normal hover:text-indigo-600 transition-colors">Commerce</Link>
                    <ChevronRight size={16} className="text-slate-300" />
                    <span className="text-slate-900 font-medium">Transactions</span>
                </nav>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                        Transactions
                    </h1>
                    <p className="text-sm font-normal text-slate-500 mt-1">
                        View and manage all POS transactions
                    </p>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                        {/* Search */}
                        <div className="relative flex-1 min-w-0 sm:min-w-[280px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="search"
                                placeholder="Search by Order ID or Customer"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        {/* Date preset */}
                        <div className="relative group">
                            <button
                                type="button"
                                className="h-11 px-4 flex items-center gap-2 bg-white border border-slate-200 rounded-xl text-sm font-normal text-slate-600 hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            >
                                <Calendar size={16} className="text-slate-400" />
                                {datePresets.find(p => p.id === datePreset)?.label || 'Last 7 days'}
                                <ChevronRight size={16} className="text-slate-400 rotate-90" />
                            </button>
                            <div className="absolute left-0 top-full mt-1 py-2 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[160px]">
                                {datePresets.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => { setDatePreset(p.id); setCurrentPage(1); }}
                                        className={`w-full px-4 py-2 text-left text-sm font-normal hover:bg-slate-50 ${datePreset === p.id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-600'}`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={exportToExcel}
                            className="h-11 px-4 flex items-center gap-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm"
                        >
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Status filter */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span className="text-sm text-slate-500 font-normal">Show only:</span>
                    <div className="flex flex-wrap gap-3">
                        {['all', 'completed', 'pending', 'failed'].map((s) => (
                            <label key={s} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    checked={statusFilter === s}
                                    onChange={() => { setStatusFilter(s); setCurrentPage(1); }}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                />
                                <span className={`text-sm capitalize ${statusFilter === s ? 'font-medium text-slate-900' : 'font-normal text-slate-600'}`}>{s === 'all' ? 'All' : s}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table Area (Flush) */}
            <div className="bg-white border-y border-slate-100 shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="text-sm font-medium text-slate-500 italic tracking-widest uppercase text-[10px]">Fetching data...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        <table className="w-full text-left border-separate border-spacing-0 min-w-[900px]">
                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic w-16 text-center">No.</th>
                                    <th scope="col" className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Order ID</th>
                                    <th scope="col" className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Customer</th>
                                    <th scope="col" className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Payment</th>
                                    <th scope="col" className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Total</th>
                                    <th scope="col" className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Date</th>
                                    <th scope="col" className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic text-center">Status</th>
                                    <th scope="col" className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center text-slate-500 text-sm">
                                            No transactions found matching your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((txn, index) => (
                                        <tr key={txn.id} className="hover:bg-indigo-50/30 transition-all border-b border-slate-100 last:border-0 group">
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-xs font-bold text-slate-400 num-montserrat">{(currentPage - 1) * itemsPerPage + index + 1}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-900 num-montserrat">#{txn.id?.substring(txn.id.length - 8).toUpperCase() || txn.id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 shrink-0">
                                                        {(txn.member?.name?.[0] || 'G').toUpperCase()}
                                                    </div>
                                                    <div><p className="text-sm font-semibold text-slate-700 leading-tight">{txn.member?.name || t('reports.guest')}</p></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                                    <span className="text-xs font-medium uppercase tracking-wider">{txn.paymentMethod?.toUpperCase()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className={`text-sm font-bold num-montserrat ${getValueColorClass(txn.total)}`}>Rp {txn.total?.toLocaleString('id-ID')}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-tighter">
                                                    {new Date(txn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border ${(txn.status || 'completed').toLowerCase() === 'completed'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : (txn.status || '').toLowerCase() === 'pending'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                        : 'bg-rose-50 text-rose-700 border-rose-100'
                                                    }`}>
                                                    {txn.status || 'Completed'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => setSelectedTransaction(txn)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm mx-auto"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination footer */}
                {!loading && filteredTransactions.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-slate-500 italic uppercase tracking-widest">
                            Showing <span className="text-indigo-600 not-italic">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-indigo-600 not-italic">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> of <span className="text-indigo-600 not-italic">{filteredTransactions.length}</span> entries
                        </p>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* Footer Area */}
            <div className="p-6 lg:p-10 pb-24">
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 font-normal">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Total Records:</span>
                    <span className="num-montserrat text-indigo-600 font-bold">{filteredTransactions.length}</span>
                </div>

                <AnimatePresence>
                    {isPrinting && selectedTransaction && (
                        <InvoiceDetail
                            transaction={selectedTransaction}
                            settings={settings}
                            onClose={() => setIsPrinting(false)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TransactionsPage;
