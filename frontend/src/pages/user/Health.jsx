import React, { useState, useEffect, useCallback } from 'react';
import { getPOSMembers, getPOSReports, analyzeFood, saveMedicalRecord } from '../../services/api.js';
import {
    HeartPulse, Search, Camera, Activity,
    ShieldCheck, BrainCircuit, ChevronRight, CheckCircle2,
    FileText, Plus, X, UserCircle2, Sparkles
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth.js';

const HealthPage = () => {
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
        <div className="h-full flex gap-8 bg-white overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 space-y-8 h-full">
                <header className="flex flex-col gap-2 shrink-0">
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none text-slate-900">Physiology</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Gemini AI Driven Health Intelligence</p>
                </header>

                <div className="bg-slate-50/50 border border-slate-100 rounded-[3rem] flex-1 flex flex-col overflow-hidden">
                    {isOwner ? (
                        <>
                            <header className="px-10 py-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                                <div className="relative w-full max-w-md group">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Audit member vitals or records..."
                                        className="w-full h-14 pl-14 pr-6 bg-white border-2 border-transparent rounded-2xl text-sm font-bold focus:outline-none focus:border-indigo-600 transition-all shadow-sm"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </header>

                            <section className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="p-4 space-y-2">
                                    {members.map(m => (
                                        <Motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            onClick={() => handleSelectMember(m)}
                                            className={`flex items-center justify-between p-6 rounded-[2rem] cursor-pointer transition-all duration-500 overflow-hidden relative group ${selectedMember?.id === m.id ? 'bg-slate-900 text-white shadow-2xl scale-[1.01]' : 'bg-white hover:bg-slate-100/50 border border-slate-100 text-slate-900 shadow-sm'}`}
                                        >
                                            <div className="flex items-center gap-6 z-10">
                                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-xl transition-all duration-500 ${selectedMember?.id === m.id ? 'bg-white text-slate-900 rotate-6 shadow-xl' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-indigo-600 group-hover:-rotate-6 shadow-sm'}`}>
                                                    {m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-lg tracking-tight uppercase italic">{m.name}</p>
                                                    <p className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${selectedMember?.id === m.id ? 'opacity-40' : 'text-slate-400'}`}>{m.phone}</p>
                                                </div>
                                            </div>
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all z-10 ${selectedMember?.id === m.id ? 'bg-white/10' : 'bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                                                <ChevronRight size={20} />
                                            </div>
                                            {selectedMember?.id === m.id && (
                                                <Motion.div layoutId="active-bg-health" className="absolute inset-0 bg-slate-900 z-0" />
                                            )}
                                        </Motion.div>
                                    ))}
                                </div>
                            </section>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <Sparkles className="w-20 h-20 text-indigo-600 mb-6 opacity-20" />
                            <h2 className="text-2xl font-black tracking-tighter uppercase italic text-slate-900 mb-2">Personal Health Node</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] max-w-xs leading-relaxed">Your physiological data is being processed via secure neural uplink.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Health Actions Panel */}
            <div className="w-[500px] shrink-0 h-full">
                <AnimatePresence mode="wait">
                    {selectedMember ? (
                        <Motion.div
                            key={selectedMember.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-slate-50 border border-slate-100 rounded-[3rem] h-full flex flex-col relative overflow-hidden shadow-2xl shadow-indigo-600/5"
                        >
                            <header className="p-12 text-center relative overflow-hidden shrink-0 border-b border-white">
                                {isOwner && (
                                    <button onClick={() => setSelectedMember(null)} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-white hover:bg-rose-50 rounded-2xl text-slate-400 hover:text-rose-500 transition-all shadow-sm z-30">
                                        <X size={20} />
                                    </button>
                                )}

                                <div className="relative z-10">
                                    <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-3xl font-black text-slate-900 mx-auto mb-6 shadow-xl shadow-indigo-600/5">
                                        {selectedMember.name[0]}
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 leading-none mb-4">{selectedMember.name}</h2>
                                    <div className="inline-flex items-center gap-3 bg-indigo-600 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-indigo-600/20">
                                        <ShieldCheck size={14} /> Security Context Established
                                    </div>
                                </div>
                            </header>

                            <div className="p-10 flex flex-col gap-8 h-full overflow-hidden">
                                <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                                    {['ANALYZE', 'RECORDS', 'HISTORY'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-400 hover:text-slate-900'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <section className="flex-1 overflow-y-auto custom-scrollbar">
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'ANALYZE' && (
                                            <Motion.div key="analyze" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 pb-20">
                                                <div className="bg-indigo-600 text-white p-8 rounded-[2rem] shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
                                                    <BrainCircuit className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Cognitive Core</h3>
                                                    <p className="text-sm font-black italic tracking-tight leading-relaxed">Submit food imagery or telemetry for instant AI physiological impact assessment.</p>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('food-upload').click()}>
                                                        <div className="h-24 bg-white border-2 border-dashed border-slate-200 rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm">
                                                            {foodImage ? (
                                                                <span className="truncate px-8 italic">{foodImage.name}</span>
                                                            ) : (
                                                                <div className="flex items-center gap-3">
                                                                    <Camera size={20} strokeWidth={1} /> Capture Visual Data
                                                                </div>
                                                            )}
                                                        </div>
                                                        <input id="food-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setFoodImage(e.target.files[0])} />
                                                    </div>
                                                    <textarea
                                                        className="w-full h-40 bg-white border border-slate-100 rounded-[1.5rem] p-6 text-sm font-bold placeholder:text-slate-200 focus:outline-none focus:border-indigo-600 transition-all shadow-sm resize-none italic"
                                                        placeholder="Qualitative dietary input... e.g., Patient consumed 500g red meat with high salinity."
                                                        value={foodText}
                                                        onChange={(e) => setFoodText(e.target.value)}
                                                    />
                                                    <button
                                                        onClick={handleAnalyzeFood}
                                                        disabled={isProcessing}
                                                        className="w-full h-16 bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.4em] italic"
                                                    >
                                                        {isProcessing ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><BrainCircuit size={18} /> Initiate Analysis</>}
                                                    </button>
                                                </div>
                                            </Motion.div>
                                        )}

                                        {activeTab === 'RECORDS' && (
                                            <Motion.div key="records" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 pb-20">
                                                <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm">
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-2 flex items-center gap-2">
                                                        <ShieldCheck size={14} /> End-to-End Encryption
                                                    </h3>
                                                    <p className="text-[10px] font-black text-slate-300 leading-relaxed uppercase tracking-widest">Clinical assets are transformed via 256-bit obfuscation prior to cloud persistence.</p>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('record-upload').click()}>
                                                        <div className="h-20 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm">
                                                            {medicalRecordInput instanceof File ? (
                                                                <span className="truncate px-8 italic">{medicalRecordInput.name}</span>
                                                            ) : (
                                                                <div className="flex items-center gap-3">
                                                                    <FileText size={18} strokeWidth={1} /> Archive Document
                                                                </div>
                                                            )}
                                                        </div>
                                                        <input id="record-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setMedicalRecordInput(e.target.files[0])} />
                                                    </div>

                                                    <div className="relative flex items-center justify-center">
                                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-50"></div></div>
                                                        <span className="relative px-4 bg-slate-50 text-[8px] font-black text-slate-200 uppercase tracking-[0.5em]">Nexus Override</span>
                                                    </div>

                                                    <textarea
                                                        className="w-full h-32 bg-white border border-slate-100 rounded-[1.5rem] p-6 text-sm font-bold placeholder:text-slate-200 focus:outline-none focus:border-indigo-600 transition-all shadow-sm resize-none italic"
                                                        placeholder="Manual clinical log entry..."
                                                        value={typeof medicalRecordInput === 'string' ? medicalRecordInput : ''}
                                                        onChange={(e) => setMedicalRecordInput(e.target.value)}
                                                    />
                                                    <button
                                                        onClick={handleSaveRecord}
                                                        disabled={isProcessing}
                                                        className="w-full h-14 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-900 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] shadow-sm flex items-center justify-center gap-3"
                                                    >
                                                        {isProcessing ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" /> : <><Plus size={16} /> Encrypt \u0026 Store</>}
                                                    </button>
                                                </div>
                                            </Motion.div>
                                        )}

                                        {activeTab === 'HISTORY' && (
                                            <Motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pb-20">
                                                {healthHistory.map(item => (
                                                    <div key={item.id} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] space-y-4 shadow-sm hover:border-indigo-600/10 transition-all relative overflow-hidden group">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'FOOD_ADVICE' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                                                    {item.type === 'FOOD_ADVICE' ? <BrainCircuit size={14} /> : <FileText size={14} />}
                                                                </div>
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 italic">{item.type.replace('_', ' ')}</span>
                                                            </div>
                                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        {item.aiResponse && (
                                                            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
                                                                <p className="text-xs leading-relaxed text-slate-600 font-bold italic">"{item.aiResponse}"</p>
                                                            </div>
                                                        )}
                                                        <div className="absolute top-0 right-0 w-1.5 h-full bg-indigo-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                                                    </div>
                                                ))}
                                                {healthHistory.length === 0 && (
                                                    <div className="text-center py-20 opacity-20">
                                                        <Activity size={64} strokeWidth={0.5} className="mx-auto mb-4" />
                                                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Latency Detected: No Data</p>
                                                    </div>
                                                )}
                                            </Motion.div>
                                        )}
                                    </AnimatePresence>
                                </section>
                            </div>
                        </Motion.div>
                    ) : (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] h-full flex flex-col items-center justify-center p-12 text-center text-slate-200">
                            <HeartPulse size={120} strokeWidth={0.5} className="mb-8 opacity-10" />
                            <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-300">Physiology Node</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed mt-2 opacity-60">Bind identity to initiate<br />clinical intelligence stream</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HealthPage;
