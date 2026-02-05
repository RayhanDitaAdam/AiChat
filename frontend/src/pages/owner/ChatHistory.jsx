import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { Link } from 'react-router-dom';
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
                className={`flex-1 p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${active
                    ? `bg-white border-${colorClass}-200 ring-4 ring-${colorClass}-50 shadow-sm`
                    : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                    }`}
            >
                <div className="text-left space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${active ? `text-${colorClass}-600` : 'text-slate-400'
                        }`}>{label}</p>
                    <h3 className={`text-3xl font-black ${active ? 'text-slate-900' : 'text-slate-500'
                        }`}>{count}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${active ? `bg-${colorClass}-600 text-white` : 'bg-slate-50 text-slate-300'
                    }`}>
                    <Icon className="w-5 h-5" />
                </div>
            </button>
        );
    };

    return (
        <div className="space-y-12">

            <header className="space-y-1 pb-8 border-b border-slate-100">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Audit Logs<span className="text-indigo-600">.</span></h1>
                <p className="text-slate-500 font-medium">
                    Monitor every customer interaction. Identify stock gaps and service trends.
                </p>
            </header>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-2xl px-6 py-4 flex items-center gap-4 focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-500 transition-all shadow-sm">
                <Search className="w-5 h-5 text-slate-300" />
                <input
                    className="bg-transparent border-none outline-none text-base w-full font-medium text-slate-700 placeholder:text-slate-300"
                    placeholder="Search conversation intel..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p className="font-black text-xl text-slate-900 tracking-tight">Syncing data logs...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredHistory.map((chat, idx) => (
                        <Motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                            key={chat.id}
                            className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-start gap-6 group transition-all ${chat.status === 'FOUND' ? 'bg-white border-green-100 shadow-[0_4px_15px_-5px_rgba(34,197,94,0.1)]' :
                                chat.status === 'NOT_FOUND' ? 'bg-white border-amber-100 shadow-[0_4px_15px_-5px_rgba(245,158,11,0.1)]' :
                                    'bg-white border-slate-100 hover:border-indigo-100 shadow-sm'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${chat.role === 'user' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-50 border-slate-100 text-indigo-600'
                                }`}>
                                {chat.role === 'user'
                                    ? <User className="w-5 h-5" />
                                    : <Bot className="w-5 h-5" />
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
                    {!isLoading && filteredHistory.length === 0 && (
                        <div className="text-center p-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                            <p className="text-slate-400 font-bold text-xl tracking-tight">Analysis clear. No matching logs found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatHistory;
