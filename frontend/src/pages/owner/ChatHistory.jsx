import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../../layouts/MainLayout.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { getChatHistory } from '../../services/api.js';
import { User, Bot, Clock, Search, Filter, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const ChatHistory = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, FOUND, NOT_FOUND, GENERAL

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
        const matchesFilter = activeFilter === 'ALL' || chat.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        found: history.filter(c => c.status === 'FOUND').length,
        notFound: history.filter(c => c.status === 'NOT_FOUND').length,
        general: history.filter(c => c.status === 'GENERAL').length
    };

    const FilterBox = ({ label, count, active, onClick, icon, colorClass }) => {
        const Icon = icon;
        return (
            <button
                onClick={onClick}
                className={`flex-1 p-8 rounded-3xl border transition-all duration-300 flex items-center justify-between group ${active
                    ? `bg-white border-${colorClass}-200 ring-2 ring-${colorClass}-50 shadow-sm`
                    : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                    }`}
            >
                <div className="text-left">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${active ? `text-${colorClass}-600` : 'text-slate-400'
                        }`}>{label}</p>
                    <h3 className={`text-4xl font-black ${active ? 'text-slate-900' : 'text-slate-500'
                        }`}>{count}</h3>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${active ? `bg-${colorClass}-600 text-white` : 'bg-slate-50 text-slate-300'
                    }`}>
                    <Icon className="w-6 h-6" />
                </div>
            </button>
        );
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12 mb-20">
                <header className="space-y-1 px-4">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">AI Audit Logs <span className="text-indigo-600">.</span></h1>
                    <p className="text-slate-500 font-bold text-lg">
                        Monitor every customer interaction. Identify stock gaps and service trends.
                    </p>
                </header>

                {/* Filter Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    <FilterBox
                        label="Resolved"
                        count={stats.found}
                        active={activeFilter === 'FOUND'}
                        onClick={() => setActiveFilter(activeFilter === 'FOUND' ? 'ALL' : 'FOUND')}
                        icon={CheckCircle}
                        colorClass="green"
                    />
                    <FilterBox
                        label="Missed"
                        count={stats.notFound}
                        active={activeFilter === 'NOT_FOUND'}
                        onClick={() => setActiveFilter(activeFilter === 'NOT_FOUND' ? 'ALL' : 'NOT_FOUND')}
                        icon={AlertCircle}
                        colorClass="amber"
                    />
                    <FilterBox
                        label="General"
                        count={stats.general}
                        active={activeFilter === 'GENERAL'}
                        onClick={() => setActiveFilter(activeFilter === 'GENERAL' ? 'ALL' : 'GENERAL')}
                        icon={MessageCircle}
                        colorClass="indigo"
                    />
                </div>

                <div className="px-4">
                    <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl px-8 py-5 flex items-center gap-4 focus-within:border-indigo-500 transition-all shadow-sm">
                        <Search className="w-6 h-6 text-slate-300" />
                        <input
                            className="bg-transparent border-none outline-none text-lg w-full font-bold text-slate-700 placeholder:text-slate-200"
                            placeholder="Search conversation intel..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                        <p className="font-black text-xl text-slate-900 tracking-tight">Syncing data logs...</p>
                    </div>
                ) : (
                    <div className="space-y-6 px-4">
                        {filteredHistory.map((chat, idx) => (
                            <Motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                                key={chat.id}
                                className={`p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-start gap-8 group transition-colors ${chat.status === 'FOUND' ? 'bg-white border-green-100' :
                                    chat.status === 'NOT_FOUND' ? 'bg-white border-amber-100' :
                                        'bg-white border-slate-100 hover:border-indigo-100'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${chat.role === 'user' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-50 border-slate-100 text-indigo-600'
                                    }`}>
                                    {chat.role === 'user'
                                        ? <User className="w-6 h-6" />
                                        : <Bot className="w-6 h-6" />
                                    }
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <h4 className={`text-[10px] font-black uppercase tracking-[0.25em] ${chat.role === 'user' ? 'text-indigo-600' : 'text-slate-400'
                                                }`}>
                                                {chat.role === 'user' ? 'Direct Customer' : 'HEART v.1 SYSTEM'}
                                            </h4>
                                            {chat.status && (
                                                <span className={`text-[10px] px-3 py-1 rounded-full font-black border uppercase tracking-widest ${chat.status === 'FOUND' ? 'bg-green-50 text-green-600 border-green-100' :
                                                    chat.status === 'NOT_FOUND' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-slate-50 text-slate-400 border-slate-100'
                                                    }`}>
                                                    {chat.status.replace('_', ' ')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(chat.timestamp).toLocaleString('id-ID', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <p className="text-lg text-slate-700 leading-relaxed font-bold whitespace-pre-wrap">
                                        {chat.message}
                                    </p>
                                </div>
                            </Motion.div>
                        ))}

                        {filteredHistory.length === 0 && (
                            <div className="text-center p-20 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[3rem]">
                                <p className="text-slate-400 font-black text-2xl tracking-tighter">Analysis clear. No matching logs found.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default ChatHistory;
