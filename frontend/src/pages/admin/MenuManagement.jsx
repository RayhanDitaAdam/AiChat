import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, Menu, Search, CheckCircle2, XCircle, Lock, Unlock } from 'lucide-react';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { useAuth } from '../../hooks/useAuth.js';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const MenuManagement = () => {
    const { showToast } = useToast();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [selectedUser, setSelectedUser] = useState(null);
    const [saving, setSaving] = useState(false);

    const allMenus = [
        'Skincare (Chat Assistant)', 'Shopping Queue', 'Wallet', 'Profile',
        'POS System', 'Analytics', 'Stores & Approval',
        'Missing Requests', 'System Config', 'Menu Management'
    ];

    const fetchUsers = useCallback(async () => {
        try {
            const res = await api.get('/admin/users');
            if (res.data.status === 'success') {
                setUsers(res.data.data);
            }
        } catch {
            showToast('Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleToggleMenu = (menuName) => {
        if (!selectedUser) return;

        // Critical Protection: Admin cannot disable Menu Management for themselves or other admins
        if (menuName === 'Menu Management' && selectedUser.role === 'ADMIN') {
            showToast('Security Alert: You cannot disable Menu Management for an Administrator!', 'warning');
            return;
        }

        const currentDisabled = [...selectedUser.disabledMenus];
        if (currentDisabled.includes(menuName)) {
            setSelectedUser({
                ...selectedUser,
                disabledMenus: currentDisabled.filter(m => m !== menuName)
            });
        } else {
            setSelectedUser({
                ...selectedUser,
                disabledMenus: [...currentDisabled, menuName]
            });
        }
    };

    const handleSave = async () => {
        if (!selectedUser || saving) return;
        setSaving(true);
        try {
            const res = await api.patch(`/admin/users/${selectedUser.id}/menus`, {
                disabledMenus: selectedUser.disabledMenus
            });
            if (res.data.status === 'success') {
                showToast('Menu visibility updated successfully!', 'success');
                setUsers(users.map(u => u.id === selectedUser.id ? { ...u, disabledMenus: selectedUser.disabledMenus } : u));
                setSelectedUser(null);
            }
        } catch {
            showToast('Failed to update menus', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleBlock = async () => {
        if (!selectedUser || saving) return;

        // Critical Protection: Prevent self-blocking or blocking other admins
        if (selectedUser.id === currentUser?.id) {
            showToast('Are you crazy? You cannot block your own account!', 'error');
            return;
        }

        if (selectedUser.role === 'ADMIN') {
            showToast('Security Violation: You cannot block another Administrator!', 'error');
            return;
        }

        setSaving(true);
        try {
            const res = await api.patch(`/admin/users/${selectedUser.id}/block`, {
                isBlocked: !selectedUser.isBlocked
            });
            if (res.data.status === 'success') {
                showToast(`User ${selectedUser.isBlocked ? 'unblocked' : 'blocked'} successfully!`, 'success');
                setUsers(users.map(u => u.id === selectedUser.id ? { ...u, isBlocked: !selectedUser.isBlocked } : u));
                setSelectedUser({ ...selectedUser, isBlocked: !selectedUser.isBlocked });
            }
        } catch {
            showToast('Failed to toggle block status', 'error');
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        // Only show OWNER users in the list
        return matchesSearch && matchesRole && u.role === 'OWNER';
    });

    const roleStats = {
        ALL: users.filter(u => u.role === 'OWNER').length,
        OWNER: users.filter(u => u.role === 'OWNER').length
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8 pb-20">

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <h1 className="text-4xl font-semibold text-slate-900 tracking-tight italic uppercase">
                        Menu Protocols<span className="text-indigo-600">.</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Control administrative and operational access across all user entities.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    {/* Role Filter Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                        {['ALL', 'OWNER'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-5 py-2.5 rounded-xl font-semibold text-[10px] uppercase tracking-widest transition-all relative ${roleFilter === role
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {role}
                                {roleStats[role] > 0 && (
                                    <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[8px] ${roleFilter === role ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                        {roleStats[role]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Identify target..."
                            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none w-full md:w-64 transition-all shadow-sm font-medium focus:border-indigo-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-medium uppercase tracking-widest text-slate-500">User</th>
                                    <th className="px-6 py-4 text-[10px] font-medium uppercase tracking-widest text-slate-500">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-medium uppercase tracking-widest text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-medium uppercase tracking-widest text-slate-500 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className={`group hover:bg-slate-50/50 transition-colors ${selectedUser?.id === u.id ? 'bg-indigo-50/30' : ''}`}>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-xs ${u.role === 'ADMIN' ? 'bg-sky-50 text-sky-600' :
                                                    u.role === 'OWNER' ? 'bg-emerald-50 text-emerald-600' :
                                                        'bg-indigo-50 text-indigo-600'
                                                    }`}>
                                                    {u.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{u.name || 'No Name'}</p>
                                                    <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest border ${u.role === 'ADMIN' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                                                u.role === 'OWNER' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-xs font-bold text-slate-500">
                                                    {u.disabledMenus.length > 0
                                                        ? `${u.disabledMenus.length} Menus Hidden`
                                                        : 'All Menus Visible'}
                                                </p>
                                                {u.isBlocked && (
                                                    <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-widest flex items-center gap-1">
                                                        <Lock className="w-3 h-3" /> Blocked
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <button
                                                onClick={() => setSelectedUser(u)}
                                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Management Panel */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedUser ? (
                            <Motion.div
                                key="panel"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-8 sticky top-8"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Manage Menus</h2>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{selectedUser.name}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">
                                            Toggle Visibility
                                        </p>
                                        <div className="space-y-3">
                                            {allMenus.map(name => {
                                                // Handle mapping for Skincare (Chat Assistant)
                                                const storageName = name === 'Skincare (Chat Assistant)' ? 'Chat Assistant' : name;
                                                const isDisabled = selectedUser.disabledMenus.includes(storageName);
                                                return (
                                                    <button
                                                        key={name}
                                                        onClick={() => handleToggleMenu(storageName)}
                                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isDisabled
                                                            ? 'bg-slate-50 border-slate-100 text-slate-400 grayscale'
                                                            : 'bg-white border-indigo-100 text-indigo-600 shadow-sm'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {isDisabled ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                                            <span className="font-bold text-sm tracking-tight">{name}</span>
                                                        </div>
                                                        <div className={`w-10 h-5 rounded-full relative transition-colors ${isDisabled ? 'bg-slate-200' : 'bg-indigo-600'}`}>
                                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDisabled ? 'left-1' : 'left-6'}`} />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Visibility'}
                                    </button>

                                    <button
                                        onClick={handleToggleBlock}
                                        disabled={saving}
                                        className={`w-full py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${selectedUser.isBlocked
                                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100'
                                            }`}
                                    >
                                        {selectedUser.isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                        {selectedUser.isBlocked ? 'Unblock Account' : 'Block Account'}
                                    </button>

                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="w-full py-4 bg-slate-100 text-slate-900 rounded-2xl font-semibold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Motion.div>
                        ) : (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center space-y-4 flex flex-col items-center justify-center sticky top-8">
                                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-300 shadow-sm">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-slate-900 font-semibold text-lg">No User Selected</h3>
                                    <p className="text-slate-400 text-sm font-medium">Select a user from the list to manage their menu access permissions.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MenuManagement;
