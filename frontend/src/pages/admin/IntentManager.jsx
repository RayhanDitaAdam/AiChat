import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js';
import {
    Zap, Plus, Search, Pencil, Trash2, Save, X, ToggleLeft, ToggleRight,
    Activity, Code, MessageSquare, Shield, ChevronRight, Layers,
    Clock, RefreshCw, Filter, Sparkles
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const API = '/admin-ai';
const ACTION_TYPES = [
    { value: 'TEXT_RESPONSE', label: 'Direct Response', icon: MessageSquare, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
    { value: 'API_CALL', label: 'API Connection', icon: Code, color: 'text-blue-500 bg-blue-50 border-blue-100' },
    { value: 'HANDOFF', label: 'Human Handoff', icon: Shield, color: 'text-amber-500 bg-amber-50 border-amber-100' },
];

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <Motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl mx-4 overflow-hidden border border-slate-100"
            >
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-50/30">
                    <div>
                        <h3 className="font-extrabold text-slate-800 tracking-tight">{title}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Define trigger logic and automated actions</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 rounded-2xl hover:bg-slate-100 transition-colors text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto max-h-[80vh] custom-scrollbar">{children}</div>
            </Motion.div>
        </div>
    );
}

function IntentForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState({
        name: initial?.name || '',
        keywords: (initial?.keywords || []).join(', '),
        actionType: initial?.actionType || 'TEXT_RESPONSE',
        apiEndpoint: initial?.apiEndpoint || '',
        responseTpl: initial?.responseTpl || '',
        priority: initial?.priority || 0,
        isActive: initial?.isActive ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...form,
            keywords: form.keywords.split(',').map(s => s.trim()).filter(Boolean),
            priority: Number(form.priority)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Intent Name *</label>
                    <input
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        required
                        placeholder="e.g. Refund Request, Order Status"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Trigger Keywords (comma separated) *</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            value={form.keywords}
                            onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))}
                            required
                            placeholder="refund, money back, return shipping"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="md:col-span-1">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Priority (0-100)</label>
                    <input
                        type="number"
                        value={form.priority}
                        onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-black focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>

                <div className="md:col-span-1">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Action Engine</label>
                    <select
                        value={form.actionType}
                        onChange={e => setForm(p => ({ ...p, actionType: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-pointer appearance-none"
                    >
                        {ACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {form.actionType === 'API_CALL' ? (
                    <Motion.div
                        key="api"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Backend Connection URL</label>
                        <div className="relative">
                            <Code className="absolute left-4 top-14 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                                value={form.apiEndpoint}
                                onChange={e => setForm(p => ({ ...p, apiEndpoint: e.target.value }))}
                                placeholder="https://api.yourstore.com/webhooks/refund"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-mono focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </Motion.div>
                ) : (
                    <Motion.div
                        key="tpl"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Response Payload</label>
                        <textarea
                            value={form.responseTpl}
                            onChange={e => setForm(p => ({ ...p, responseTpl: e.target.value }))}
                            rows={4}
                            placeholder="Type the message the AI should send..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none italic"
                        />
                    </Motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-xl border ${form.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Status Control</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{form.isActive ? 'Actively intercepting chats' : 'Rule currently suspended'}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-100"
                >
                    <Save className="w-4 h-4" /> Deploy Rule
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-8 py-4.5 rounded-[1.5rem] border border-slate-200 text-sm font-extrabold text-slate-600 hover:bg-slate-50 transition-all"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function IntentManager() {
    const [intents, setIntents] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingIntent, setEditingIntent] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadIntents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`${API}/intents${search ? `?search=${search}` : ''}`);
            setIntents(res.data.data || []);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [search]);

    useEffect(() => { loadIntents(); }, [loadIntents]);

    const saveIntent = async (data) => {
        try {
            if (editingIntent) {
                await api.put(`${API}/intents/${editingIntent.id}`, data);
            } else {
                await api.post(`${API}/intents`, data);
            }
            setShowModal(false);
            setEditingIntent(null);
            loadIntents();
        } catch (e) { console.error(e); }
    };

    const deleteIntent = async (id) => {
        if (!window.confirm('Deactivate and delete this rule? This will affect live chat logic.')) return;
        await api.delete(`${API}/intents/${id}`);
        loadIntents();
    };

    const toggleActive = async (intent) => {
        try {
            await api.put(`${API}/intents/${intent.id}`, { ...intent, isActive: !intent.isActive });
            loadIntents();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="flex flex-col gap-8 min-h-screen p-6 pb-20 bg-gray-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-purple-600 rounded-[2rem] shadow-xl shadow-purple-100">
                        <Zap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Intent Designer</h1>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-0.5">Automate conversation flows with trigger patterns.</p>
                    </div>
                </div>
                <button
                    onClick={() => { setEditingIntent(null); setShowModal(true); }}
                    className="flex items-center justify-center gap-3 px-8 py-4.5 bg-purple-600 hover:bg-purple-700 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all shadow-2xl shadow-purple-100 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> New Interaction Rule
                </button>
            </div>

            {/* Toolbar - Search */}
            <div className="relative group max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Filter by intent name or keywords..."
                    className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold placeholder:text-slate-300 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none shadow-sm transition-all"
                />
            </div>

            {/* Main Content Table Area */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100/50">
                                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Logic & Name</th>
                                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-72">Trigger Patterns</th>
                                <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-48 text-center">Engine Status</th>
                                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-40 text-right">Settings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-32 text-center">
                                        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
                                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Automation Hub...</span>
                                    </td>
                                </tr>
                            ) : intents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-32 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Activity className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <h4 className="text-slate-900 font-black text-xl tracking-tight">System Idle</h4>
                                            <p className="text-sm text-slate-500 font-bold uppercase tracking-tight mt-2 leading-relaxed px-4">No active intent triggers detected. Initialize your first rule to begin automation.</p>
                                            <button
                                                onClick={() => setShowModal(true)}
                                                className="mt-8 text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline"
                                            >
                                                Initialize Flow +
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                intents.map(intent => {
                                    const action = ACTION_TYPES.find(a => a.value === intent.actionType) || ACTION_TYPES[0];
                                    return (
                                        <tr key={intent.id} className={`hover:bg-slate-50/50 transition-colors group ${!intent.isActive && 'opacity-60'}`}>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-all group-hover:scale-110 ${action.color}`}>
                                                        <action.icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="text-base font-black text-slate-800 tracking-tight truncate">{intent.name}</p>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/50">PR: {intent.priority}</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider items-center flex gap-1.5 leading-none">
                                                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                                            {action.label}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {intent.keywords?.map(k => (
                                                        <span key={k} className="px-2.5 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded-xl uppercase tracking-wider border border-slate-200/50">
                                                            {k}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-8 text-center">
                                                <button
                                                    onClick={() => toggleActive(intent)}
                                                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all border ${intent.isActive
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                                        : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${intent.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                                    {intent.isActive ? 'Active' : 'Offline'}
                                                </button>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-2.5">
                                                    <button
                                                        onClick={() => { setEditingIntent(intent); setShowModal(true); }}
                                                        className="p-3 rounded-2xl border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm"
                                                        title="Configure"
                                                    >
                                                        <Pencil className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteIntent(intent.id)}
                                                        className="p-3 rounded-2xl border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm"
                                                        title="Purge"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Intent Configuration Modal */}
            <AnimatePresence>
                {showModal && (
                    <Modal
                        title={editingIntent ? 'Advanced Rule Configuration' : 'Design Interaction Vector'}
                        onClose={() => { setShowModal(false); setEditingIntent(null); }}
                    >
                        <IntentForm
                            initial={editingIntent}
                            onSave={saveIntent}
                            onCancel={() => { setShowModal(false); setEditingIntent(null); }}
                        />
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}
