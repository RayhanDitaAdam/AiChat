import React, { useState, useEffect, useCallback } from 'react';
import { getPOSMembers, getPOSReports, analyzeFood, saveMedicalRecord } from '../../services/api.js';
import {
    HeartPulse, Search, Camera, Activity,
    ShieldCheck, BrainCircuit, ChevronRight, CheckCircle2,
    FileText, Plus, X, UserCircle2, Sparkles
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth.js';
import { useTranslation } from 'react-i18next';

const HealthPage = () => {
    const { t } = useTranslation();
    const { user, isOwner } = useAuth();
    const [members, setMembers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [activeTab, setActiveTab] = useState('ANALYZE'); // ANALYZE, RECORDS, HISTORY

    const [medicalRecordInput, setMedicalRecordInput] = useState('');
    const [foodText, setFoodText] = useState('');
    const [foodImage, setFoodImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [healthHistory, setHealthHistory] = useState([]);

    const fetchMembers = useCallback(async () => {
        if (!isOwner) return;
        try {
            const res = await getPOSMembers({ search });
            if (res.status === 'success') setMembers(res.data);
        } catch (err) { console.error(err); }
    }, [search, isOwner]);

    useEffect(() => {
        if (isOwner) {
            fetchMembers();
        } else if (user?.memberOf) {
            const memberData = {
                id: user.memberOf.id,
                name: user.name,
                phone: user.phone || 'N/A',
                createdAt: user.createdAt
            };
            setSelectedMember(memberData);
            fetchHistory(user.memberOf.id);
        }
    }, [fetchMembers, isOwner, user]);

    const handleSelectMember = async (m) => {
        setSelectedMember(m);
        fetchHistory(m.id);
    };

    const fetchHistory = async (id) => {
        try {
            const res = await getPOSReports('health-history', { memberId: id });
            if (res.status === 'success') setHealthHistory(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSaveRecord = async () => {
        if (!medicalRecordInput) return;
        setIsProcessing(true);
        try {
            let payload;
            if (medicalRecordInput instanceof File) {
                payload = new FormData();
                payload.append('memberId', selectedMember.id);
                payload.append('file', medicalRecordInput);
            } else {
                payload = { memberId: selectedMember.id, content: medicalRecordInput };
            }
            await saveMedicalRecord(payload);
            setMedicalRecordInput('');
            fetchHistory(selectedMember.id);
        } catch (err) { console.error(err); }
        finally { setIsProcessing(false); }
    };

    const handleAnalyzeFood = async () => {
        if (!foodText && !foodImage) return;
        setIsProcessing(true);
        try {
            let payload;
            if (foodImage instanceof File) {
                payload = new FormData();
                payload.append('memberId', selectedMember.id);
                payload.append('text', foodText);
                payload.append('file', foodImage);
            } else {
                payload = { memberId: selectedMember.id, text: foodText };
            }

            const res = await analyzeFood(payload);
            if (res.status === 'success') {
                fetchHistory(selectedMember.id);
                setActiveTab('HISTORY');
                setFoodText('');
                setFoodImage(null);
            }
        } catch (err) { console.error(err); }
        finally { setIsProcessing(false); }
    };

    return (
        <div className="min-h-full flex flex-col">
            <div className="flex-1 flex h-full gap-4 p-4 md:p-8 bg-slate-50/50">
                {/* Left Panel */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">{t('health.title')}</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('health.subtitle')}</p>
                        </div>

                        {isOwner && (
                            <div className="relative group w-72">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                <input
                                    type="text"
                                    className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-slate-900 transition-all shadow-sm"
                                    placeholder={t('health.search_placeholder')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        )}
                    </header>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
                        {isOwner ? (
                            <div className="space-y-3">
                                {members.map(m => (
                                    <Motion.div
                                        key={m.id}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelectMember(m)}
                                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all shadow-sm border ${selectedMember?.id === m.id ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white hover:border-slate-900 border-slate-200 text-slate-900'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-sm ${selectedMember?.id === m.id ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                                {m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase italic tracking-tight">{m.name}</p>
                                                <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${selectedMember?.id === m.id ? 'text-white/40' : 'text-slate-400'}`}>{m.phone}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className={selectedMember?.id === m.id ? 'text-white/40' : 'text-slate-300'} />
                                    </Motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-200">
                                <Sparkles className="w-16 h-16 mb-4 opacity-10" />
                                <h2 className="text-xl font-black tracking-tighter uppercase italic text-slate-300 mb-2">{t('health.personal_node')}</h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest max-w-xs leading-relaxed">{t('health.node_desc')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-[380px] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {selectedMember ? (
                            <Motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col h-full"
                                key={selectedMember.id}
                            >
                                <header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between text-slate-900">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm font-black italic">
                                            {selectedMember.name[0]}
                                        </div>
                                        <div>
                                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 italic leading-none">{selectedMember.name}</h2>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Member</p>
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-all">
                                            <X size={14} />
                                        </button>
                                    )}
                                </header>

                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                                        {['ANALYZE', 'RECORDS', 'HISTORY'].map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`flex-1 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-400 hover:text-slate-900'}`}
                                            >
                                                {t(`health.tabs.${tab.toLowerCase()}`)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <section className="px-6 py-4 flex-1 overflow-y-auto custom-scrollbar">
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'ANALYZE' && (
                                            <Motion.div key="analyze" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                                <div className="bg-indigo-600 text-white p-5 rounded-xl shadow-lg shadow-indigo-100 relative overflow-hidden group">
                                                    <BrainCircuit className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10" />
                                                    <h3 className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">{t('health.cognitive_core')}</h3>
                                                    <p className="text-[10px] font-black italic tracking-tight leading-tight">{t('health.analyze_desc')}</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('food-upload').click()}>
                                                        <div className="h-14 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all font-black text-[8px] uppercase tracking-widest shadow-sm">
                                                            {foodImage ? (
                                                                <span className="truncate px-4 italic">{foodImage.name}</span>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                                    <Camera size={14} /> {t('health.capture_btn')}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <input id="food-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setFoodImage(e.target.files[0])} />
                                                    </div>
                                                    <textarea
                                                        className="w-full h-32 bg-white border border-slate-200 rounded-lg p-4 text-[11px] font-bold placeholder:text-slate-200 focus:outline-none focus:border-slate-900 transition-all shadow-sm resize-none italic"
                                                        placeholder={t('health.analyze_placeholder')}
                                                        value={foodText}
                                                        onChange={(e) => setFoodText(e.target.value)}
                                                    />
                                                    <button
                                                        onClick={handleAnalyzeFood}
                                                        disabled={isProcessing}
                                                        className="w-full h-12 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest italic"
                                                    >
                                                        {isProcessing ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Sparkles size={12} /> {t('health.initiate_btn')}</>}
                                                    </button>
                                                </div>
                                            </Motion.div>
                                        )}

                                        {activeTab === 'RECORDS' && (
                                            <Motion.div key="records" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                                <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-sm">
                                                    <h3 className="text-[8px] font-black uppercase tracking-widest text-indigo-600 mb-1 flex items-center gap-1.5">
                                                        <ShieldCheck size={12} /> {t('health.encryption')}
                                                    </h3>
                                                    <p className="text-[9px] font-bold text-slate-300 leading-tight uppercase tracking-widest">{t('health.encryption_desc')}</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('record-upload').click()}>
                                                        <div className="h-14 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center text-slate-400 hover:border-slate-900 transition-all font-black text-[8px] uppercase tracking-widest shadow-sm">
                                                            {medicalRecordInput instanceof File ? (
                                                                <span className="truncate px-4 italic">{medicalRecordInput.name}</span>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                                    <FileText size={14} /> {t('health.archive_btn')}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <input id="record-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setMedicalRecordInput(e.target.files[0])} />
                                                    </div>

                                                    <textarea
                                                        className="w-full h-32 bg-white border border-slate-200 rounded-lg p-4 text-[11px] font-bold placeholder:text-slate-200 focus:outline-none focus:border-slate-900 transition-all shadow-sm resize-none italic"
                                                        placeholder={t('health.manual_placeholder')}
                                                        value={typeof medicalRecordInput === 'string' ? medicalRecordInput : ''}
                                                        onChange={(e) => setMedicalRecordInput(e.target.value)}
                                                    />
                                                    <button
                                                        onClick={handleSaveRecord}
                                                        disabled={isProcessing}
                                                        className="w-full h-12 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-900 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
                                                    >
                                                        {isProcessing ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" /> : <><Plus size={14} /> Encrypt & Store</>}
                                                    </button>
                                                </div>
                                            </Motion.div>
                                        )}

                                        {activeTab === 'HISTORY' && (
                                            <Motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                                                {healthHistory.map(item => (
                                                    <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-xl space-y-2 shadow-sm hover:border-slate-900 transition-all relative overflow-hidden group">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-6 h-6 rounded flex items-center justify-center ${item.type === 'FOOD_ADVICE' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                                                    {item.type === 'FOOD_ADVICE' ? <BrainCircuit size={10} /> : <FileText size={10} />}
                                                                </div>
                                                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-900 italic">{item.type.replace('_', ' ')}</span>
                                                            </div>
                                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        {item.aiResponse && (
                                                            <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-50">
                                                                <p className="text-[10px] leading-relaxed text-slate-600 font-bold italic">"{item.aiResponse}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {healthHistory.length === 0 && (
                                                    <div className="text-center py-10 opacity-20">
                                                        <Activity size={32} strokeWidth={1} className="mx-auto mb-2" />
                                                        <p className="text-[8px] font-black uppercase tracking-widest">{t('health.no_data')}</p>
                                                    </div>
                                                )}
                                            </Motion.div>
                                        )}
                                    </AnimatePresence>
                                </section>
                            </Motion.div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl h-full flex flex-col items-center justify-center p-12 text-center text-slate-200">
                                <HeartPulse size={80} strokeWidth={0.5} className="mb-4 opacity-10" />
                                <h3 className="text-sm font-black uppercase tracking-widest italic text-slate-300">{t('health.physiology_node')}</h3>
                                <p className="text-[8px] font-bold uppercase tracking-widest leading-relaxed mt-2 opacity-60">{t('health.bind_desc')}</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default HealthPage;
