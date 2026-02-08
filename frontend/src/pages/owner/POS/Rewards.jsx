import React, { useState, useEffect } from 'react';
import { getPOSRewards, getPOSMembers, redeemPOSReward } from '../../../services/api.js';
import { Gift, Search, User, CheckCircle2, AlertCircle, X, Trophy, Sparkles, ShoppingBag, ChevronRight, QrCode, ArrowRight } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const RewardsPage = () => {
    const [rewards, setRewards] = useState([]);
    const [members, setMembers] = useState([]);
    const [searchMember, setSearchMember] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchRewards();
    }, []);

    const fetchRewards = async () => {
        try {
            const res = await getPOSRewards();
            if (res.status === 'success') setRewards(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSearchMember = async () => {
        if (!searchMember.trim()) return;
        setLoading(true);
        try {
            const res = await getPOSMembers({ search: searchMember });
            if (res.status === 'success') setMembers(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleRedeem = async (reward) => {
        if (!selectedMember) {
            setMessage({ type: 'error', text: 'Identity Context Required' });
            return;
        }

        if (selectedMember.points < reward.pointsRequired) {
            setMessage({ type: 'error', text: 'Insufficient Loyalty Balance' });
            return;
        }

        setLoading(true);
        try {
            const res = await redeemPOSReward({
                memberId: selectedMember.id,
                rewardId: reward.id
            });
            if (res.status === 'success') {
                setMessage({ type: 'success', text: `Redeemed ${reward.name}!` });
                fetchRewards();
                setSelectedMember({ ...selectedMember, points: selectedMember.points - reward.pointsRequired });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Redemption Failed' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchMember.trim()) {
                handleSearchMember();
            } else {
                setMembers([]);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchMember]);

    return (
        <div className="min-h-full flex flex-col">
            <div className="flex-1 flex h-full gap-4 p-4 bg-slate-50/50">
                {/* Left: Identity Context */}
                <div className="w-[350px] shrink-0 flex flex-col min-w-0">
                    <header className="mb-6">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Privilege Desk</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Settle customer rewards</p>
                    </header>

                    <div className="space-y-4 flex-1 flex flex-col">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                            <input
                                type="text"
                                placeholder="Sync Member ID / Name / Phone..."
                                className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-slate-900 shadow-sm transition-all"
                                value={searchMember}
                                onChange={(e) => setSearchMember(e.target.value)}
                            />
                        </div>

                        <div className="flex-1 flex flex-col">
                            <AnimatePresence mode="wait">
                                {selectedMember ? (
                                    <Motion.div
                                        key="profile"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="bg-slate-900 text-white rounded-2xl p-8 flex flex-col shadow-xl shadow-slate-200/50 relative overflow-hidden group h-full"
                                    >
                                        <QrCode className="absolute -right-4 -top-4 w-32 h-32 text-white/5" />
                                        <div className="flex flex-col items-center text-center relative z-10">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-xl font-black text-slate-900 mb-4 shadow-xl">
                                                {selectedMember.name[0]}
                                            </div>
                                            <h2 className="text-lg font-black tracking-tighter uppercase italic text-white leading-none mb-1">{selectedMember.name}</h2>
                                            <p className="text-[8px] font-bold uppercase tracking-widest text-white/40 mb-8">{selectedMember.phone}</p>

                                            <div className="w-full pt-6 border-t border-white/10">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Loyalty Value</p>
                                                <div className="flex items-center justify-center gap-2 mt-1">
                                                    <p className="text-4xl font-black tracking-tighter italic text-white">{selectedMember.points.toLocaleString()}</p>
                                                    <p className="text-[9px] font-bold text-white/40 tracking-widest uppercase">pts</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSelectedMember(null)}
                                                className="mt-auto w-full py-3 rounded-lg border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:border-rose-500 transition-all text-white/60 hover:text-white"
                                            >
                                                Eject Identity
                                            </button>
                                        </div>
                                    </Motion.div>
                                ) : members.length > 0 ? (
                                    <Motion.div
                                        key="results"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full"
                                    >
                                        <header className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-900">Search Yield</p>
                                        </header>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                                            {members.map(m => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => { setSelectedMember(m); setMembers([]); }}
                                                    className="w-full flex items-center justify-between p-4 transition-all group hover:bg-slate-50 border-b border-slate-50"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                            <User size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-[10px] uppercase text-slate-900">{m.name}</p>
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{m.phone}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={12} className="text-slate-200 group-hover:text-slate-900 transition-transform group-hover:translate-x-1" />
                                                </button>
                                            ))}
                                        </div>
                                    </Motion.div>
                                ) : (
                                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-2xl p-8 flex-1 flex flex-col items-center justify-center text-center text-slate-200">
                                        {searchMember.trim() && !loading ? (
                                            <>
                                                <AlertCircle size={40} strokeWidth={1} className="mb-4 text-rose-300" />
                                                <h3 className="text-sm font-black uppercase tracking-widest italic text-rose-500">No Yields Found</h3>
                                                <p className="text-[8px] font-black uppercase tracking-widest mt-2 text-rose-400 opacity-60">The ID you entered did not sync<br />with any system accounts</p>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={40} strokeWidth={1} className="mb-4 opacity-50" />
                                                <h3 className="text-sm font-black uppercase tracking-widest italic opacity-50">Privilege Desk</h3>
                                                <p className="text-[8px] font-black uppercase tracking-widest mt-2 opacity-30">Scan or Sync member<br />to settle rewards</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Right: Rewards Grid */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">Exchange Hub</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Available reward inventory</p>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {rewards.map((reward) => (
                                <Motion.div
                                    key={reward.id}
                                    whileHover={{ y: -2 }}
                                    className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-sm group hover:border-slate-900 transition-all h-[240px]"
                                >
                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 mb-4 border border-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                        <Gift size={18} />
                                    </div>

                                    <h3 className="text-sm font-black italic tracking-tighter text-slate-900 uppercase leading-none mb-4">{reward.name}</h3>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Trophy size={10} className="text-indigo-600" />
                                            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{reward.pointsRequired} Points</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ShoppingBag size={10} className="text-slate-400" />
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stock: {reward.stock}</span>
                                        </div>
                                    </div>

                                    <button
                                        disabled={loading || (selectedMember && selectedMember.points < reward.pointsRequired) || reward.stock <= 0}
                                        onClick={() => handleRedeem(reward)}
                                        className="mt-auto w-full py-3 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest italic shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all disabled:opacity-20 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                                            <>Redeem Now <ArrowRight size={10} /></>
                                        )}
                                    </button>
                                </Motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <AnimatePresence>
                    {message && (
                        <Motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={`fixed bottom-8 right-8 flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl z-50 border ${message.type === 'success' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-rose-600 border-rose-500 text-white'
                                }`}
                        >
                            {message.type === 'success' ? <CheckCircle2 size={16} className="text-indigo-400" /> : <AlertCircle size={16} />}
                            <span className="font-black uppercase tracking-widest italic text-[10px]">{message.text}</span>
                            <button onClick={() => setMessage(null)} className="ml-4 opacity-40 hover:opacity-100 transition-opacity">
                                <X size={14} />
                            </button>
                        </Motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RewardsPage;
