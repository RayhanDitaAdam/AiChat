import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSystemConfig, updateSystemConfig } from '../../services/api.js';
import { Settings, Save, Server, Database, Activity, RefreshCw, Cpu, Zap, Sparkles } from 'lucide-react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext.js';

const SystemConfig = () => {
    const { showToast } = useToast();
    const [config, setConfig] = useState({ aiSystemPrompt: '', geminiApiKey: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [isEditingApiKey, setIsEditingApiKey] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await getSystemConfig();
                if (res.status === 'success') {
                    setConfig(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch config:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateSystemConfig(config);
            showToast('Configuration updated successfully! ✨', 'success');
            setIsEditingApiKey(false); // Lock it back after save
        } catch (error) {
            console.error(error);
            showToast('Failed to update system config', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
    );

    return (
        <div className="max-w-4xl space-y-12">

            <header className="space-y-1">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Configuration<span className="text-sky-500">.</span></h1>
                <p className="text-slate-500 font-medium">Global AI behavior and platform engine settings.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-sky-50 p-8 rounded-[2rem] border border-sky-100 flex flex-col justify-between min-h-[220px]">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-sky-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-slate-900">AI Compute</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Provider: Google Gemini 1.5</p>
                    </div>
                </div>
                <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 flex flex-col justify-between min-h-[220px]">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-slate-900">Instant Sync</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Changes applied immediately.</p>
                    </div>
                </div>
            </div>

            <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                        <Sparkles className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Personality Engine</h2>
                        <p className="text-slate-500 text-sm font-medium">Fine-tune how your AI interacts with customers.</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gemini API Token</label>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingApiKey(!isEditingApiKey)}
                                    className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${isEditingApiKey ? 'text-sky-500' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {isEditingApiKey ? 'Lock' : 'Edit Token'}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showApiKey ? "text" : "password"}
                                    value={config.geminiApiKey || ''}
                                    onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                                    readOnly={!isEditingApiKey}
                                    className={`w-full bg-[#fcfcfc] border rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all font-mono text-sm ${isEditingApiKey ? 'border-sky-200 text-slate-700' : 'border-slate-200 text-slate-400 select-none'}`}
                                    placeholder="Enter your Gemini API key..."
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showApiKey ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Chat Retention (Days)</label>
                            <input
                                type="number"
                                value={config.chatRetentionDays || 7}
                                onChange={(e) => setConfig({ ...config, chatRetentionDays: parseInt(e.target.value) })}
                                className="w-full bg-[#fcfcfc] border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all font-medium text-slate-700"
                                min="1"
                                max="365"
                                placeholder="7"
                            />
                            <p className="text-[10px] text-slate-400 ml-2 font-medium italic">Sessions older than this will be automatically deleted.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">System Instructions (Prompt)</label>
                            <textarea
                                value={config.aiSystemPrompt}
                                onChange={(e) => setConfig({ ...config, aiSystemPrompt: e.target.value })}
                                rows={8}
                                className="w-full bg-[#fcfcfc] border border-slate-200 rounded-[2rem] p-8 focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all font-medium text-slate-700 leading-relaxed custom-scrollbar"
                                placeholder="You are a helpful assistant..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <p className="text-xs text-slate-400 font-medium italic">
                            * Changes here will affect all chat sessions platform-wide.
                        </p>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-black text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : <><Save className="w-5 h-5" /> Update Engine</>}
                        </button>
                    </div>
                </form>
            </Motion.div>
        </div>
    );
};

export default SystemConfig;
