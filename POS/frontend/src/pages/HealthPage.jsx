import React, { useState, useEffect, useCallback } from 'react';
import { getMembers, analyzeFood, saveMedicalRecord, getHealthHistory } from '../services/api';
import {
    HeartPulse, Search, Camera, Activity,
    ShieldCheck, BrainCircuit, ChevronRight, CheckCircle2,
    FileText, Plus
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const HealthPage = () => {
    const [members, setMembers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [activeTab, setActiveTab] = useState('ANALYZE'); // ANALYZE, RECORDS, HISTORY

    const [medicalRecordInput, setMedicalRecordInput] = useState('');
    const [foodText, setFoodText] = useState('');
    const [foodImage, setFoodImage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [healthHistory, setHealthHistory] = useState([]);

    const fetchMembers = useCallback(async () => {
        try {
            const res = await getMembers({ search });
            if (res.status === 'success') setMembers(res.data);
        } catch (err) { console.error(err); }
    }, [search]);

    useEffect(() => {
        fetchMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const handleSelectMember = async (m) => {
        setSelectedMember(m);
        fetchHistory(m.id);
    };

    const fetchHistory = async (id) => {
        try {
            const res = await getHealthHistory(id);
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
            alert('Medical record saved securely!');
        } catch (err) { alert(err.message); }
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
                setFoodImage('');
            }
        } catch (err) { alert(err.message); }
        finally { setIsProcessing(false); }
    };

    return (
        <div className="h-full flex gap-8">
            <div className="flex-1 flex flex-col min-w-0 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Health Intelligence</h1>
                    <p className="text-muted-foreground text-sm">Personalized medical advice via Gemini AI</p>
                </div>

                <div className="card h-full flex flex-col overflow-hidden">
                    <header className="px-8 py-6 bg-muted/20 border-b">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                            <input
                                type="text"
                                placeholder="Select member for health management..."
                                className="input pl-11 w-full h-12"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </header>

                    <section className="px-0 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="divide-y divide-border/50">
                            {members.map(m => (
                                <div
                                    key={m.id}
                                    onClick={() => handleSelectMember(m)}
                                    className={`flex items-center justify-between px-8 py-6 cursor-pointer transition-all duration-300 group ${selectedMember?.id === m.id ? 'bg-foreground text-background shadow-2xl scale-[1.02] z-10' : 'hover:bg-foreground hover:text-background text-foreground'}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-300 ${selectedMember?.id === m.id ? 'bg-background text-foreground rotate-3' : 'bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground group-hover:-rotate-3 shadow-sm'}`}>
                                            {m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-base tracking-tight">{m.name}</p>
                                            <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${selectedMember?.id === m.id ? 'text-background/60' : 'text-muted-foreground group-hover:text-background/60'}`}>{m.phone}</p>
                                        </div>
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedMember?.id === m.id ? 'bg-background/10' : 'bg-muted group-hover:bg-background/20'}`}>
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Health Actions Panel */}
            <div className="w-[500px] shrink-0">
                {selectedMember ? (
                    <div className="card h-full flex flex-col overflow-hidden shadow-2xl">
                        <header className="bg-foreground text-background p-10 text-center relative overflow-hidden shrink-0">
                            <Motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10">
                                <div className="w-20 h-20 bg-background text-foreground rounded-3xl flex items-center justify-center text-3xl font-black mx-auto mb-6 rotate-6 shadow-2xl">
                                    {selectedMember.name[0]}
                                </div>
                                <h2 className="text-2xl font-black tracking-tighter mb-2">{selectedMember.name}</h2>
                                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                                    <ShieldCheck size={14} /> Intelligence Hub Active
                                </div>
                            </Motion.div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                        </header>

                        <div className="px-8 -mt-7 relative z-20 flex gap-2">
                            {['ANALYZE', 'RECORDS', 'HISTORY'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-background text-foreground shadow-[0_15px_30px_rgba(0,0,0,0.1)]' : 'bg-muted/90 text-muted-foreground hover:bg-white hover:text-foreground'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <section className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                            <AnimatePresence mode="wait">
                                {activeTab === 'ANALYZE' && (
                                    <Motion.div key="analyze" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('food-upload').click()}>
                                            <div className="p-4 bg-muted border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-all">
                                                {foodImage instanceof File ? (
                                                    <span className="text-xs font-bold truncate px-4">{foodImage.name}</span>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <Camera size={24} />
                                                        <span className="mt-1 text-[10px] font-bold uppercase">Upload Photo</span>
                                                    </div>
                                                )}
                                            </div>
                                            <input id="food-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setFoodImage(e.target.files[0])} />
                                        </div>
                                        <textarea
                                            className="input w-full h-32 resize-none p-4 text-sm"
                                            placeholder="What is the member eating? e.g., Is this safe for diabetes?"
                                            value={foodText}
                                            onChange={(e) => setFoodText(e.target.value)}
                                        />
                                        <button
                                            onClick={handleAnalyzeFood}
                                            disabled={isProcessing}
                                            className="btn w-full h-16 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95"
                                        >
                                            {isProcessing ? <div className="w-6 h-6 border-4 border-background/20 border-t-background rounded-full animate-spin" /> : <><BrainCircuit size={20} /> Run Intelligence Analysis</>}
                                        </button>
                                    </Motion.div>
                                )}

                                {activeTab === 'RECORDS' && (
                                    <Motion.div key="records" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                                        <div className="bg-muted p-4 rounded-lg border">
                                            <h3 className="text-[10px] font-bold uppercase text-foreground mb-1 flex items-center gap-2">
                                                <ShieldCheck size={12} /> Privacy Notice
                                            </h3>
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">Medical records are encrypted and used only for AI health insights.</p>
                                        </div>

                                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('record-upload').click()}>
                                            <div className="p-4 bg-muted border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-all">
                                                {medicalRecordInput instanceof File ? (
                                                    <span className="text-xs font-bold truncate px-4">{medicalRecordInput.name}</span>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <FileText size={20} />
                                                        <span className="mt-1 text-[10px] font-bold uppercase">Upload Record Image</span>
                                                    </div>
                                                )}
                                            </div>
                                            <input id="record-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setMedicalRecordInput(e.target.files[0])} />
                                        </div>

                                        <p className="text-center text-[10px] font-bold text-muted-foreground uppercase opacity-50">- OR -</p>

                                        <textarea
                                            className="input w-full h-32 resize-none p-4 text-sm"
                                            placeholder="Enter medical details manually..."
                                            value={typeof medicalRecordInput === 'string' ? medicalRecordInput : ''}
                                            onChange={(e) => setMedicalRecordInput(e.target.value)}
                                        />
                                        <button
                                            onClick={handleSaveRecord}
                                            disabled={isProcessing}
                                            className="btn w-full h-12"
                                        >
                                            {isProcessing ? <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" /> : <><Plus size={16} /> Save Securely</>}
                                        </button>
                                    </Motion.div>
                                )}

                                {activeTab === 'HISTORY' && (
                                    <Motion.div key="history" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-3">
                                        {healthHistory.map(item => (
                                            <div key={item.id} className="p-4 bg-muted/50 rounded-lg border space-y-3 hover:bg-muted transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {item.type === 'FOOD_ADVICE' ? <Activity size={12} className="text-foreground" /> : <FileText size={12} className="text-muted-foreground" />}
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{item.type.replace('_', ' ')}</span>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-muted-foreground opacity-70">{new Date(item.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                {item.aiResponse && (
                                                    <div className="bg-background p-3 rounded border">
                                                        <p className="text-xs leading-relaxed text-foreground/90 italic">"{item.aiResponse}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </Motion.div>
                                )}
                            </AnimatePresence>
                        </section>
                    </div>
                ) : (
                    <div className="card h-full flex flex-col items-center justify-center p-10 text-center text-muted-foreground opacity-50 border-dashed">
                        <HeartPulse size={48} className="mb-4" />
                        <p className="font-bold text-[10px] uppercase tracking-widest leading-relaxed">Select a member to manage health data</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthPage;
