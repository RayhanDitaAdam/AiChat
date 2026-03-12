import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { Link } from 'react-router-dom';
import { getChatHistory } from '../../services/api.js';
import {
    User, Bot, Clock, Search, Filter, CheckCircle,
    AlertCircle, MessageCircle, Home, ChevronRight,
    ChevronLeft, FileText, Calendar, Download
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { PATHS } from '../../routes/paths.js';
import Pagination from '../../components/Pagination.jsx';

const ChatHistory = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, FOUND, NOT_FOUND, GENERAL
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchHistory = useCallback(async () => {
        if (!user?.ownerId) return;
        try {
            const data = await getChatHistory(user.ownerId);
            setHistory(data.chats || []);
        } catch {
            console.error('Failed to fetch chat history');
        } finally {
            setIsLoading(false);
        }
    }, [user?.ownerId]);

    useEffect(() => {
        let isCancelled = false;
        const load = async () => {
            if (!isCancelled) await fetchHistory();
        };
        load();
        return () => { isCancelled = true; };
    }, [fetchHistory]);

    const filteredHistory = history.filter(chat => {
        const matchesSearch = chat.message.toLowerCase().includes(searchTerm.toLowerCase());
        const status = (chat.status || 'GENERAL').toUpperCase();
        const matchesFilter = activeFilter === 'ALL' || status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const paginated = filteredHistory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const stats = {
        found: history.filter(c => c.status === 'FOUND').length,
        notFound: history.filter(c => c.status === 'NOT_FOUND').length,
        general: history.filter(c => c.status === 'GENERAL').length
    };

    const exportToExcel = () => {
        const data = history.map((chat, idx) => ({
            No: idx + 1,
            Timestamp: new Date(chat.timestamp).toLocaleString('id-ID'),
            Role: chat.role === 'user' ? 'Customer' : 'System',
            Message: chat.message,
            Status: chat.status || 'GENERAL'
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Chat Audit Logs');
        XLSX.writeFile(wb, `Chat_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    };

    return (
        <div className="min-h-screen bg-white font-normal overflow-x-hidden">
            {/* Header & Controls Area */}
            <div className="p-6 lg:p-10 pb-0">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
                    <Link to={PATHS.OWNER_DASHBOARD} className="flex items-center gap-1.5 font-normal hover:text-indigo-600 transition-colors">
                        <Home size={16} />
                        <span>{t('common.home')}</span>
                    </Link>
                    <ChevronRight size={16} className="text-slate-300" />
                    <span className="font-normal text-slate-500">Monitoring</span>
                    <ChevronRight size={16} className="text-slate-300" />
                    <span className="text-slate-900 font-medium">{t('audit.title')}</span>
                </nav>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                        {t('audit.title')}
                    </h1>
                    <p className="text-sm font-normal text-slate-500 mt-1">
                        {t('audit.subtitle')}
                    </p>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3 flex-wrap flex-1">
                        {/* Search */}
                        <div className="relative flex-1 min-w-0 sm:min-w-[320px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="search"
                                placeholder={t('audit.search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
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

                {/* Status filter (Radio style) */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span className="text-sm text-slate-500 font-normal italic tracking-widest uppercase text-[10px]">Filter by Status:</span>
                    <div className="flex flex-wrap gap-4">
                        {[
                            { id: 'ALL', label: `All Messages (${history.length})` },
                            { id: 'FOUND', label: `${t('audit.filter.resolved')} (${stats.found})` },
                            { id: 'NOT_FOUND', label: `${t('audit.filter.missed')} (${stats.notFound})` },
                            { id: 'GENERAL', label: `${t('audit.filter.general')} (${stats.general})` }
                        ].map((s) => (
                            <label key={s.id} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="status"
                                    checked={activeFilter === s.id}
                                    onChange={() => { setActiveFilter(s.id); setCurrentPage(1); }}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 transition-all"
                                />
                                <span className={`text-sm tracking-tight transition-colors ${activeFilter === s.id ? 'font-bold text-slate-900' : 'font-normal text-slate-500 group-hover:text-slate-700'}`}>
                                    {s.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table Area (Flush) */}
            <div className="bg-white border-y border-slate-100 shadow-sm min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="text-sm font-bold text-slate-400 italic tracking-widest uppercase text-[10px]">{t('audit.loading')}</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        <table className="w-full text-left border-separate border-spacing-0 min-w-full">
                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic w-16 text-center">No.</th>
                                    <th scope="col" className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic w-16 text-center">Role</th>
                                    <th scope="col" className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic min-w-[300px]">Message</th>
                                    <th scope="col" className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic text-center w-32">Status</th>
                                    <th scope="col" className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic text-right w-40">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <FileText size={40} className="text-slate-200" />
                                                <p className="text-sm font-bold uppercase tracking-widest italic text-slate-400">{t('audit.no_results')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((chat, idx) => (
                                        <tr key={chat.id} className="hover:bg-indigo-50/20 transition-all border-b border-slate-50 last:border-0 group">
                                            <td className="px-6 py-6 text-center">
                                                <span className="text-[11px] font-bold text-slate-300 num-montserrat">{(currentPage - 1) * itemsPerPage + idx + 1}</span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-all ${chat.role === 'user' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white border-slate-100 text-indigo-600'}`}>
                                                    {chat.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="max-w-2xl">
                                                    <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5 ${chat.role === 'user' ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                        {chat.role === 'user' ? t('audit.roles.customer') : t('audit.roles.system')}
                                                    </p>
                                                    <p className="text-sm text-slate-700 leading-relaxed font-bold whitespace-pre-wrap tracking-tight italic">
                                                        "{chat.message}"
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm border ${chat.status === 'FOUND' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    chat.status === 'NOT_FOUND' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        'bg-slate-50 text-slate-500 border-slate-100'
                                                    }`}>
                                                    {chat.status === 'FOUND' ? t('audit.filter.resolved') : chat.status === 'NOT_FOUND' ? t('audit.filter.missed') : t('audit.filter.general')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        <Clock size={12} />
                                                        {new Date(chat.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">
                                                        {new Date(chat.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination footer */}
                {!isLoading && filteredHistory.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[10px] font-bold text-slate-400 italic uppercase tracking-widest">
                            Showing <span className="text-indigo-600 not-italic">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-indigo-600 not-italic">{Math.min(currentPage * itemsPerPage, filteredHistory.length)}</span> of <span className="text-indigo-600 not-italic">{filteredHistory.length}</span> entries
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
                <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-slate-500 font-normal">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Live Stream Active</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Total Logs:</span>
                        <span className="num-montserrat text-indigo-600 font-bold tracking-tight px-2 py-1 bg-indigo-50 rounded-lg">{history.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatHistory;
