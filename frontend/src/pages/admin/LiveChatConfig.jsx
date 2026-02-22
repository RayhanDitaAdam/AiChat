import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    MessageSquare, XCircle, Search, Store,
    ShieldCheck, ShieldAlert, Filter, ChevronRight
} from 'lucide-react';
import { getAdminOwners, updateOwnerConfig } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import StatCard from '../../components/StatCard.jsx';
import { motion as Motion } from 'framer-motion';

const LiveChatConfig = () => {
    const [owners, setOwners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast } = useToast();

    const fetchOwners = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await getAdminOwners();
            setOwners(data.data || data.owners || []);
        } catch (error) {
            console.error(error);
            showToast('Failed to fetch stores', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchOwners();
    }, [fetchOwners]);

    const handleToggleChat = async (ownerId, currentVal) => {
        try {
            const newConfig = { showChat: !currentVal };
            await updateOwnerConfig(ownerId, newConfig);
            setOwners(prev => prev.map(o => {
                if (o.id === ownerId) {
                    return { ...o, config: { ...o.config, ...newConfig } };
                }
                return o;
            }));
            showToast(`Chat ${!currentVal ? 'enabled' : 'disabled'} successfully`, 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to update chat configuration', 'error');
        }
    };

    const filteredOwners = owners.filter(owner =>
        owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: owners.length,
        active: owners.filter(o => o.config?.showChat !== false).length,
        locked: owners.filter(o => o.config?.showChat === false).length
    };

    return (
        <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-20"
        >

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-semibold text-slate-900 tracking-tight italic uppercase">
                        Live Chat Config<span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Manage AI availability and communication parameters across stores.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search store..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none w-72 transition-all shadow-sm font-medium focus:border-indigo-200"
                        />
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Registered Stores"
                    value={stats.total}
                    icon={Store}
                    color="bg-slate-900"
                    delay={0.1}
                />
                <StatCard
                    title="Active AI Channels"
                    value={stats.active}
                    icon={ShieldCheck}
                    color="bg-emerald-500"
                    delay={0.15}
                />
                <StatCard
                    title="Restricted Access"
                    value={stats.locked}
                    icon={ShieldAlert}
                    color="bg-rose-500"
                    delay={0.2}
                />
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-10 py-6 text-[10px] font-medium text-slate-500 uppercase tracking-widest">Store Entity</th>
                                <th className="px-10 py-6 text-[10px] font-medium text-slate-500 uppercase tracking-widest text-center">Protocol Status</th>
                                <th className="px-10 py-6 text-[10px] font-medium text-slate-500 uppercase tracking-widest text-right">Administrative Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-10 py-8"><div className="h-12 bg-slate-100 rounded-2xl w-64"></div></td>
                                        <td className="px-10 py-8"><div className="h-8 bg-slate-100 rounded-full w-24 mx-auto"></div></td>
                                        <td className="px-10 py-8"><div className="h-12 bg-slate-100 rounded-2xl w-40 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredOwners.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                                                <Filter className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-slate-900 italic uppercase">No stores detected</h3>
                                            <p className="text-slate-400 font-medium mt-2">Adjust your filters to see more results.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOwners.map((owner) => (
                                    <tr key={owner.id} className="hover:bg-slate-50/30 transition-all group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center font-semibold text-white text-lg shadow-lg rotate-2 group-hover:rotate-0 transition-transform">
                                                    {owner.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-slate-900 leading-tight uppercase italic text-base tracking-tight">{owner.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-semibold tracking-widest mt-1 uppercase">
                                                        {owner.domain}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <span className={`px-5 py-2 rounded-full text-[10px] font-semibold uppercase tracking-widest border transition-all ${owner.config?.showChat !== false
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'
                                                : 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm'
                                                }`}>
                                                {owner.config?.showChat !== false ? '● Active' : '○ Restricted'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button
                                                onClick={() => handleToggleChat(owner.id, owner.config?.showChat ?? true)}
                                                className={`px-6 py-3 rounded-2xl text-[10px] font-semibold uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ml-auto shadow-md ${owner.config?.showChat !== false
                                                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-100'
                                                    }`}
                                            >
                                                {owner.config?.showChat !== false ? (
                                                    <><XCircle className="w-4 h-4" /> Deactivate</>
                                                ) : (
                                                    <><ShieldCheck className="w-4 h-4" /> Activate</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Motion.div>
    );
};

export default LiveChatConfig;
