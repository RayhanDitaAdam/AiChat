import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js';
import {
    BarChart3, TrendingUp, MessageCircle, CheckCircle2, AlertCircle,
    Brain, Sparkles, ThumbsUp, ThumbsDown, RefreshCw, ChevronRight,
    HelpCircle, X, ExternalLink, Calendar, Filter
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const API = '/admin-ai';

function StatCard({ icon: Icon, label, value, sub, color = 'indigo' }) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
    };
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-all group">
            <div className={`p-3 rounded-xl border ${colors[color]} group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
                {sub && <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    {sub}
                </p>}
            </div>
        </div>
    );
}

export default function AITraining() {
    const [metrics, setMetrics] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(7);
    const [actionMsg, setActionMsg] = useState('');
    const [showGuide, setShowGuide] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [metricsRes, suggestionsRes] = await Promise.all([
                api.get(`${API}/analytics?days=${days}`),
                api.get(`${API}/suggestions?status=PENDING`),
            ]);
            setMetrics(metricsRes.data.data);
            setSuggestions(suggestionsRes.data.data || []);
        } catch (err) {
            console.error('Failed to fetch AI training data', err);
        } finally {
            setLoading(false);
        }
    }, [days]);

    useEffect(() => { fetchData(); }, [days, fetchData]);

    const approveSuggestion = async (id, suggestedQuestion, suggestedAnswer) => {
        try {
            await api.post(`${API}/suggestions/${id}/approve`, {
                finalQuestion: suggestedQuestion,
                finalAnswer: suggestedAnswer,
            });
            setSuggestions(prev => prev.filter(s => s.id !== id));
            setActionMsg('✅ Approved! FAQ added to Knowledge Base.');
            setTimeout(() => setActionMsg(''), 3000);
        } catch {
            setActionMsg('❌ Failed to approve suggestion.');
        }
    };

    const rejectSuggestion = async (id) => {
        try {
            await api.post(`${API}/suggestions/${id}/reject`, {});
            setSuggestions(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const res = metrics?.resolutionStats || {};

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-gray-50/50">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600 rounded-xl shadow-lg shadow-purple-200">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                            AI Training Center
                            <button
                                onClick={() => setShowGuide(!showGuide)}
                                className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-purple-600"
                                title="View Training Guide"
                            >
                                <HelpCircle className="w-5 h-5" />
                            </button>
                        </h1>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 font-medium ml-11">Empower your AI with real customer interactions and automated learning.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 border-r border-slate-100">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <select
                            value={days}
                            onChange={e => setDays(Number(e.target.value))}
                            className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
                        >
                            <option value={7}>LAST 7 DAYS</option>
                            <option value={14}>LAST 14 DAYS</option>
                            <option value={30}>LAST 30 DAYS</option>
                        </select>
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-2 hover:bg-slate-50 rounded-xl transition-all group"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-400 group-hover:text-purple-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showGuide && (
                    <Motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-indigo-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-indigo-200">
                            <div className="absolute top-0 right-0 p-6">
                                <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                    <X className="w-6 h-6 text-white/60" />
                                </button>
                            </div>

                            <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                                <div className="w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                                    <Sparkles className="w-10 h-10 text-indigo-300" />
                                </div>
                                <div className="space-y-6 flex-1 text-center lg:text-left">
                                    <div>
                                        <h2 className="text-2xl font-bold">Training Guide: How AI Learns 🧠</h2>
                                        <p className="text-indigo-100/70 text-sm mt-1 max-w-xl">Your AI identifies patterns in failed conversations to suggest new knowledge automatically.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { step: '1', title: 'Data Feed', text: 'AI reads conversations where customers didn\'t get an answer.' },
                                            { step: '2', title: 'Suggestion', text: 'A machine-learning model drafts potential FAQs based on those failures.' },
                                            { step: '3', title: 'Approval', text: 'You review, edit, and approve. Once approved, it\'s live in seconds.' },
                                        ].map(item => (
                                            <div key={item.step} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                                                <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-[11px] font-bold mb-3 mx-auto lg:mx-0 shadow-lg">
                                                    {item.step}
                                                </div>
                                                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                                                <p className="text-xs text-indigo-200/70 leading-relaxed">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-2">
                                        <button
                                            onClick={() => setShowGuide(false)}
                                            className="bg-white text-indigo-900 px-6 py-2.5 rounded-2xl text-xs font-extrabold hover:bg-indigo-50 transition-all shadow-xl"
                                        >
                                            Got it, thanks!
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative background blur */}
                            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-20" />
                            <div className="absolute top-20 -left-20 w-60 h-60 bg-purple-500 rounded-full blur-[80px] opacity-20" />
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>

            {actionMsg && (
                <Motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100 flex items-center gap-3 shadow-sm shadow-emerald-50"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    {actionMsg}
                </Motion.div>
            )}

            {loading ? (
                <div className="flex flex-col justify-center items-center py-32 space-y-4">
                    <div className="w-12 h-12 border-[5px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Intelligence...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Stat Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard icon={MessageCircle} label="Total Conversations" value={metrics?.totalConversations ?? 0} color="indigo" />
                        <StatCard
                            icon={CheckCircle2}
                            label="AI Resolved"
                            value={res.AI_RESOLVED ?? 0}
                            sub={`${metrics?.totalConversations ? Math.round((res.AI_RESOLVED ?? 0) / metrics.totalConversations * 100) : 0}% success rate`}
                            color="green"
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Avg. AI Accuracy"
                            value={`${metrics?.aiAccuracy ?? 100}%`}
                            sub="Admin-verified quality"
                            color="amber"
                        />
                        <StatCard
                            icon={AlertCircle}
                            label="Needs Attention"
                            value={res.UNRESOLVED ?? 0}
                            sub="Pending human review"
                            color="rose"
                        />
                    </div>

                    {/* Charts / Insights Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Status Breakdown */}
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-indigo-500" /> Resolution Mix
                                </h3>
                                <div className="p-1 px-2 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-500 border border-slate-100">
                                    TREND
                                </div>
                            </div>
                            <div className="space-y-4">
                                {(metrics?.topIntents || []).slice(0, 5).map((intent, i) => (
                                    <div key={i} className="group">
                                        <div className="flex items-center justify-between text-xs mb-1.5">
                                            <span className="font-bold text-slate-600 uppercase tracking-tight truncate max-w-[140px]">
                                                {intent.name === 'UNKNOWN' ? 'GENERAL INQUIRY' : intent.name || 'GENERAL'}
                                            </span>
                                            <span className="text-slate-900 font-extrabold">{intent.count}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                            <Motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, ((intent.count / (metrics?.totalConversations || 1)) * 100).toFixed(0))}%` }}
                                                className="h-full bg-indigo-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {(metrics?.topIntents || []).length === 0 && (
                                    <div className="text-center py-10">
                                        <BarChart3 className="w-10 h-10 text-slate-100 mx-auto mb-2" />
                                        <p className="text-xs text-slate-400 font-medium">No activity recorded.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Activity Graph */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Traffic Volume
                                </h3>
                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" /> Sessions
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 flex items-end gap-2 min-h-[160px]">
                                {(metrics?.dailyConversations || []).map((d, i) => {
                                    const maxCount = Math.max(...(metrics?.dailyConversations || []).map(x => x.count), 1);
                                    const heightPercentage = Math.max(8, (d.count / maxCount) * 100);
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                                            <Motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${heightPercentage}%` }}
                                                className="w-full bg-slate-50 transition-all group-hover:bg-indigo-600 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] rounded-t-xl cursor-pointer relative border-x border-t border-slate-100 group-hover:border-indigo-400"
                                            />
                                            <div className="hidden group-hover:flex absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap z-20 font-bold shadow-xl flex-col items-center">
                                                {d.count} chats
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase rotate-0">{d.date.split('-').slice(1).join('/')}</span>
                                        </div>
                                    );
                                })}
                                {(metrics?.dailyConversations || []).length === 0 && (
                                    <div className="w-full flex flex-col items-center justify-center py-10 opacity-30">
                                        <TrendingUp className="w-12 h-12 text-slate-200 mb-2" />
                                        <p className="text-xs text-slate-400">Insufficent data for graph.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Professional Table for Suggestions */}
                    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                    Self-Learning Radar
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Automated suggestions from unresolved threads.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                                    {suggestions.length} Pending Approval
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Suggested Content</th>
                                        <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-40">Intelligence</th>
                                        <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-48 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {suggestions.map((s) => (
                                        <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block mb-1">Detected Question</span>
                                                        <p className="text-sm font-bold text-slate-800 leading-snug">{s.suggestedQuestion}</p>
                                                    </div>
                                                    <div className="pl-4 border-l-2 border-slate-100">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Proposed Answer</span>
                                                        <p className="text-sm font-medium text-slate-500 line-clamp-2 italic leading-relaxed">
                                                            "{s.suggestedAnswer}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 vertical-top">
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Frequency</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex -space-x-1.5">
                                                                {[...Array(Math.min(s.frequency, 4))].map((_, i) => (
                                                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                                        <MessageCircle className="w-3 h-3" />
                                                                    </div>
                                                                ))}
                                                                {s.frequency > 4 && (
                                                                    <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[8px] font-bold text-indigo-600">
                                                                        +{s.frequency - 4}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-extrabold text-slate-600">{s.frequency} Sessions</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 cursor-pointer">
                                                        <ExternalLink className="w-3 h-3" />
                                                        <span className="text-[10px] font-bold uppercase underline decoration-1 underline-offset-4">View Logs</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => approveSuggestion(s.id, s.suggestedQuestion, s.suggestedAnswer)}
                                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-extrabold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                                                    >
                                                        <ThumbsUp className="w-3.5 h-3.5" /> Approve FAQ
                                                    </button>
                                                    <button
                                                        onClick={() => rejectSuggestion(s.id)}
                                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-500 border border-slate-200 rounded-xl text-xs font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                                                    >
                                                        <ThumbsDown className="w-3.5 h-3.5" /> Dismiss
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {suggestions.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-20 text-center">
                                                <div className="max-w-xs mx-auto space-y-3">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                                                        <CheckCircle2 className="w-8 h-8 text-slate-200" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">Intelligence Fully Synced</p>
                                                        <p className="text-xs text-slate-500 font-medium">No new knowledge gaps identified at this time. Great job!</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
