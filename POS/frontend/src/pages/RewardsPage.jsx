import React, { useState, useEffect } from 'react';
import { getRewards, getMembers, redeemReward } from '../services/api';
import { Gift, Search, User, CheckCircle2, AlertCircle } from 'lucide-react';
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
            const res = await getRewards();
            if (res.status === 'success') setRewards(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSearchMember = async () => {
        if (!searchMember.trim()) return;
        setLoading(true);
        try {
            const res = await getMembers({ search: searchMember });
            if (res.status === 'success') setMembers(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleRedeem = async (reward) => {
        if (!selectedMember) {
            setMessage({ type: 'error', text: 'Please select a member first' });
            return;
        }

        if (selectedMember.points < reward.pointsRequired) {
            setMessage({ type: 'error', text: 'Insufficient points' });
            return;
        }

        setLoading(true);
        try {
            const res = await redeemReward({
                memberId: selectedMember.id,
                rewardId: reward.id
            });
            if (res.status === 'success') {
                setMessage({ type: 'success', text: `Successfully redeemed ${reward.name}!` });
                fetchRewards();
                // Refresh member points
                const updatedMember = { ...selectedMember, points: selectedMember.points - reward.pointsRequired };
                setSelectedMember(updatedMember);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Redemption failed' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reward Catalog</h1>
                    <p className="text-muted-foreground text-sm">Redeem points for exclusive rewards</p>
                </div>

                <div className="relative w-full max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                    <input
                        type="text"
                        placeholder="Scan member or search..."
                        className="input pl-12 pr-28 w-full h-14 text-sm"
                        value={searchMember}
                        onChange={(e) => setSearchMember(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchMember()}
                    />
                    <button
                        onClick={handleSearchMember}
                        className="absolute right-2 top-2 bottom-2 btn px-6 text-[10px] uppercase tracking-widest"
                    >
                        Search
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Member Profile */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Member Profile Card */}
                    <div className="card bg-foreground text-background shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden scale-[1.02]">
                        <header className="px-8 py-6 bg-white/5 border-b border-white/10">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Active Member</h2>
                        </header>
                        <section className="p-8">
                            {selectedMember ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-background text-foreground flex items-center justify-center font-black text-lg">
                                            {selectedMember.name[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-lg font-black truncate leading-tight tracking-tighter">{selectedMember.name}</p>
                                            <p className="text-[10px] opacity-50 font-bold uppercase tracking-widest mt-0.5">{selectedMember.phone}</p>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-white/10">
                                        <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">Available Balance</p>
                                        <div className="flex items-end gap-2">
                                            <p className="text-4xl font-black tracking-tighter">{selectedMember.points}</p>
                                            <p className="text-xs font-black opacity-50 mb-1">PTS</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedMember(null)}
                                        className="w-full h-12 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all"
                                    >
                                        Change Member
                                    </button>
                                </div>
                            ) : (
                                <div className="py-10 text-center space-y-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10 rotate-3">
                                        <User size={32} strokeWidth={1} className="opacity-30" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 leading-relaxed">No member<br />linked yet</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Search Results Dropdown-like */}
                    {members.length > 0 && !selectedMember && (
                        <div className="card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                            <header className="px-6 py-4 bg-muted/20 border-b">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Search Results</p>
                            </header>
                            <section className="px-0">
                                <div className="divide-y divide-border/50">
                                    {members.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => { setSelectedMember(m); setMembers([]); }}
                                            className="w-full flex items-center justify-between px-6 py-4 transition-all group hover:bg-foreground hover:text-background text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground shadow-sm">
                                                    <User size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm tracking-tight">{m.name}</p>
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase transition-colors group-hover:text-background/60 tracking-widest">{m.phone}</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-xs tracking-tighter group-hover:text-background">{m.points} PT</p>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                {/* Rewards List */}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {rewards.map((reward) => (
                            <Motion.div
                                key={reward.id}
                                whileHover={{ y: -8 }}
                                className="card h-full flex flex-col group"
                            >
                                <section className="p-8 flex flex-col h-full">
                                    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-foreground mb-6 shadow-sm group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                                        <Gift size={28} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-bold leading-tight mb-2 tracking-tight">{reward.name}</h3>
                                    <div className="flex items-center gap-3 mb-8">
                                        <span className="text-[10px] font-black bg-foreground text-background px-3 py-1 rounded-lg uppercase tracking-widest">
                                            {reward.pointsRequired} PT
                                        </span>
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            {reward.stock} IN STOCK
                                        </span>
                                    </div>
                                    <div className="mt-auto">
                                        <button
                                            disabled={loading || (selectedMember && selectedMember.points < reward.pointsRequired) || reward.stock <= 0}
                                            onClick={() => handleRedeem(reward)}
                                            className="w-full btn h-14 text-[10px] uppercase font-black tracking-[0.2em] rounded-xl shadow-lg disabled:opacity-30"
                                        >
                                            {loading ? <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" /> : 'Redeem Now'}
                                        </button>
                                    </div>
                                </section>
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
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded border shadow-2xl z-50 ${message.type === 'success' ? 'bg-background text-foreground border-foreground' : 'bg-destructive text-destructive-foreground'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span className="font-bold uppercase tracking-widest text-[10px]">{message.text}</span>
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RewardsPage;
