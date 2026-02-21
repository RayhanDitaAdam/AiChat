import React, { useState, useEffect, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Users, Check, X, Loader2, UserPlus, Clock, BadgeCheck, Shield, Mail, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getContributorRequests, updateContributorRequest, getContributors } from '../../services/api';
import { PATHS } from '../../routes/paths';
import { useToast } from '../../context/ToastContext.js';
import { useTranslation } from 'react-i18next';

const OwnerContributors = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('contributors'); // 'contributors' | 'requests'
    const [requests, setRequests] = useState([]);
    const [contributors, setContributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

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
                                        <span className="ml-1 text-gray-400 md:ml-2 dark:text-gray-500" aria-current="page">Contributors</span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">{t('nav.contributors') || 'Contributors Management'}</h1>
                    </div>
                    <div className="sm:flex">
                        <div className="flex items-center mb-3 sm:mb-0">
                            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg dark:bg-gray-700">
                                <button
                                    onClick={() => setActiveTab('contributors')}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'contributors'
                                        ? 'bg-white text-indigo-600 shadow dark:bg-gray-600 dark:text-white'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                >
                                    Contributors
                                </button>
                                <button
                                    onClick={() => setActiveTab('requests')}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all relative ${activeTab === 'requests'
                                        ? 'bg-white text-indigo-600 shadow dark:bg-gray-600 dark:text-white'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                >
                                    Requests
                                    {requests.length > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-rose-500 rounded-full">
                                            {requests.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="overflow-x-auto h-full">
                    <div className="inline-block min-w-full align-middle h-full">
                        <div className="overflow-hidden shadow h-full bg-white dark:bg-gray-800">
                            {activeTab === 'contributors' ? (
                                <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="p-4">
                                                <div className="flex items-center">
                                                    <input id="checkbox-all" type="checkbox" className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-indigo-300 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                                    <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                                </div>
                                            </th>
                                            <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                                                Contributor
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
                                                <td colSpan="4" className="p-4 text-center">
                                                    <div className="flex flex-col items-center justify-center py-10">
                                                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading contributors...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : contributors.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="p-10 text-center">
                                                    <Users className="w-12 h-12 mx-auto text-gray-400" />
                                                    <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">No contributors found</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            contributors.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    <td className="w-4 p-4">
                                                        <div className="flex items-center">
                                                            <input id={`checkbox-${user.id}`} type="checkbox" className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-indigo-300 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                                            <label htmlFor={`checkbox-${user.id}`} className="sr-only">checkbox</label>
                                                        </div>
                                                    </td>
                                                    <td className="flex items-center p-4 mr-12 space-x-6 whitespace-nowrap">
                                                        {user.image ? (
                                                            <img className="w-10 h-10 rounded-full" src={user.image} alt={user.name} />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                                {user.name?.[0]}
                                                            </div>
                                                        )}
                                                        <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                                            <div className="text-base font-semibold text-gray-900 dark:text-white">{user.name}</div>
                                                            <div className="text-xs font-normal text-gray-500 dark:text-gray-400">{user.email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${user.status === 'OFFLINE'
                                                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                            }`}>
                                                            {user.status === 'OFFLINE' ? 'Offline' : 'Active'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 space-x-2 whitespace-nowrap">
                                                        <button
                                                            onClick={() => navigate(PATHS.OWNER_CONTRIBUTOR_PRODUCTS.replace(':contributorId', user.id))}
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900"
                                                        >
                                                            <LayoutGrid className="w-4 h-4 mr-2" />
                                                            View Submissions
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-6 h-full overflow-y-auto">
                                    <div className="max-w-4xl mx-auto space-y-4">
                                        {requests.length === 0 ? (
                                            <div className="text-center py-20">
                                                <BadgeCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No pending requests</h3>
                                                <p className="text-gray-500 dark:text-gray-400">Everything is clear for now!</p>
                                            </div>
                                        ) : (
                                            requests.map((req) => (
                                                <div key={req.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 flex flex-col md:flex-row items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                                                            <UserPlus className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 dark:text-white">{req.user?.name || 'Unknown User'}</h4>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">{req.user?.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                                        <button
                                                            onClick={() => handleAction(req.id, 'APPROVED')}
                                                            disabled={actionLoading === req.id}
                                                            className="flex-1 md:flex-none inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900 disabled:opacity-50"
                                                        >
                                                            {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Approve</>}
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req.id, 'REJECTED')}
                                                            disabled={actionLoading === req.id}
                                                            className="flex-1 md:flex-none inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                                                        >
                                                            {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-2" /> Reject</>}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerContributors;
