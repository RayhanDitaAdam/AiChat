import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js';
import {
    MessageCircle, ChevronDown, ChevronUp, Tag, User, RefreshCw,
    CheckCircle2, AlertCircle, History, Filter, Search, MoreHorizontal,
    ArrowRight, MessageSquare, ShieldCheck, Zap
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const API = '/admin-ai';
const RESOLUTION_OPTIONS = [
    { value: 'UNRESOLVED', label: 'Unresolved', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { value: 'AI_RESOLVED', label: 'AI Resolved', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { value: 'HUMAN_RESOLVED', label: 'Human Resolved', color: 'bg-blue-50 text-blue-600 border-blue-100' },
];

const ACCURACY_OPTIONS = [
    { value: 'GOOD', label: 'Satisfactory', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { value: 'BAD_ANSWER', label: 'Inaccurate', color: 'bg-rose-50 text-rose-600 border-rose-100' },
    { value: 'HALLUCINATION', label: 'Hallucination', color: 'bg-red-50 text-red-700 border-red-100' },
];

function StatusBadge({ value, options }) {
    const opt = options.find(o => o.value === value) || { label: value?.replace('_', ' ') || 'None', color: 'bg-slate-50 text-slate-400 border-slate-100' };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${opt.color}`}>
            {opt.label}
        </span>
    );
}

export default function ConversationLogs() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [expandedSession, setExpandedSession] = useState(null);

    const loadSessions = useCallback(async () => {
        setLoading(true);
        try {
            // Simplified for now, backend unresolved endpoint doesn't support search yet but we can filter client-side if needed
            const res = await api.get(`${API}/analytics/unresolved?limit=20&skip=${page * 20}`);
            setSessions(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [page]);

    useEffect(() => { loadSessions(); }, [loadSessions]);

    const handleApplyTag = async (sessionId, resolution, accuracyTag) => {
        try {
            await api.post(`${API}/analytics/tag/${sessionId}`, { resolution, accuracyTag });
            loadSessions();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="flex flex-col gap-8 min-h-screen p-6 pb-20 bg-gray-50/50">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-purple-600 rounded-[2rem] shadow-xl shadow-purple-100">
                        <History className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Conversation History</h1>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-0.5">Audit AI interactions and calibrate performance.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadSessions}
                        className="p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:bg-slate-50 transition-all text-slate-400 hover:text-purple-600"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Filter sessions..."
                            className="pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-sm font-bold shadow-sm focus:ring-4 focus:ring-purple-500/5 outline-none transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Main Table Area */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100/50">
                                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Session Identity</th>
                                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-48">Timestamp</th>
                                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-48 text-center">Resolution</th>
                                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-32 text-right">View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-32 text-center">
                                        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
                                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Compiling Histories...</span>
                                    </td>
                                </tr>
                            ) : sessions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-32 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <ShieldCheck className="w-10 h-10 text-emerald-300" />
                                            </div>
                                            <h4 className="text-slate-900 font-black text-xl tracking-tight">Clean Inbox</h4>
                                            <p className="text-sm text-slate-500 font-bold uppercase mt-2">No unresolved sessions require audit at this time.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sessions.map(session => (
                                    <React.Fragment key={session.id}>
                                        <tr className={`hover:bg-slate-50/50 transition-colors group ${expandedSession === session.id ? 'bg-indigo-50/20' : ''}`}>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                                                        <User className="w-6 h-6 text-slate-300" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-base font-black text-slate-800 tracking-tight truncate">{session.title || 'Anonymous Client'}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200/50 rounded-lg text-[10px] font-bold text-slate-500 uppercase">
                                                                <MessageSquare className="w-3 h-3" /> {session.chats?.length || 0} Events
                                                            </div>
                                                            {session.aiAccuracyTag && <StatusBadge value={session.aiAccuracyTag} options={ACCURACY_OPTIONS} />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <p className="text-xs font-bold text-slate-700">{new Date(session.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="px-6 py-8 text-center">
                                                <StatusBadge value={session.resolution || 'UNRESOLVED'} options={RESOLUTION_OPTIONS} />
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <button
                                                    onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                                                    className={`p-3 rounded-2xl border transition-all shadow-sm ${expandedSession === session.id
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
                                                        : 'bg-white text-slate-400 border-slate-100 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100'
                                                        }`}
                                                >
                                                    <ArrowRight className={`w-5 h-5 transition-transform ${expandedSession === session.id ? 'rotate-90' : ''}`} />
                                                </button>
                                            </td>
                                        </tr>
                                        <AnimatePresence>
                                            {expandedSession === session.id && (
                                                <tr>
                                                    <td colSpan={4} className="px-10 py-0 overflow-hidden">
                                                        <Motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="pb-10 pt-4"
                                                        >
                                                            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] overflow-hidden">
                                                                {/* Chat Viewer */}
                                                                <div className="p-8 space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                                                                    {session.chats?.map((chat, idx) => (
                                                                        <div key={idx} className={`flex items-start gap-3 ${chat.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                                            <div className={`w-8 h-8 rounded-xl shrink-0 border flex items-center justify-center ${chat.role === 'user' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                                                                                {chat.role === 'user' ? <User className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                                                            </div>
                                                                            <div className={`max-w-[70%] group`}>
                                                                                <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm ${chat.role === 'user'
                                                                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                                                                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                                                                    }`}>
                                                                                    {chat.message}
                                                                                </div>
                                                                                <p className={`text-[9px] font-black uppercase text-slate-400 mt-1.5 px-1 ${chat.role === 'user' ? 'text-right' : ''}`}>
                                                                                    {new Date(chat.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Audit Controls */}
                                                                <div className="p-8 bg-white border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                                                    <div className="flex flex-wrap items-center gap-4">
                                                                        <div className="space-y-1.5">
                                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Calibration Status</label>
                                                                            <div className="flex gap-2">
                                                                                {RESOLUTION_OPTIONS.map(opt => (
                                                                                    <button
                                                                                        key={opt.value}
                                                                                        onClick={() => handleApplyTag(session.id, opt.value, session.aiAccuracyTag)}
                                                                                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${session.resolution === opt.value
                                                                                            ? opt.color.replace('bg-', 'bg-opacity-10 bg-')
                                                                                            : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-400'
                                                                                            }`}
                                                                                    >
                                                                                        {opt.label}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <div className="w-px h-10 bg-slate-100 mx-2 hidden md:block" />
                                                                        <div className="space-y-1.5">
                                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AI Performance Tag</label>
                                                                            <div className="flex gap-2">
                                                                                {ACCURACY_OPTIONS.map(opt => (
                                                                                    <button
                                                                                        key={opt.value}
                                                                                        onClick={() => handleApplyTag(session.id, session.resolution || 'UNRESOLVED', opt.value)}
                                                                                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${session.aiAccuracyTag === opt.value
                                                                                            ? opt.color.replace('bg-', 'bg-opacity-10 bg-')
                                                                                            : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-400'
                                                                                            }`}
                                                                                    >
                                                                                        {opt.label}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setExpandedSession(null)}
                                                                        className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                                                                    >
                                                                        Close Audit
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </Motion.div>
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!loading && sessions.length > 0 && (
                <div className="flex items-center justify-between px-2">
                    <button
                        disabled={page === 0}
                        onClick={() => { setPage(p => p - 1); setExpandedSession(null); }}
                        className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
                    >
                        ← Prev Page
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">Archive Block {page + 1}</span>
                    </div>
                    <button
                        disabled={sessions.length < 20}
                        onClick={() => { setPage(p => p + 1); setExpandedSession(null); }}
                        className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
                    >
                        Next Page →
                    </button>
                </div>
            )}
        </div>
    );
}
