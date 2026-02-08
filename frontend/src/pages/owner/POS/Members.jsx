import React, { useState, useEffect, useRef } from 'react';
import { getPOSMembers, getMemberDetail } from '../../../services/api.js';
import {
    Users, Search, ChevronRight, Phone,
    Mail, Calendar, Trophy, History, Printer,
    X, UserCircle2, ArrowUpRight, ArrowDownRight, QrCode
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import MemberCard from '../../../components/MemberCard.jsx';

const MembersPage = () => {
    const [members, setMembers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const componentRef = useRef();

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                const res = await getPOSMembers({ search });
                if (isMounted && res.status === 'success') setMembers(res.data);
            } catch (err) { console.error(err); }
        };
        load();
        return () => { isMounted = false; };
    }, [search]);

    const handleMemberSelect = async (member) => {
        setLoadingDetail(true);
        try {
            const res = await getMemberDetail(member.id);
            if (res.status === 'success') {
                setSelectedMember(res.data);
            }
        } catch (err) {
            console.error(err);
            setSelectedMember(member); // Fallback to list data
        } finally {
            setLoadingDetail(false);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    return (
        <div className="min-h-full flex flex-col">
            <div className="flex-1 flex h-full gap-4 p-4 bg-slate-50/50">
                {/* Left: Member List */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Member Database</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit customer loyalty records</p>
                        </div>

                        <div className="relative group w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                            <input
                                type="text"
                                className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-slate-900 transition-all shadow-sm"
                                placeholder="Find ID / Name / Phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </header>

                    <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Census Records</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">System Global Audit</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg">
                                <Users size={14} />
                                <span className="text-xs font-black">{members.length}</span>
                            </div>
                        </header>

                        <section className="flex-1 overflow-y-auto custom-scrollbar p-4">
                            <div className="grid grid-cols-1 gap-2">
                                {members.map(m => (
                                    <Motion.div
                                        key={m.id}
                                        whileHover={{ x: 2 }}
                                        onClick={() => handleMemberSelect(m)}
                                        className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between group ${selectedMember?.id === m.id
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200'
                                            : 'bg-white border-slate-100 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm uppercase ${selectedMember?.id === m.id
                                                ? 'bg-white text-slate-900'
                                                : 'bg-slate-50 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-900 transition-colors'
                                                }`}>
                                                {m.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className={`text-[11px] font-black uppercase italic tracking-tight ${selectedMember?.id === m.id ? 'text-white' : 'text-slate-900'
                                                    }`}>
                                                    {m.name}
                                                </p>
                                                <p className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 opacity-40 ${selectedMember?.id === m.id ? 'text-white' : 'text-slate-400'
                                                    }`}>
                                                    {m.phone || 'NO CONTACT'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className={`text-[10px] font-black italic tracking-tighter ${selectedMember?.id === m.id ? 'text-indigo-400' : 'text-indigo-600'
                                                    }`}>
                                                    {m.points.toLocaleString()} <span className="text-[8px] not-italic opacity-40 uppercase tracking-widest">pts</span>
                                                </p>
                                            </div>
                                            <ChevronRight size={14} className={`transition-transform ${selectedMember?.id === m.id ? 'translate-x-1 text-white' : 'text-slate-200'
                                                }`} />
                                        </div>
                                    </Motion.div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Right: Details Sidebar */}
                <div className="w-[400px] shrink-0">
                    <AnimatePresence mode="wait">
                        {selectedMember ? (
                            <Motion.div
                                key={selectedMember.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-white border border-slate-200 rounded-2xl h-full flex flex-col shadow-xl shadow-slate-200/50 overflow-hidden"
                            >
                                <header className="p-8 pb-4 relative overflow-hidden">
                                    <button onClick={() => setSelectedMember(null)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                        <X size={16} />
                                    </button>

                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-black mb-4 shadow-xl shadow-slate-200">
                                            {selectedMember.name.charAt(0).toUpperCase()}
                                        </div>
                                        <h2 className="text-xl font-black italic tracking-tighter uppercase text-slate-900 text-center">
                                            {selectedMember.name}
                                        </h2>
                                        <div className="flex gap-2 mt-4">
                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-indigo-100 italic">Audit Clear</span>
                                            <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[8px] font-black uppercase tracking-widest border border-slate-100">POS Level I</span>
                                        </div>
                                    </div>
                                </header>

                                <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-4 space-y-6">
                                    <div className="space-y-4 relative">
                                        {loadingDetail && (
                                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-2xl">
                                                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative group overflow-hidden">
                                                <Trophy size={20} className="absolute -bottom-1 -right-1 opacity-5 text-indigo-600" />
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance</p>
                                                <p className="text-lg font-black italic tracking-tighter text-slate-900">{selectedMember.points?.toLocaleString() || 0}</p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative group overflow-hidden">
                                                <History size={20} className="absolute -bottom-1 -right-1 opacity-5 text-indigo-600" />
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Visits</p>
                                                <p className="text-lg font-black italic tracking-tighter text-slate-900">
                                                    {selectedMember.myTransactions?.length || 0}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50 pb-2">Technical Insight</p>
                                            {[
                                                { icon: Phone, label: 'Link Code', value: selectedMember.phone || 'VOID' },
                                                { icon: Mail, label: 'Audit Path', value: selectedMember.email || 'VOID' },
                                                { icon: Calendar, label: 'Registry', value: new Date(selectedMember.createdAt).toLocaleDateString() }
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                                                        <item.icon size={12} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[7px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{item.label}</p>
                                                        <p className="text-[10px] font-black text-slate-700 italic truncate max-w-[180px]">{item.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50 pb-2">Log Activity</p>
                                            {selectedMember.posPointHistory && selectedMember.posPointHistory.length > 0 ? (
                                                selectedMember.posPointHistory.map((log, idx) => (
                                                    <div key={log.id || idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-6 h-6 rounded flex items-center justify-center ${log.type === 'EARN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                                {log.type === 'EARN' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase tracking-tight italic text-slate-900 leading-none">
                                                                    {log.description || (log.type === 'EARN' ? 'Purchase' : 'Redeem')}
                                                                </p>
                                                                <p className="text-[7px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                                                                    {new Date(log.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[9px] font-black italic ${log.type === 'EARN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {log.type === 'EARN' ? '+' : '-'}{log.amount}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-6 text-center">
                                                    <p className="text-[8px] font-black uppercase text-slate-300 tracking-widest">No activity recorded</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <footer className="p-6 bg-slate-50 border-t border-slate-100">
                                    <button onClick={handlePrint} className="w-full h-12 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest italic flex items-center justify-center gap-3 shadow-lg shadow-slate-200 hover:scale-[1.02] active:scale-98 transition-all">
                                        <Printer size={14} className="text-indigo-400" /> Print Record
                                    </button>
                                </footer>
                            </Motion.div>
                        ) : (
                            <div className="bg-white border-2 border-dashed border-slate-100 rounded-2xl h-full flex flex-col items-center justify-center p-10 text-center text-slate-200">
                                <UserCircle2 size={48} strokeWidth={1} className="mb-4 opacity-50" />
                                <h3 className="text-sm font-black uppercase tracking-widest italic opacity-50">Select Account</h3>
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] mt-2 opacity-30 leading-relaxed">System standby<br />Ready for identity audit</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
                <div style={{ display: 'none' }}>
                    <MemberCard ref={componentRef} member={selectedMember} />
                </div>
            </div>
        </div>
    );
};

export default MembersPage;
