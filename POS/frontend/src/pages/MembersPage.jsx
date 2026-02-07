import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getMembers, getMemberDetail } from '../services/api';
import {
    Users, Search, ChevronRight, Phone,
    Mail, Calendar, Trophy, History, Printer
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import MemberCard from '../components/MemberCard';

const MembersPage = () => {
    const [members, setMembers] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const componentRef = useRef();

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

    const fetchDetail = async (id) => {
        setIsLoading(true);
        try {
            const res = await getMemberDetail(id);
            if (res.status === 'success') setSelectedMember(res.data);
        } catch (err) { console.error(err); }
        finally {
            setIsLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    return (
        <div className="h-full flex gap-8">
            <div className="flex-1 flex flex-col min-w-0 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Member Hub</h1>
                    <p className="text-muted-foreground text-sm">Loyalty & relationship management</p>
                </div>

                <div className="card h-full flex flex-col overflow-hidden">
                    <header className="px-8 py-6 bg-muted/20 border-b">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                            <input
                                type="text"
                                placeholder="Search members by name or phone..."
                                className="input pl-11 w-full"
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
                                    onClick={() => fetchDetail(m.id)}
                                    className={`flex items-center justify-between px-8 py-6 cursor-pointer transition-all duration-300 group ${selectedMember?.id === m.id ? 'bg-foreground text-background shadow-2xl scale-[1.02] z-10' : 'hover:bg-foreground hover:text-background text-foreground'}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-300 ${selectedMember?.id === m.id ? 'bg-background text-foreground rotate-3' : 'bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground group-hover:-rotate-3 shadow-sm'}`}>
                                            {m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-base tracking-tight">{m.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${selectedMember?.id === m.id ? 'text-background/60' : 'text-muted-foreground group-hover:text-background/60'}`}>{m.phone}</p>
                                                <span className={`w-1 h-1 rounded-full transition-colors ${selectedMember?.id === m.id ? 'bg-background/30' : 'bg-muted-foreground/30'}`} />
                                                <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${selectedMember?.id === m.id ? 'text-background' : 'text-foreground group-hover:text-background'}`}>{m.points} POINTS</p>
                                            </div>
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

            {/* Member Details Sidebar */}
            <div className="w-[400px] shrink-0">
                {selectedMember ? (
                    <div className="card h-full space-y-8 relative overflow-y-auto custom-scrollbar shadow-2xl">
                        {isLoading && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}

                        <section className="text-center pt-4">
                            <div className="w-20 h-20 bg-foreground text-background rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                {selectedMember.name.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-xl font-bold tracking-tight">{selectedMember.name}</h2>
                            <span className="inline-block mt-1 px-3 py-0.5 bg-muted rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground border">Premium Member</span>
                        </section>

                        <section className="flex justify-center flex-col gap-4 px-8">
                            <button onClick={handlePrint} className="btn w-full h-14 rounded-2xl shadow-xl">
                                <Printer size={18} /> Print Card
                            </button>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted p-6 rounded-2xl text-center shadow-sm">
                                    <Trophy size={18} className="mx-auto mb-3 opacity-50" />
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Points</p>
                                    <p className="text-2xl font-black tracking-tighter">{selectedMember.points}</p>
                                </div>
                                <div className="bg-muted p-6 rounded-2xl text-center shadow-sm">
                                    <History size={18} className="mx-auto mb-3 opacity-50" />
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Visits</p>
                                    <p className="text-2xl font-black tracking-tighter">{selectedMember.myTransactions?.length || 0}</p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">Contact</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Phone size={14} className="text-muted-foreground" />
                                    <span className="text-xs font-medium">{selectedMember.phone}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail size={14} className="text-muted-foreground" />
                                    <span className="text-xs font-medium truncate">{selectedMember.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar size={14} className="text-muted-foreground" />
                                    <span className="text-xs font-medium">Joined {new Date(selectedMember.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </section>

                        {selectedMember.pointLogs?.length > 0 && (
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">Recent Logs</h3>
                                <div className="space-y-2">
                                    {selectedMember.pointLogs.slice(0, 5).map(log => (
                                        <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded border border-border">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-muted-foreground">{log.type}</p>
                                                <p className="text-[9px] text-muted-foreground">{new Date(log.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`text-xs font-bold ${log.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {log.amount > 0 ? '+' : ''}{log.amount}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                ) : (
                    <div className="card h-full flex flex-col items-center justify-center p-10 text-center text-muted-foreground opacity-50 border-dashed">
                        <Users size={48} className="mb-4" />
                        <p className="font-bold text-[10px] uppercase tracking-widest leading-relaxed">Select a member to view details</p>
                    </div>
                )}
            </div>
            <div style={{ display: 'none' }}>
                <MemberCard ref={componentRef} member={selectedMember} />
            </div>
        </div>
    );
};

export default MembersPage;
