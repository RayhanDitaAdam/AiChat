import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { Users, Shield, User as UserIcon, Loader2, Search, CheckCircle2, UserPlus, Trash2, X, Mail, Lock, Phone } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { getStoreMembers, updateMemberRole, createStaffAccount } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';

const StaffManagement = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newStaff, setNewStaff] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        position: ''
    });

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getStoreMembers();
            if (response.status === 'success') {
                setMembers(response.members);
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to load team members', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleRoleUpdate = async (memberId, currentRole) => {
        const newRole = currentRole === 'STAFF' ? 'USER' : 'STAFF';
        setUpdatingId(memberId);
        try {
            const response = await updateMemberRole(memberId, newRole);
            if (response.status === 'success') {
                showToast(`Role updated to ${newRole}`, 'success');
                setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to update role', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const response = await createStaffAccount(newStaff);
            if (response.status === 'success') {
                showToast('Staff account created successfully!', 'success');
                setShowAddModal(false);
                setNewStaff({ name: '', email: '', password: '', phone: '', position: '' });
                fetchMembers();
            }
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.message || 'Failed to create staff account', 'error');
        } finally {
            setCreateLoading(false);
        }
    };

    const filteredMembers = members.filter(m =>
        m.role === 'STAFF' &&
        (m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        m.id !== user.id
    );

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Team Management</h1>
                    <p className="text-slate-500 font-medium text-lg mt-1">Manage your store staff and member roles</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm font-bold text-slate-700"
                        />
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black rounded-3xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                    >
                        <UserPlus className="w-5 h-5" />
                        Add New Staff
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading members...</p>
                </div>
            ) : members.length === 0 ? (
                <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100"
                >
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Users className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">No Staff Members Found</h3>
                    <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
                        You haven't created any staff accounts yet. Click the "Add New Staff" button to get started.
                    </p>
                </Motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredMembers.map((member, idx) => (
                        <Motion.div
                            key={member.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group overflow-hidden relative"
                        >
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border-2 border-white shadow-sm">
                                    {member.image ? (
                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <UserIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-slate-900 truncate">{member.name || 'Anonymous User'}</h3>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${member.role === 'STAFF'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {member.role}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium truncate">{member.email}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter">{member.customerId}</p>
                                        {member.position && (
                                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-black uppercase tracking-widest">{member.position}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRoleUpdate(member.id, member.role)}
                                        disabled={updatingId === member.id}
                                        className="px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
                                    >
                                        {updatingId === member.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>Remove Staff</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Decorative Background Icon */}
                            <Shield className={`absolute -bottom-8 -right-8 w-32 h-32 opacity-[0.03] transition-transform group-hover:rotate-12 ${member.role === 'STAFF' ? 'text-amber-600' : 'text-slate-600'
                                }`} />
                        </Motion.div>
                    ))}

                    {filteredMembers.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-slate-400 font-black italic">No matches for "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Staff Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl relative z-10"
                        >
                            <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                        <UserPlus className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Add New Staff</h3>
                                        <p className="text-slate-500 font-medium text-xs">Create a direct account for your employee</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateStaff} className="form grid gap-6 p-8">
                                <div className="grid gap-2">
                                    <label htmlFor="staff-name">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        id="staff-name"
                                        placeholder="John Doe"
                                        value={newStaff.name}
                                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                    />
                                    <p className="text-muted-foreground text-sm">Masukan nama lengkap staff baru bre.</p>
                                </div>

                                <div className="grid gap-2">
                                    <label htmlFor="staff-email">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        id="staff-email"
                                        placeholder="staff@store.com"
                                        value={newStaff.email}
                                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                    />
                                    <p className="text-muted-foreground text-sm">Email buat lojin staff ke dashboard.</p>
                                </div>

                                <div className="grid gap-2">
                                    <label htmlFor="staff-position">Job Position</label>
                                    <input
                                        required
                                        type="text"
                                        id="staff-position"
                                        placeholder="e.g. Cleaner, Security, CS"
                                        value={newStaff.position}
                                        onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value })}
                                    />
                                    <p className="text-muted-foreground text-sm">Role kerjaan mereka di toko lu bre.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="grid gap-2">
                                        <label htmlFor="staff-password">Password</label>
                                        <input
                                            required
                                            type="password"
                                            id="staff-password"
                                            placeholder="••••••••"
                                            value={newStaff.password}
                                            onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                        />
                                        <p className="text-muted-foreground text-sm">Maksimal 8 karakter bre.</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="staff-phone">Phone (Optional)</label>
                                        <input
                                            type="text"
                                            id="staff-phone"
                                            placeholder="0812..."
                                            value={newStaff.phone}
                                            onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                        />
                                        <p className="text-muted-foreground text-sm">Nomor WhatsApp staff bre.</p>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95 text-xs uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="btn flex-[2] py-4 h-auto font-black uppercase tracking-widest text-xs"
                                    >
                                        {createLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Create Account</>}
                                    </button>
                                </div>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StaffManagement;
