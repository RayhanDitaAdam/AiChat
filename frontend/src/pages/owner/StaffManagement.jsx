import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { Users, Shield, User as UserIcon, Loader2, Search, CheckCircle2, UserPlus, Trash2, X, Mail, Lock, Phone } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { getStoreMembers, createStaffAccount, getStaffRoles, createStaffRole, deleteStaffRole, updateStaffMember } from '../../services/api.js';

import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext.js';
import UserAvatar from '../../components/UserAvatar.jsx';

const StaffManagement = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roles, setRoles] = useState([]);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [roleLoading, setRoleLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newStaff, setNewStaff] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        position: ''
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editStaff, setEditStaff] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);

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
            const response = await updateStaffMember(editStaff.id, editStaff);
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

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const response = await createStaffAccount(newStaff);
            if (response.status === 'success') {
                showToast(t('staff.messages.create_success'), 'success');
                setShowAddModal(false);
                setNewStaff({ name: '', email: '', password: '', phone: '', position: '' });
                fetchMembers();
            }
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.message || t('staff.messages.create_error'), 'error');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleCreateRole = async (e) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;
        setRoleLoading(true);
        try {
            const response = await createStaffRole(newRoleName);
            if (response.status === 'success') {
                showToast('Role created successfully', 'success');
                setRoles([...roles, response.role]);
                setNewRoleName('');
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to create role', 'error');
        } finally {
            setRoleLoading(false);
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (!window.confirm('Are you sure you want to delete this role?')) return;
        try {
            const response = await deleteStaffRole(roleId);
            if (response.status === 'success') {
                showToast('Role deleted', 'success');
                setRoles(roles.filter(r => r.id !== roleId));
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to delete role', 'error');
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
                            className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl relative z-10 dark:bg-gray-800"
                        >
                            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Manage Roles
                                </h3>
                                <button onClick={() => setShowRoleModal(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <form onSubmit={handleCreateRole} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="New Role Name (e.g. Cashier)"
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newRoleName.trim() || roleLoading}
                                        className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none dark:focus:ring-indigo-800 disabled:opacity-50"
                                    >
                                        {roleLoading ? <Loader2 className="w-5 h-4 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                                    </button>
                                </form>

                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {roles.length === 0 ? (
                                        <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">No custom roles created yet.</p>
                                    ) : (
                                        roles.map(role => (
                                            <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                                                <span className="font-medium text-gray-900 dark:text-white">{role.name}</span>
                                                <button
                                                    onClick={() => handleDeleteRole(role.id)}
                                                    className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors dark:hover:bg-rose-900/20"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
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
                            className="bg-white rounded-lg w-full max-w-lg overflow-hidden shadow-xl relative z-10 dark:bg-gray-800"
                        >
                            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {t('staff.form.title')}
                                </h3>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateStaff} className="p-6 space-y-6">
                                <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="staff-name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('staff.form.name')}</label>
                                        <input
                                            required
                                            type="text"
                                            id="staff-name"
                                            placeholder={t('staff.form.name_placeholder')}
                                            value={newStaff.name}
                                            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="staff-position" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('staff.form.position')}</label>
                                        <select
                                            required
                                            id="staff-position"
                                            value={newStaff.position}
                                            onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value })}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                                        >
                                            <option value="" disabled>Select an option</option>
                                            <optgroup label="Custom Roles">
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.name}>{role.name}</option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="Standard Roles">
                                                <option value="Staff">General Staff</option>
                                                <option value="Cashier">Cashier</option>
                                                <option value="Inventory">Inventory</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="staff-email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('staff.form.email')}</label>
                                        <input
                                            required
                                            type="email"
                                            id="staff-email"
                                            placeholder={t('staff.form.email_placeholder')}
                                            value={newStaff.email}
                                            onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="staff-phone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('staff.form.phone')}</label>
                                        <input
                                            type="text"
                                            id="staff-phone"
                                            placeholder={t('staff.form.phone_placeholder')}
                                            value={newStaff.phone}
                                            onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <label htmlFor="staff-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t('staff.form.password')}</label>
                                        <input
                                            required
                                            type="password"
                                            id="staff-password"
                                            placeholder={t('staff.form.password_placeholder')}
                                            value={newStaff.password}
                                            onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-700">
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 disabled:opacity-50"
                                    >
                                        {createLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('staff.form.submit')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
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
                            className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <header className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Staff Details</h3>
                                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </header>

                            <form onSubmit={handleUpdateStaff} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            required
                                            value={editStaff.name || ''}
                                            onChange={(e) => setEditStaff({ ...editStaff, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={editStaff.phone || ''}
                                            onChange={(e) => setEditStaff({ ...editStaff, phone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position / Role Type</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <select
                                            value={editStaff.position || ''}
                                            onChange={(e) => setEditStaff({ ...editStaff, position: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white appearance-none"
                                        >
                                            <option value="">Select Position</option>
                                            <optgroup label="Custom Roles">
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.name}>{role.name}</option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="Standard Roles">
                                                <option value="Staff">General Staff</option>
                                                <option value="Cashier">Cashier</option>
                                                <option value="Inventory">Inventory</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                </div>

                                <footer className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {updateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </footer>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StaffManagement;
