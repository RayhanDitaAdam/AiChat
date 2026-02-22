import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Search, Plus, MoreHorizontal, Edit, Eye, Trash2, Archive,
    Filter, Download, ChevronLeft, ChevronRight, X, UserPlus,
    Check, AlertTriangle
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import UserAvatar from '../../components/UserAvatar';

const AccountOwners = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [owners, setOwners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    // Form states
    const [editFormData, setEditFormData] = useState({
        name: '',
        domain: '',
        isApproved: false,
        isBlocked: false
    });

    React.useEffect(() => {
        if (selectedUser && isEditModalOpen) {
            setEditFormData({
                name: selectedUser.name || '',
                domain: selectedUser.domain || '',
                isApproved: selectedUser.isApproved || false,
                isBlocked: selectedUser.user?.isBlocked || false
            });
        }
    }, [selectedUser, isEditModalOpen]);

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const api = await import('../../services/api');
            await api.updateAdminOwner(selectedUser.id, editFormData);
            setIsEditModalOpen(false);
            fetchOwners();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update owner');
        } finally {
            setIsProcessing(false);
        }
    };

    const fetchOwners = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const api = await import('../../services/api');
            const response = await api.getAdminOwners();
            if (response.status === 'success') {
                setOwners(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch owners:', err);
            setError('Failed to load owners');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchOwners();
    }, []);

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setIsProcessing(true);
        try {
            const api = await import('../../services/api');
            await api.deleteAdminOwner(selectedUser.id);
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
            fetchOwners();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete owner');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredOwners = owners.filter(owner =>
        owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.domain?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('nav.account_owners')}</h1>
                    <p className="text-slate-500 mt-1">Manage and monitor platform account owners and their accounts.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Filters & Search */}
            <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
                <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                                <Archive className="w-3.5 h-3.5" />
                                Archive all
                            </button>
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 bg-white border border-rose-100 rounded-xl hover:bg-rose-50 transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete all
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5">
                            <option value="">All Roles</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                        </select>
                        <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5">
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Account Type</th>
                                <th className="px-6 py-4 font-semibold">Growth Rating</th>
                                <th className="px-6 py-4 font-semibold">Country</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-medium">
                                        Loading owners...
                                    </td>
                                </tr>
                            ) : filteredOwners.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-medium">
                                        No owners found.
                                    </td>
                                </tr>
                            ) : (
                                filteredOwners.map((u) => (
                                    <Motion.tr
                                        key={u.id}
                                        initial="hidden"
                                        animate="show"
                                        variants={itemVariants}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar user={u.user} size={40} />
                                                <div>
                                                    <div className="font-semibold text-slate-900">{u.name}</div>
                                                    <div className="text-xs text-slate-400">{u.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                                            {u.domain}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                                {u.businessCategory || 'RETAIL'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {u.user?.isBlocked ? 'Blocked' : 'Verified'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${u.isApproved
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                {u.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedUser(u); setIsViewModalOpen(true); }}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedUser(u); setIsEditModalOpen(true); }}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedUser(u); setIsDeleteModalOpen(true); }}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </Motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination placeholder */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                        Showing {filteredOwners.length} of {owners.length} owners
                    </span>
                    <div className="flex items-center gap-1">
                        <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </Motion.div>

            {/* Modals */}
            <AnimatePresence>
                {isViewModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsViewModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
                        >
                            <div className="p-8 pb-0 flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 mb-4 border-4 border-white shadow-xl">
                                    {selectedUser.name?.[0]}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">{selectedUser.name}</h3>
                                <p className="text-slate-500 text-sm mb-6">{selectedUser.user?.email}</p>
                            </div>
                            <div className="p-8 pt-0 space-y-6">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Domain</p>
                                        <p className="font-semibold text-slate-700">{selectedUser.domain}.heart.ai</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</p>
                                        <p className="font-semibold text-slate-700">{selectedUser.businessCategory || 'RETAIL'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Approval Status</p>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block ${selectedUser.isApproved
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {selectedUser.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Status</p>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block ${!selectedUser.user?.isBlocked
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : 'bg-rose-50 text-rose-600'
                                            }`}>
                                            {!selectedUser.user?.isBlocked ? 'Active' : 'Blocked'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center">
                                <button onClick={() => setIsViewModalOpen(false)} className="w-full bg-white hover:bg-slate-50 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all border border-slate-200 shadow-sm">
                                    Close Details
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                )}

                {
                    isEditModalOpen && selectedUser && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <Motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsEditModalOpen(false)}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            />
                            <Motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                    <h3 className="text-xl font-bold text-slate-900">Edit Owner: {selectedUser.name}</h3>
                                    <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                                <div className="p-6 overflow-y-auto">
                                    <form onSubmit={handleUpdateUser} className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Store Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={editFormData.name}
                                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Domain</label>
                                            <input
                                                type="text"
                                                required
                                                value={editFormData.domain}
                                                onChange={(e) => setEditFormData({ ...editFormData, domain: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Approval Status</label>
                                                <select
                                                    value={editFormData.isApproved ? 'true' : 'false'}
                                                    onChange={(e) => setEditFormData({ ...editFormData, isApproved: e.target.value === 'true' })}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                >
                                                    <option value="true">Approved</option>
                                                    <option value="false">Pending</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">User Status</label>
                                                <select
                                                    value={editFormData.isBlocked ? 'true' : 'false'}
                                                    onChange={(e) => setEditFormData({ ...editFormData, isBlocked: e.target.value === 'true' })}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                >
                                                    <option value="false">Active</option>
                                                    <option value="true">Blocked</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 sticky bottom-0 -mx-6 -mb-6 mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditModalOpen(false)}
                                                className="px-6 py-2 text-sm font-semibold text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isProcessing}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-200 flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isProcessing ? 'Saving...' : <><Check className="w-4 h-4" /> Save Changes</>}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </Motion.div>
                        </div>
                    )
                }

                {
                    isDeleteModalOpen && selectedUser && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <Motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            />
                            <Motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
                            >
                                <div className="p-8 pb-0 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mx-auto mb-4 border border-rose-100">
                                        <AlertTriangle className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Delete User?</h3>
                                    <p className="text-slate-500 text-sm">
                                        Are you sure you want to delete <span className="font-bold text-slate-900">{selectedUser.name}</span>? This action cannot be undone.
                                    </p>
                                </div>
                                <div className="p-8 flex items-center gap-3">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        disabled={isProcessing}
                                        className="flex-1 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteUser}
                                        disabled={isProcessing}
                                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-rose-200 disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Deleting...' : 'Confirm Delete'}
                                    </button>
                                </div>
                            </Motion.div>
                        </div>
                    )
                }
            </AnimatePresence>
        </div>
    );
};

export default AccountOwners;
