import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserChatHistory } from '../../services/api.js';
import { History as HistoryIcon, Clock, Store, ChevronRight, MessageCircle, Trash2 } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useChat } from '../../context/ChatContext.js';

const History = () => {
    const { clearHistory } = useChat();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const res = await getUserChatHistory();
            if (res.status === 'success') {
                setHistory(res.history);
            }
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleClearAll = async () => {
        if (!confirm('Apakah kamu yakin ingin menghapus SEMUA riwayat chat di toko ini?')) return;
        setLoading(true);
        await clearHistory();
        await fetchHistory();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Group history by date (Simplified for UI)
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    return (
        <div className="max-w-7xl space-y-8 p-4 md:p-8">

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Chat Journey<span className="text-indigo-600">.</span></h1>
                    <p className="text-slate-500 font-medium text-sm italic">Showing your conversations from the last 7 days.</p>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all active:scale-95"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All History
                    </button>
                )}
            </header>

            {history.length === 0 ? (
                <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border border-slate-100 rounded-[2.5rem] p-16 text-center shadow-sm"
                >
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No History Yet</h3>
                    <p className="text-slate-400 mt-1 max-w-xs mx-auto">Start exploring stores to see your chat history here.</p>
                </Motion.div>
            ) : (
                <div className="grid gap-4">
                    {history.map((chat, idx) => (
                        <Motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={chat.id}
                            className={`group bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-100 transition-all shadow-sm flex items-center gap-6 ${chat.role === 'ai' ? 'bg-slate-50/50' : ''}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${chat.role === 'ai' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {chat.role === 'ai' ? <MessageCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Store className="w-3 h-3 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{chat.owner?.name || 'Local Store'}</span>
                                    <span className="text-[10px] text-slate-300">•</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{formatDate(chat.timestamp)}</span>
                                </div>
                                <p className={`truncate font-medium ${chat.role === 'user' ? 'text-slate-800' : 'text-slate-500 italic'}`}>
                                    {chat.message}
                                </p>
                            </div>

                            <button className="opacity-0 group-hover:opacity-100 p-3 bg-slate-50 rounded-xl transition-all">
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>
                        </Motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
