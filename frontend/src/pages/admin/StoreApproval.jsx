import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminOwners, approveOwner, updateOwnerConfig, updateOwnerCategory, updateAdminUserMenus } from '../../services/api.js';
import { CheckCircle, XCircle, Eye, EyeOff, MessageSquare, ShieldCheck, Mail, Globe, Layout, ChevronDown, Settings as SettingsIcon, X, Package } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext.js';
import { PATHS } from '../../routes/paths.js';

const MENU_GROUPS = [
    {
        id: 'POS_SYSTEM',
        label: 'POS SYSTEM',
        menus: [
            'OWNER_POS_SYSTEM', 'OWNER_POS', 'OWNER_MEMBERS', 'OWNER_REPORTS', 'OWNER_REWARDS', 'OWNER_HEALTH',
            'POS System'
        ]
    },
    {
        id: 'CORE_FEATURES',
        label: 'CORE FEATURES',
        menus: [
            'Skincare (Chat Assistant)', 'Chat Assistant', 'Shopping Queue', 'Wallet', 'Profile'
        ]
    }
];

const StoreApproval = () => {
    const { showToast } = useToast();
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menuModal, setMenuModal] = useState({ open: false, owner: null });

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
            showToast(`Store ${status ? 'approved' : 'revoked'} successfully`, 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to update approval status', 'error');
        }
    };

    const handleCategoryChange = async (ownerId, category) => {
        try {
            await updateOwnerCategory(ownerId, category);
            setOwners(prev => prev.map(o => o.id === ownerId ? { ...o, businessCategory: category } : o));
            showToast('Category updated successfully', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to update category', 'error');
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

    const handleUpdateMenus = async () => {
        if (!menuModal.owner) return;
        try {
            const userId = menuModal.owner.user.id;
            const disabledMenus = menuModal.disabledMenus;
            await updateAdminUserMenus(userId, disabledMenus);

            setOwners(prev => prev.map(o => {
                if (o.id === menuModal.owner.id) {
                    return { ...o, user: { ...o.user, disabledMenus } };
                }
                return o;
            }));

            showToast('Menus updated successfully', 'success');
            setMenuModal({ open: false, owner: null });
        } catch (error) {
            console.error(error);
            showToast('Failed to update menus', 'error');
        }
    };

    const toggleMenu = (groupId) => {
        setMenuModal(prev => {
            const group = MENU_GROUPS.find(g => g.id === groupId);
            const allInGroupDisabled = group.menus.every(m => prev.disabledMenus.includes(m));

            let newList;
            if (allInGroupDisabled) {
                // If all are disabled, enable all (remove from disabled list)
                newList = prev.disabledMenus.filter(m => !group.menus.includes(m));
            } else {
                // Otherwise, disable all (add all to disabled list)
                const uniqueNewMenus = [...new Set([...prev.disabledMenus, ...group.menus])];
                newList = uniqueNewMenus;
            }

            return { ...prev, disabledMenus: newList };
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">Store Management<span className="text-sky-500">.</span></h1>
                <p className="text-slate-500 font-medium">Manage merchant categories, accessibility, and feature visibility.</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {owners.map((owner, idx) => (
                    <Motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={owner.id}
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:border-sky-100 transition-all"
                    >
                        <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${owner.isApproved ? 'bg-sky-50' : 'bg-slate-100'}`}>
                                <ShieldCheck className={`w-7 h-7 ${owner.isApproved ? 'text-sky-500' : 'text-slate-400'}`} />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-xl text-slate-900">{owner.name}</h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium italic">
                                        <Globe className="w-3.5 h-3.5" /> {owner.domain}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                        <Mail className="w-3.5 h-3.5" /> {owner.user?.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Category Selector */}
                            <div className="relative group">
                                <select
                                    value={owner.businessCategory || 'RETAIL'}
                                    onChange={(e) => handleCategoryChange(owner.id, e.target.value)}
                                    className="appearance-none bg-slate-50 border border-slate-100 text-slate-900 text-[10px] font-semibold uppercase tracking-widest rounded-xl focus:ring-sky-500 focus:border-sky-500 block w-full px-4 py-2.5 pr-8 cursor-pointer hover:bg-white transition-all outline-none"
                                >
                                    <option value="RETAIL">Retail / Shop</option>
                                    <option value="HOTEL">Hotel / Stay</option>
                                    <option value="SERVICE">Service / Office</option>
                                </select>
                                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            {/* Menu Visibility Button */}
                            <button
                                onClick={() => setMenuModal({
                                    open: true,
                                    owner,
                                    disabledMenus: owner.user?.disabledMenus || []
                                })}
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-white hover:text-sky-600 transition-all border border-slate-100"
                            >
                                <Layout className="w-3.5 h-3.5" />
                                Menus
                            </button>

                            {/* Feature Toggles */}
                            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                <button
                                    onClick={() => handleToggleConfig(owner.id, 'showInventory', owner.config?.showInventory !== false)}
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
                                    className="px-6 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100"
                                >
                                    REVOKE
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleApprove(owner.id, true)}
                                    className="px-6 py-2.5 bg-sky-500 text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-sky-600 transition-all shadow-lg shadow-sky-100"
                                >
                                    APPROVE
                                </button>
                            )}
                        </div>
                    </Motion.div>
                ))}
            </div>

            {/* Menu Management Modal */}
            <AnimatePresence>
                {menuModal.open && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
                        >
                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Menu Visibility</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{menuModal.owner?.name}</p>
                                </div>
                                <button
                                    onClick={() => setMenuModal({ open: false, owner: null })}
                                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 transition-all shadow-sm"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 max-h-[60vh] overflow-y-auto">
                                <div className="flex flex-col gap-3">
                                    {MENU_GROUPS.map(group => {
                                        const isHidden = group.menus.every(m => menuModal.disabledMenus.includes(m));
                                        return (
                                            <button
                                                key={group.id}
                                                onClick={() => toggleMenu(group.id)}
                                                className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${isHidden
                                                    ? 'bg-slate-50 border-slate-100 text-slate-400 grayscale'
                                                    : 'bg-white border-sky-100 text-slate-900 shadow-sm'
                                                    }`}
                                            >
                                                <span className="text-xs font-semibold uppercase tracking-widest">{group.label}</span>
                                                <div className={`w-8 h-8 rounded-2xl flex items-center justify-center transition-all ${isHidden ? 'bg-slate-200' : 'bg-emerald-500 shadow-lg shadow-emerald-100'
                                                    }`}>
                                                    {isHidden ? <XCircle size={18} className="text-slate-400" /> : <CheckCircle size={18} className="text-white" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-8 pt-0">
                                <button
                                    onClick={handleUpdateMenus}
                                    className="w-full py-4 bg-sky-500 text-white rounded-2xl text-xs font-semibold uppercase tracking-[0.2em] hover:bg-sky-600 transition-all shadow-xl shadow-sky-100"
                                >
                                    SAVE SETTINGS
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StoreApproval;
