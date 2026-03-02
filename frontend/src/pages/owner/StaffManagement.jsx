import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { Users, Shield, User as UserIcon, Loader2, Search, CheckCircle2, UserPlus, Trash2, X, Mail, Lock, Phone, Activity, ArrowRight } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { getStoreMembers, createStaffAccount, getStaffRoles, updateStaffMember, getStaffActivity, deleteStaffMember } from '../../services/api.js';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext.js';
import UserAvatar from '../../components/UserAvatar.jsx';
import OwnerRoleManagement from './OwnerRoleManagement.jsx';
import { LayoutDashboard, Settings, Package, MessageSquare, ClipboardList, Headset } from 'lucide-react';
import { showConfirm } from '../../utils/swal.js';

const PERMISSION_MODULES = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
        id: 'pos',
        label: 'Commerce Suite',
        icon: Settings,
        subModules: [
            { id: 'pos_transactions', label: 'Transactions' },
            { id: 'pos_members', label: 'Member Management' },
            { id: 'pos_reports', label: 'Sales Reports' },
            { id: 'pos_rewards', label: 'Loyalty Rewards' },
            { id: 'pos_settings', label: 'Point Rules' }
        ]
    },
    { id: 'products', label: 'Inventory / Products', icon: Package },
    { id: 'chat_history', label: 'Chat History', icon: MessageSquare },
    { id: 'live_support', label: 'Live Support', icon: Headset },
    { id: 'tasks', label: 'Facility Tasks', icon: ClipboardList },
    { id: 'team', label: 'Staff & Team', icon: Users }
];

const StaffManagement = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roles, setRoles] = useState([]);
    const [showRoleModal, setShowRoleModal] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newStaff, setNewStaff] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        position: '',
        staffRoleId: ''
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editStaff, setEditStaff] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [selectedStaffForActivity, setSelectedStaffForActivity] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const fetchRoles = useCallback(async () => {
        try {
            const response = await getStaffRoles();
            if (response.status === 'success') {
                setRoles(response.roles);
            }
        } catch (error) {
            console.error('Failed to fetch roles', error);
        }
    }, []);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getStoreMembers();
            if (response.status === 'success') {
                setMembers(response.members);
            }
            fetchRoles();
        } catch (error) {
            console.error(error);
            showToast(t('staff.messages.load_error'), 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast, t, fetchRoles]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleUpdateStaff = async (e) => {
        e.preventDefault();
        if (!editStaff) return;
        setUpdateLoading(true);
        try {
            const response = await updateStaffMember(editStaff.id, {
                name: editStaff.name,
                phone: editStaff.phone,
                position: editStaff.position,
                staffRoleId: editStaff.staffRoleId,
                disabledMenus: editStaff.disabledMenus || []
            });
            if (response.status === 'success') {
                showToast(t('staff.messages.update_success') || 'Staff updated successfully', 'success');
                setMembers(members.map(m => m.id === editStaff.id ? { ...m, ...editStaff } : m));
                setShowEditModal(false);
                setEditStaff(null);
            }
        } catch (error) {
            console.error(error);
            showToast(t('staff.messages.update_error'), 'error');
        } finally {
            setUpdateLoading(false);
        }
    };

    const fetchStaffActivities = useCallback(async (staffId) => {
        setLoadingActivities(true);
        try {
            const res = await getStaffActivity(staffId);
            if (res.status === 'success') {
                setActivities(res.activities || []);
                // Optimistically clear the unread badge
                setMembers(prev => prev.map(m => m.id === staffId ? { ...m, unreadActivityCount: 0 } : m));
            }
        } catch (error) {
            console.error('Failed to fetch activities', error);
        } finally {
            setLoadingActivities(false);
        }
    }, []);

    useEffect(() => {
        if (showActivityModal && selectedStaffForActivity?.id) {
            fetchStaffActivities(selectedStaffForActivity.id);
        }
    }, [showActivityModal, selectedStaffForActivity?.id, fetchStaffActivities]);

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const response = await createStaffAccount(newStaff);
            if (response.status === 'success') {
                showToast(t('staff.messages.create_success'), 'success');
                setShowAddModal(false);
                setNewStaff({ name: '', email: '', password: '', phone: '', position: '', staffRoleId: '' });
                fetchMembers();
            }
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.message || t('staff.messages.create_error'), 'error');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteStaff = async (memberId) => {
        if (await showConfirm('Remove Staff?', t('staff.messages.confirm_delete') || 'Are you sure you want to remove this staff member? This will revoke all their access.', 'Yes, Remove', 'Keep Staff')) {
            try {
                const response = await deleteStaffMember(memberId);
                if (response.status === 'success') {
                    showToast(t('staff.messages.delete_success') || 'Staff removed successfully', 'success');
                    setMembers(members.filter(m => m.id !== memberId));
                    setSelectedIds(prev => prev.filter(id => id !== memberId));
                }
            } catch (error) {
                console.error(error);
                showToast(t('staff.messages.delete_error') || 'Failed to remove staff', 'error');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;

        const count = selectedIds.length;
        if (await showConfirm(
            `Remove ${count} Staff members?`,
            `Are you sure you want to remove ${count} selected staff members? This will revoke all their access.`,
            'Yes, Remove All',
            'Cancel'
        )) {
            try {
                const { bulkDeleteStaffMembers } = await import('../../services/api.js');
                const response = await bulkDeleteStaffMembers(selectedIds);
                if (response.status === 'success') {
                    showToast(response.message || 'Staff members removed successfully', 'success');
                    setMembers(members.filter(m => !selectedIds.includes(m.id)));
                    setSelectedIds([]);
                }
            } catch (error) {
                console.error(error);
                showToast('Failed to remove selected staff members', 'error');
            }
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = (membersToSelect) => {
        if (selectedIds.length === membersToSelect.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(membersToSelect.map(m => m.id));
        }
    };



    const filteredMembers = members.filter(m =>
        m.role === 'STAFF' &&
        (m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        m.id !== user.id
    );

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <div className="w-full mb-1">
                    <div className="mb-4">
                        <nav className="flex mb-5" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 text-sm font-medium md:space-x-2">
                                <li className="inline-flex items-center">
                                    <a href="#" className="inline-flex items-center text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white">
                                        <svg className="w-5 h-5 mr-2.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011-1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                                        <a href="#" className="ml-1 text-gray-700 hover:text-indigo-600 md:ml-2 dark:text-gray-300 dark:hover:text-white">Staff</a>
                                    </div>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                                        <span className="ml-1 text-gray-400 md:ml-2 dark:text-gray-500" aria-current="page">List</span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">{t('staff.title')}</h1>
                    </div>
                    <div className="sm:flex">
                        <div className="items-center hidden mb-3 sm:flex sm:divide-x sm:divide-gray-100 sm:mb-0 dark:divide-gray-700">
                            <form className="lg:pr-3" action="#" method="GET">
                                <label htmlFor="users-search" className="sr-only">Search</label>
                                <div className="relative mt-1 lg:w-64 xl:w-96">
                                    <input
                                        type="text"
                                        name="email"
                                        id="users-search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                                        placeholder={t('staff.search_placeholder')}
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="flex items-center ml-auto space-x-2 sm:space-x-3">
                            {selectedIds.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleBulkDelete}
                                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-center text-white bg-rose-600 rounded-lg hover:bg-rose-700 focus:ring-4 focus:ring-rose-300 sm:w-auto dark:bg-rose-600 dark:hover:bg-rose-700 dark:focus:ring-rose-800"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Selected ({selectedIds.length})
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center justify-center w-1/2 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 sm:w-auto dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800"
                            >
                                <svg className="w-5 h-5 mr-2 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                                {t('staff.add_btn')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowRoleModal(true)}
                                className="inline-flex items-center justify-center w-1/2 px-3 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-indigo-300 sm:w-auto dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                            >
                                <Shield className="w-5 h-5 mr-2 -ml-1" />
                                Roles
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="overflow-x-auto h-full">
                    <div className="inline-block min-w-full align-middle h-full">
                        <div className="overflow-hidden shadow h-full bg-white dark:bg-gray-800">
                            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="p-4 w-4">
                                            <div className="flex items-center">
                                                <input
                                                    id="checkbox-all"
                                                    aria-describedby="checkbox-1"
                                                    type="checkbox"
                                                    checked={filteredMembers.length > 0 && selectedIds.length === filteredMembers.length}
                                                    onChange={() => toggleSelectAll(filteredMembers)}
                                                    className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-indigo-300 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                            </div>
                                        </th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                            Name
                                        </th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                            Position
                                        </th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                            Email
                                        </th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                            Status
                                        </th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="p-4 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-4 py-10">
                                                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                                    <p className="text-gray-500 dark:text-gray-400">{t('staff.loading')}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredMembers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-10 text-center text-gray-500 dark:text-gray-400">
                                                <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                                {members.length === 0 ? t('staff.no_staff') : t('staff.no_matches', { term: searchTerm })}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMembers.map((member) => (
                                            <tr key={member.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <td className="p-4 w-4">
                                                    <div className="flex items-center">
                                                        <input
                                                            id={`checkbox-${member.id}`}
                                                            type="checkbox"
                                                            checked={selectedIds.includes(member.id)}
                                                            onChange={() => toggleSelect(member.id)}
                                                            className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-indigo-300 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                                                        />
                                                        <label htmlFor={`checkbox-${member.id}`} className="sr-only">checkbox</label>
                                                    </div>
                                                </td>
                                                <td className="flex items-center p-4 mr-12 space-x-6 whitespace-nowrap">
                                                    <UserAvatar user={member} size={40} />
                                                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                                        <div className="text-base font-semibold text-gray-900 dark:text-white">{member.name || t('staff.anon')}</div>
                                                        <div className="text-xs font-normal text-gray-500 dark:text-gray-400">{member.customerId || member.id.slice(0, 8)}</div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">
                                                        {member.position || 'Staff'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">{member.email}</td>
                                                <td className="p-4 text-base font-normal text-gray-900 whitespace-nowrap dark:text-white">
                                                    <div className="flex items-center">
                                                        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${member.status === 'OFFLINE' ? 'bg-gray-400' : 'bg-green-400'}`}></div>
                                                        {member.status === 'OFFLINE' ? t('staff.status.offline', 'Offline') : t('staff.status.active', 'Active')}
                                                    </div>
                                                </td>
                                                <td className="p-4 space-x-2 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditStaff({ ...member });
                                                            setShowEditModal(true);
                                                        }}
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900"
                                                    >
                                                        <Shield className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedStaffForActivity(member);
                                                            setShowActivityModal(true);
                                                        }}
                                                        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-slate-600 rounded-lg hover:bg-slate-700 focus:ring-4 focus:ring-slate-300 dark:focus:ring-slate-800"
                                                    >
                                                        <Activity className="w-4 h-4 mr-2" />
                                                        Activity
                                                        {member.unreadActivityCount > 0 && (
                                                            <div className="absolute inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -right-2 dark:border-gray-900">
                                                                {member.unreadActivityCount}
                                                            </div>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteStaff(member.id)}
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-rose-600 rounded-lg hover:bg-rose-700 focus:ring-4 focus:ring-rose-300 dark:focus:ring-rose-900"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showRoleModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRoleModal(false)}
                            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm dark:bg-gray-900/80"
                        />
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative z-10 dark:bg-gray-800"
                        >
                            <OwnerRoleManagement onClose={() => {
                                setShowRoleModal(false);
                                fetchRoles();
                            }} />
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm dark:bg-gray-900/80"
                        />
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100/50">
                                        <UserPlus size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {t('staff.form.title')}
                                        </h3>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Strategic Resource Enrollment
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateStaff} id="enroll-staff-form" className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-left">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('staff.form.name')}</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <UserIcon size={18} className="text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <input
                                                required
                                                type="text"
                                                placeholder={t('staff.form.name_placeholder')}
                                                value={newStaff.name}
                                                onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('staff.form.position')}</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Shield size={18} className="text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <select
                                                required
                                                value={newStaff.staffRoleId || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const role = roles.find(r => r.id === val);
                                                    setNewStaff({ ...newStaff, staffRoleId: val, position: role ? role.name : '' });
                                                }}
                                                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '0.75rem' }}
                                            >
                                                <option value="" disabled>-- Select Dynamic Role --</option>
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.id}>{role.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('staff.form.email')}</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <Mail size={18} className="text-gray-500 dark:text-gray-400" />
                                                </div>
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder={t('staff.form.email_placeholder')}
                                                    value={newStaff.email}
                                                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                                    className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('staff.form.phone')}</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <Phone size={18} className="text-gray-500 dark:text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder={t('staff.form.phone_placeholder')}
                                                    value={newStaff.phone}
                                                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                                    className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('staff.form.password')}</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Lock size={18} className="text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <input
                                                required
                                                type="password"
                                                placeholder={t('staff.form.password_placeholder')}
                                                value={newStaff.password}
                                                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <div className="flex items-center space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <button
                                    type="submit"
                                    form="enroll-staff-form"
                                    disabled={createLoading}
                                    className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-bold rounded-xl text-sm px-6 py-3 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 disabled:opacity-50 inline-flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none"
                                >
                                    {createLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            <span>{t('staff.form.submit')}</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-xl border border-gray-200 text-sm font-bold px-6 py-3 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showEditModal && editStaff && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowEditModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100/50">
                                        <Shield size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Modify Member Attributes</h3>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Resource Calibration — {editStaff.name}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateStaff} id="update-staff-form" className="flex-1 overflow-y-auto p-6 custom-scrollbar text-left">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Full Name</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <UserIcon className="text-gray-400 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    value={editStaff.name || ''}
                                                    onChange={(e) => setEditStaff({ ...editStaff, name: e.target.value })}
                                                    className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Phone Number</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <Phone className="text-gray-400 w-4 h-4" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={editStaff.phone || ''}
                                                    onChange={(e) => setEditStaff({ ...editStaff, phone: e.target.value })}
                                                    className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Position / Role Type</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <Shield className="text-gray-400 w-4 h-4" />
                                                </div>
                                                <select
                                                    value={editStaff.staffRoleId || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const role = roles.find(r => r.id === val);
                                                        setEditStaff({
                                                            ...editStaff,
                                                            staffRoleId: val,
                                                            position: role ? role.name : (editStaff.position || ''),
                                                            staffRole: role,
                                                            disabledMenus: []
                                                        });
                                                    }}
                                                    className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '0.75rem' }}
                                                >
                                                    <option value="" disabled>-- Select Role --</option>
                                                    {roles.map(role => (
                                                        <option key={role.id} value={role.id}>{role.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 md:border-l md:pl-8 border-gray-100 dark:border-gray-700">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400 mb-2">Custom Menu Access</h4>
                                            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mb-4 leading-relaxed italic">
                                                Precision access override. Checked modules grant active authorization.
                                            </p>
                                            <div className="space-y-3 max-h-[22rem] overflow-y-auto pr-2 custom-scrollbar">
                                                {(() => {
                                                    const isOverride = (editStaff.disabledMenus || []).includes('__OVERRIDE__');
                                                    const isValChecked = (modId) => {
                                                        if (isOverride) return !(editStaff.disabledMenus || []).includes(modId);
                                                        return editStaff.role === 'OWNER' || !!editStaff.staffRole?.permissions?.[modId];
                                                    };

                                                    const proceedToggle = (idToToggle, isCurrentlyChecked, relatedSubModules = [], parentId = null) => {
                                                        let currentDisabled = new Set(editStaff.disabledMenus || []);
                                                        if (!isOverride) {
                                                            currentDisabled = new Set(['__OVERRIDE__']);
                                                            PERMISSION_MODULES.forEach(m => {
                                                                if (!isValChecked(m.id)) currentDisabled.add(m.id);
                                                                if (m.subModules) {
                                                                    m.subModules.forEach(s => {
                                                                        if (!isValChecked(s.id)) currentDisabled.add(s.id);
                                                                    });
                                                                }
                                                            });
                                                        }

                                                        if (isCurrentlyChecked) {
                                                            currentDisabled.add(idToToggle);
                                                            relatedSubModules.forEach(s => currentDisabled.add(s.id));
                                                        } else {
                                                            currentDisabled.delete(idToToggle);
                                                            if (parentId) currentDisabled.delete(parentId);
                                                        }
                                                        setEditStaff({ ...editStaff, disabledMenus: Array.from(currentDisabled) });
                                                    };

                                                    return PERMISSION_MODULES.map(module => {
                                                        const isChecked = isValChecked(module.id);
                                                        const toggleModule = () => proceedToggle(module.id, isChecked, module.subModules || []);

                                                        return (
                                                            <div key={module.id} className="space-y-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={toggleModule}
                                                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${isChecked ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100/50 dark:border-indigo-800/50' : 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700/50'}`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`p-2 rounded-lg ${isChecked ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-50 dark:border-indigo-900/50' : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700'}`}>
                                                                            <module.icon size={16} />
                                                                        </div>
                                                                        <span className={`text-xs font-bold uppercase tracking-tight ${isChecked ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-500'}`}>
                                                                            {module.label}
                                                                        </span>
                                                                    </div>
                                                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
                                                                        {isChecked && <CheckCircle2 size={12} strokeWidth={3} className="text-white" />}
                                                                    </div>
                                                                </button>
                                                                {module.subModules && isChecked && (
                                                                    <div className="pl-14 pr-2 space-y-2 pb-2">
                                                                        {module.subModules.map(sub => {
                                                                            const isSubChecked = isValChecked(sub.id);
                                                                            const toggleSub = () => proceedToggle(sub.id, isSubChecked, [], module.id);

                                                                            return (
                                                                                <button
                                                                                    type="button"
                                                                                    key={sub.id}
                                                                                    onClick={toggleSub}
                                                                                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left ${isSubChecked ? 'bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/30 shadow-sm' : 'bg-gray-50/30 dark:bg-gray-900/20 border-gray-100 dark:border-gray-700/30'}`}
                                                                                >
                                                                                    <span className={`text-[10px] font-bold uppercase tracking-wide ${isSubChecked ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-400'}`}>
                                                                                        {sub.label}
                                                                                    </span>
                                                                                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${isSubChecked ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                                                                                        {isSubChecked && <CheckCircle2 size={10} strokeWidth={4} />}
                                                                                    </div>
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <div className="flex items-center space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <button
                                    type="submit"
                                    form="update-staff-form"
                                    disabled={updateLoading}
                                    className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-bold rounded-xl text-sm px-6 py-3 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 disabled:opacity-50 inline-flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none"
                                >
                                    {updateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>
                                            <CheckCircle2 size={16} />
                                            <span>Save Calibration</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-xl border border-gray-200 text-sm font-bold px-6 py-3 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Activity Modal */}
            <AnimatePresence>
                {showActivityModal && selectedStaffForActivity && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowActivityModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <header className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shrink-0">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Activity Log</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Viewing recent actions for {selectedStaffForActivity?.name}</p>
                                </div>
                                <button onClick={() => setShowActivityModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </header>

                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50 dark:bg-gray-900/50">
                                {loadingActivities ? (
                                    <div className="flex justify-center items-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                    </div>
                                ) : activities.length === 0 ? (
                                    <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">
                                        No recent activity found for this staff member.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {activities.map(activity => (
                                            <div key={activity.id} className="relative pl-6 sm:pl-8 py-2 group">
                                                <div className="absolute left-0 top-3 bottom-0 w-px bg-gray-200 dark:bg-gray-300 dark:bg-gray-700 group-last:bg-transparent" />
                                                <div className="absolute left-[0px] sm:left-[0px] top-[14px] w-[9px] h-[9px] rounded-full bg-indigo-400 border-[2px] border-white dark:border-gray-800" />
                                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                                                            {activity.action.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded">
                                                            {format(new Date(activity.createdAt), 'MMM d, yyyy HH:mm')}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{activity.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <footer className="p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowActivityModal(false)}
                                    className="w-full py-3 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all"
                                >
                                    Close
                                </button>
                            </footer>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StaffManagement;
