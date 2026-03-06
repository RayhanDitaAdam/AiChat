import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    Briefcase, Plus, Search, MoreVertical,
    Edit, Trash2, Users, MapPin, Phone, DollarSign,
    ChevronRight, AlertCircle, CheckCircle2, Clock, XCircle,
    Mail, ExternalLink, Calendar as CalendarIcon, Info, Home,
    UserCircle2, FileText, ChevronDown, Filter, LayoutGrid, Loader2, X
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
    getOwnerVacancies, createVacancy, updateVacancy, deleteVacancy,
    updateApplicationStatus, fetchProfile,
    getAllOwnerApplicants
} from '../../services/api.js';
import { PATHS } from '../../routes/paths.js';
import Button from '../../components/Button.jsx';
import { useToast } from '../../context/ToastContext.js';
import Pagination from '../../components/Pagination.jsx';
import { useSearchQuery } from '../../hooks/useSearchQuery.js';

const SALARY_TYPES = [
    { value: 'month', label: '/month' },
    { value: 'hour', label: '/hour' },
];

const ManageJobs = () => {
    const { showToast } = useToast();
    const location = useLocation();

    const activeTab = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('tab') || 'listings';
    }, [location.search]);

    const [vacancies, setVacancies] = useState([]);
    const [allApplicants, setAllApplicants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Replace standard state with custom hook for debouncing and URL sync
    const { query: searchTerm, debouncedQuery: debouncedSearchTerm, setQuery: setSearchTerm } = useSearchQuery('search', 400);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVacancy, setEditingVacancy] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ownerBrand, setOwnerBrand] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Form states for Create/Edit Job
    const [formData, setFormData] = useState({
        companyName: '',
        address: '',
        phone: '',
        title: '',
        detail: '',
        salaryAmount: '',
        salaryType: 'month',
    });

    const fetchOwnerDetails = useCallback(async () => {
        try {
            const res = await fetchProfile();
            if (res?.user?.owner?.name) {
                setOwnerBrand(res.user.owner.name);
            }
        } catch (err) {
            console.error('Fetch owner error:', err);
        }
    }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'listings') {
                const res = await getOwnerVacancies();
                if (res.status === 'success') setVacancies(res.vacancies);
            } else {
                const res = await getAllOwnerApplicants();
                if (res.status === 'success') setAllApplicants(res.applicants);
            }
        } catch (err) {
            console.error('Fetch error:', err);
            showToast('Failed to load data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, showToast]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    useEffect(() => {
        fetchOwnerDetails();
    }, [fetchOwnerDetails]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const buildSalaryString = (amount, type) => {
        if (!amount || !amount.trim()) return '';
        return `${amount.trim()} /${type}`;
    };

    const parseSalaryString = (salaryStr) => {
        if (!salaryStr) return { salaryAmount: '', salaryType: 'month' };
        const match = salaryStr.match(/^(.*?)\s*\/(hour|month)$/i);
        if (match) return { salaryAmount: match[1].trim(), salaryType: match[2].toLowerCase() };
        return { salaryAmount: salaryStr, salaryType: 'month' };
    };

    const handleOpenModal = (vacancy = null) => {
        if (vacancy) {
            setEditingVacancy(vacancy);
            const { salaryAmount, salaryType } = parseSalaryString(vacancy.salary);
            setFormData({
                companyName: vacancy.companyName,
                address: vacancy.address,
                phone: vacancy.phone,
                title: vacancy.title,
                detail: vacancy.detail,
                salaryAmount,
                salaryType,
            });
        } else {
            setEditingVacancy(null);
            setFormData({
                companyName: ownerBrand,
                address: '',
                phone: '',
                title: '',
                detail: '',
                salaryAmount: '',
                salaryType: 'month',
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const salary = buildSalaryString(formData.salaryAmount, formData.salaryType);
        const payload = { ...formData, salary: salary || null };
        delete payload.salaryAmount;
        delete payload.salaryType;

        try {
            if (editingVacancy) {
                await updateVacancy(editingVacancy.id, payload);
                showToast('Job updated', 'success');
            } else {
                await createVacancy(payload);
                showToast('Job posted', 'success');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            showToast(err?.response?.data?.message || 'Failed to save', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this job listing?')) return;
        try {
            await deleteVacancy(id);
            showToast('Deleted', 'success');
            fetchData();
        } catch (err) {
            console.error('Delete error:', err);
            showToast('Failed to delete', 'error');
        }
    };

    const handleUpdateStatus = async (appId, status) => {
        try {
            await updateApplicationStatus(appId, status);
            setAllApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
            showToast(`Status updated to ${status}`, 'success');
        } catch (err) {
            console.error('Update status error:', err);
            showToast('Failed to update status', 'error');
        }
    };

    const filteredData = activeTab === 'listings'
        ? vacancies.filter(v => v.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
        : allApplicants.filter(a => a.user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || a.vacancy.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusStyles = (status) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-200';
            case 'REVIEWED': return 'bg-blue-50 text-blue-600 border-blue-200';
            default: return 'bg-amber-50 text-amber-600 border-amber-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-normal overflow-x-hidden">
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {/* Breadcrumb */}
                <nav className="flex mb-5" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 text-sm font-medium md:space-x-2">
                        <li className="inline-flex items-center">
                            <Link to={PATHS.OWNER_DASHBOARD} className="inline-flex items-center text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white">
                                <Home className="w-4 h-4 mr-2" />
                                Home
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                <span className="ml-1 text-gray-700 hover:text-indigo-600 md:ml-2 dark:text-gray-300 dark:hover:text-white cursor-default">Recruitment</span>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                <span className="ml-1 text-gray-400 md:ml-2 dark:text-gray-500" aria-current="page">
                                    {activeTab === 'listings' ? 'Career Listings' : 'Talent Pool'}
                                </span>
                            </div>
                        </li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                            {activeTab === 'listings' ? 'Career Listings' : 'Talent Pool'}
                        </h1>
                        <p className="text-sm font-normal text-gray-500 mt-1 dark:text-gray-400">
                            {activeTab === 'listings' ? 'Manage and deploy strategic job vacancies' : 'Review and cultivate your potential workforce'}
                        </p>
                    </div>

                    {activeTab === 'listings' && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Deploy Vacancy
                        </button>
                    )}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 flex-wrap w-full">
                        {/* Search */}
                        <div className="relative flex-1 min-w-0 md:max-w-md">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                                type="search"
                                placeholder={activeTab === 'listings' ? "Search position titles..." : "Search applicant names or jobs..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="p-4">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    {isLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Syncing with server...</span>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 mb-6">
                                {activeTab === 'listings' ? <Briefcase size={32} /> : <Users size={32} />}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No records found</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">Try adjusting your search or filters to find what you're looking for.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        {activeTab === 'listings' ? (
                                            <>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 w-16 text-center">No.</th>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Position</th>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Applications</th>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 text-right">Compensation</th>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 text-center">Actions</th>
                                            </>
                                        ) : (
                                            <>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 w-16 text-center">No.</th>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Applicant</th>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Target Position</th>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Motivation</th>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 text-center">Status</th>
                                                <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 text-center">Management</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {activeTab === 'listings' ? (
                                        paginatedData.map((v, index) => (
                                            <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="p-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">
                                                    <span className="text-xs font-bold text-gray-400 num-montserrat">{(currentPage - 1) * itemsPerPage + index + 1}</span>
                                                </td>
                                                <td className="p-4 flex items-center space-x-4 whitespace-nowrap">
                                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm border border-indigo-100/50 dark:border-indigo-800">
                                                        <Briefcase size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-semibold text-gray-900 dark:text-white">{v.title}</p>
                                                        <p className="text-xs font-normal text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                            <MapPin size={10} /> {v.address}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0">
                                                            <Users size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white num-montserrat">{v._count?.applications || 0}</p>
                                                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">Applicants</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400 text-right">
                                                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 num-montserrat">{v.salary || 'Flexible'}</p>
                                                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">Base Package</p>
                                                </td>
                                                <td className="p-4 space-x-2 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(v)}
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900 transition-all active:scale-95"
                                                            title="Edit Listing"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(v.id)}
                                                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-rose-600 rounded-lg hover:bg-rose-700 focus:ring-4 focus:ring-rose-300 dark:focus:ring-rose-900 transition-all active:scale-95"
                                                            title="Delete Listing"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        paginatedData.map((app, index) => (
                                            <tr key={app.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <td className="p-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">
                                                    <span className="text-xs font-bold text-gray-400 num-montserrat">{(currentPage - 1) * itemsPerPage + index + 1}</span>
                                                </td>
                                                <td className="p-4 flex items-center space-x-4 whitespace-nowrap">
                                                    <div className="w-10 h-10 bg-gray-900 dark:bg-gray-700 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg shrink-0">
                                                        {app.user.name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-semibold text-gray-900 dark:text-white">{app.user.name}</p>
                                                        <p className="text-xs font-normal text-gray-500 dark:text-gray-400">{app.user.email}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400">
                                                    <div>
                                                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{app.vacancy.title}</p>
                                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">{app.vacancy.companyName}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm font-normal text-gray-500 dark:text-gray-400">
                                                    <div className="max-w-[240px]">
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm">
                                                            "{app.reason || 'No statement provided.'}"
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center whitespace-nowrap">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border ${getStatusStyles(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center whitespace-nowrap">
                                                    <div className="relative inline-block text-left">
                                                        <select
                                                            value={app.status}
                                                            onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                                                            className="h-9 pr-8 pl-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 focus:ring-4 focus:ring-indigo-300 outline-none appearance-none cursor-pointer shadow-sm hover:border-indigo-300 transition-all"
                                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '0.6rem' }}
                                                        >
                                                            <option value="PENDING">Pending</option>
                                                            <option value="REVIEWED">Review</option>
                                                            <option value="ACCEPTED">Accept</option>
                                                            <option value="REJECTED">Reject</option>
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination footer */}
                    {!isLoading && filteredData.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredData.length}</span> entries
                            </p>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Total Count Footer Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Total Records Sync:</span>
                    <span className="num-montserrat text-indigo-600 font-bold">{filteredData.length}</span>
                </div>
            </div>

            {/* Modal for Job */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
                        />
                        <Motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100/50">
                                        <Briefcase size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {editingVacancy ? 'Modify Protocol' : 'Deploy Vacancy'}
                                        </h3>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Strategic Resource Acquisition — {ownerBrand}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 custom-scrollbar text-left">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Position Title</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="e.g. Lead Barista / Senior Architect"
                                                className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Base Location</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                </div>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    placeholder="HQ or specific branch address"
                                                    className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Contact Number</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="+62..."
                                                    className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Payroll Basis</label>
                                                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                                                    {SALARY_TYPES.map((type) => (
                                                        <button
                                                            key={type.value}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, salaryType: type.value })}
                                                            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${formData.salaryType === type.value ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                                        >
                                                            {type.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Compensation Package</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={formData.salaryAmount}
                                                    onChange={(e) => setFormData({ ...formData, salaryAmount: e.target.value })}
                                                    placeholder="e.g. 5.000.000 - 8.000.000"
                                                    className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 flex flex-col">
                                        <div className="space-y-2 flex-1 flex flex-col">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Role Specifics & Brief</label>
                                            <textarea
                                                required
                                                value={formData.detail}
                                                onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                                                placeholder="Outline the core responsibilities and technical requirements..."
                                                className="block w-full flex-1 p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all resize-none min-h-[200px]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex items-center space-x-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 -mx-6 -mb-6 p-6">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-bold rounded-xl text-sm px-6 py-3 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 disabled:opacity-50 inline-flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                            <>
                                                <span>{editingVacancy ? 'Execute Update' : 'Finalize Posting'}</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-xl border border-gray-200 text-sm font-bold px-6 py-3 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 transition-all active:scale-95"
                                    >
                                        Abort
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

export default ManageJobs;
