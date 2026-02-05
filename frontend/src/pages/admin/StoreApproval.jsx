import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminOwners, approveOwner, updateOwnerConfig } from '../../services/api.js';
import { CheckCircle, XCircle, Eye, EyeOff, MessageSquare, ShieldCheck, Mail, Globe } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext.js';

const StoreApproval = () => {
    const { showToast } = useToast();
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOwners();
    }, []);

    const fetchOwners = async () => {
        try {
            const res = await getAdminOwners();
            if (res.status === 'success') {
                setOwners(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch owners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (ownerId, status) => {
        try {
            await approveOwner(ownerId, status);
            setOwners(prev => prev.map(o => o.id === ownerId ? { ...o, isApproved: status } : o));
        } catch (error) {
            console.error(error);
            showToast('Failed to update approval status', 'error');
        }
    };

    const handleToggleConfig = async (ownerId, field, currentVal) => {
        try {
            const newConfig = { [field]: !currentVal };
            await updateOwnerConfig(ownerId, newConfig);
            setOwners(prev => prev.map(o => {
                if (o.id === ownerId) {
                    return { ...o, config: { ...o.config, ...newConfig } };
                }
                return o;
            }));
        } catch (error) {
            console.error(error);
            showToast('Failed to update config', 'error');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
    );

    return (
        <div className="space-y-8">

            <header>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Stores & Approvals<span className="text-sky-500">.</span></h1>
                <p className="text-slate-500 font-medium">Manage merchant access and feature visibility.</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {owners.map((owner, idx) => (
                    <Motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={owner.id}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-sky-100 transition-all"
                    >
                        <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${owner.isApproved ? 'bg-sky-50' : 'bg-slate-100'}`}>
                                <ShieldCheck className={`w-7 h-7 ${owner.isApproved ? 'text-sky-500' : 'text-slate-400'}`} />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-slate-900">{owner.name}</h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                        <Globe className="w-3.5 h-3.5" /> {owner.domain}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                        <Mail className="w-3.5 h-3.5" /> {owner.user?.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Feature Toggles */}
                            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100 mr-2">
                                <button
                                    onClick={() => handleToggleConfig(owner.id, 'showInventory', owner.config?.showInventory ?? true)}
                                    className={`p-2 rounded-lg transition-all ${owner.config?.showInventory !== false ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    title={owner.config?.showInventory !== false ? "Disable Inventory View" : "Enable Inventory View"}
                                >
                                    {owner.config?.showInventory !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Approval Buttons */}
                            {owner.isApproved ? (
                                <button
                                    onClick={() => handleApprove(owner.id, false)}
                                    className="px-6 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-black tracking-widest hover:bg-rose-100 transition-all border border-rose-100"
                                >
                                    REVOKE
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleApprove(owner.id, true)}
                                    className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                                >
                                    APPROVE
                                </button>
                            )}
                        </div>
                    </Motion.div>
                ))}
            </div>
        </div>
    );
};

export default StoreApproval;
