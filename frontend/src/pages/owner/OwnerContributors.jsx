import React, { useState, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Users, Check, X, Loader2, UserPlus, Clock, BadgeCheck, Shield, Mail, LayoutGrid, UserMinus, Home, ChevronRight, Search, Filter } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getContributorRequests, updateContributorRequest, getContributors, bulkRemoveContributors } from '../../services/api';
import { PATHS } from '../../routes/paths';
import { useToast } from '../../context/ToastContext.js';
import UserAvatar from '../../components/UserAvatar.jsx';

const OwnerContributors = ({ embedded = false }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('contributors'); // 'contributors' | 'requests'
    const [requests, setRequests] = useState([]);
    const [contributors, setContributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkProcessing, setBulkProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [reqData, contData] = await Promise.all([
                getContributorRequests(),
                getContributors()
            ]);
            setRequests(reqData || []);
            setContributors(contData || []);
        } catch (err) {
            console.error(err);
            showToast('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAction = async (requestId, status) => {
        setActionLoading(requestId);
        try {
            await updateContributorRequest(requestId, status);
            showToast(status === 'APPROVED' ? 'Contributor approved!' : 'Request rejected', 'success');
            fetchData(); // Refresh list
        } catch {
            showToast('Action failed', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSingleRemove = async (user) => {
        if (!window.confirm(`Are you sure you want to remove ${user.name} from contributors?`)) return;

        setBulkProcessing(true);
        try {
            await bulkRemoveContributors([user.id]);
            showToast(`${user.name} removed from contributors`, 'success');
            setSelectedIds(prev => prev.filter(id => id !== user.id));
            fetchData();
        } catch (err) {
            console.error(err);
            showToast('Failed to remove contributor', 'error');
        } finally {
            setBulkProcessing(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredContributors.length && filteredContributors.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredContributors.map(c => c.id));
        }
    };

    const toggleSelect = (contributorId) => {
        setSelectedIds(prev =>
            prev.includes(contributorId)
                ? prev.filter(id => id !== contributorId)
                : [...prev, contributorId]
        );
    };

    const handleBulkRemove = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to remove ${selectedIds.length} contributors? They will be reverted to regular users.`)) return;

        setBulkProcessing(true);
        try {
            await bulkRemoveContributors(selectedIds);
            showToast(`${selectedIds.length} contributors removed successfully`, 'success');
            setSelectedIds([]);
            fetchData();
        } catch (err) {
            console.error(err);
            showToast('Failed to remove contributors', 'error');
        } finally {
            setBulkProcessing(false);
        }
    };

    const filteredContributors = contributors.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={embedded ? "bg-white dark:bg-gray-900" : "min-h-screen bg-gray-50 dark:bg-gray-900 font-normal"}>
            <div className={`p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${embedded ? '!border-t-0' : ''}`}>
                {/* Breadcrumb */}
                {!embedded && (
                    <nav className="flex mb-5" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 text-sm font-medium md:space-x-2">
                            <li className="inline-flex items-center">
                                <Link to={PATHS.OWNER_DASHBOARD} className="inline-flex items-center text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white transition-colors">
                                    <Home className="w-4 h-4 mr-2" />
                                    {t('common.home')}
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                    <span className="ml-1 text-gray-400 md:ml-2 dark:text-gray-500" aria-current="page">{t('nav.contributors')}</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    {!embedded ? (
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                                {t('nav.contributors')}
                            </h1>
                            <p className="text-sm font-normal text-gray-500 mt-1 dark:text-gray-400">
                                Orchestrate and monitor your external production network
                            </p>
                        </div>
                    ) : (
                        <div className="hidden md:block"></div>
                    )}

                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl self-start md:self-center">
                        <button
                            onClick={() => { setActiveTab('contributors'); setSelectedIds([]); }}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'contributors'
                                ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-600 dark:text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            Active Assets
                        </button>
                        <button
                            onClick={() => { setActiveTab('requests'); setSelectedIds([]); }}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all relative ${activeTab === 'requests'
                                ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-600 dark:text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                }`}
                        >
                            Entry Requests
                            {requests.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800">
                                    {requests.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        {/* Search */}
                        <div className="relative flex-1 min-w-0 md:max-w-md">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                                type="search"
                                placeholder={t('contributor_approval.search_submissions')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>

                        {activeTab === 'contributors' && selectedIds.length > 0 && (
                            <Motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2"
                            >
                                <button
                                    onClick={handleBulkRemove}
                                    disabled={bulkProcessing}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 focus:ring-4 focus:ring-rose-300 dark:focus:ring-rose-900 transition-all active:scale-95 shadow-lg shadow-rose-100 dark:shadow-none disabled:opacity-50"
                                >
                                    {bulkProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserMinus className="w-4 h-4 mr-2" />}
                                    Revoke Selected ({selectedIds.length})
                                </button>
                            </Motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Synchronizing personnel matrix...</span>
                        </div>
                    ) : activeTab === 'contributors' ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="p-4 w-12">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={filteredContributors.length > 0 && selectedIds.length === filteredContributors.length}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </div>
                                        </th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Identity</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 w-32">Status</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400 w-64">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {filteredContributors.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-20 text-center">
                                                <div className="flex flex-col items-center justify-center text-center">
                                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 mb-6">
                                                        <Users size={32} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Empty Personnel Grid</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">No active contributors found matching your search.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredContributors.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(user.id)}
                                                            onChange={() => toggleSelect(user.id)}
                                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <UserAvatar user={user} size={40} />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</span>
                                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                                <Mail size={12} /> {user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shadow-sm ${user.status === 'OFFLINE'
                                                        ? 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                                        }`}>
                                                        {user.status || 'OFFLINE'}
                                                    </span>
                                                </td>
                                                <td className="p-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => navigate(PATHS.OWNER_CONTRIBUTOR_PRODUCTS.replace(':contributorId', user.id))}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg transition-all border border-indigo-100 dark:border-indigo-800 shadow-sm"
                                                        >
                                                            <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
                                                            Review Pipeline
                                                        </button>
                                                        <button
                                                            onClick={() => handleSingleRemove(user)}
                                                            disabled={bulkProcessing}
                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 rounded-lg transition-all border border-rose-100 dark:border-rose-800 shadow-sm opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                        >
                                                            <UserMinus className="w-3.5 h-3.5 mr-1.5" />
                                                            Revoke
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-6 h-full overflow-y-auto min-h-[400px]">
                            <div className="max-w-4xl mx-auto space-y-4">
                                {requests.length === 0 ? (
                                    <div className="text-center py-20 flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 mb-6">
                                            <BadgeCheck size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Protocol Clear</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No pending entry requests at this time.</p>
                                    </div>
                                ) : (
                                    requests.map((req) => (
                                        <Motion.div
                                            key={req.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110">
                                                    <UserPlus className="w-7 h-7" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <h4 className="text-base font-bold text-gray-900 dark:text-white">{req.user?.name || 'Candidate Participant'}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{req.user?.email}</span>
                                                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                                                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Entry Request</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <button
                                                    onClick={() => handleAction(req.id, 'APPROVED')}
                                                    disabled={actionLoading === req.id}
                                                    className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none"
                                                >
                                                    {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Accept</>}
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, 'REJECTED')}
                                                    disabled={actionLoading === req.id}
                                                    className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-all active:scale-95 shadow-sm"
                                                >
                                                    {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-2" /> Decline</>}
                                                </button>
                                            </div>
                                        </Motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Insight Footer */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 z-10 mx-4 mb-4 rounded-xl shadow-lg">
                <div className="flex items-center justify-between max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Network Strength</span>
                            <span className="num-montserrat text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                {contributors.length} <span className="text-xs text-gray-400 font-medium">active agents</span>
                            </span>
                        </div>
                        <div className="w-[1px] h-8 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Growth Vector</span>
                            <span className="num-montserrat text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                +{requests.length} <span className="text-xs text-gray-400 font-medium">pending</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerContributors;
