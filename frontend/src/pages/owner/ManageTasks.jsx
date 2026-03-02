import React, { useState, useEffect, useCallback } from 'react';
import { createFacilityTask, getFacilityTasks, getStoreMembers, updateFacilityTask, deleteFacilityTask, getStaffRoles } from '../../services/api.js';
import {
    ClipboardList, MapPin, Plus, CheckCircle2, Clock,
    AlertCircle, Search, Filter, MoreVertical, Trash2,
    Edit, User, Calendar as CalendarIcon, ChevronRight, Home, Loader2
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import AddTaskModal from '../../components/AddTaskModal.jsx';
import Pagination from '../../components/Pagination.jsx';
import { Link } from 'react-router-dom';
import { PATHS } from '../../routes/paths.js';

const ManageTasks = () => {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roles, setRoles] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [filters, setFilters] = useState({
        search: '',
        status: 'ALL',
        role: 'ALL'
    });

    const uniqueRoles = [...new Set(staffList.map(s => s.position).filter(Boolean))];

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [tasksRes, membersRes, rolesRes] = await Promise.all([
                getFacilityTasks(),
                getStoreMembers(),
                getStaffRoles()
            ]);

            if (tasksRes.status === 'success') setTasks(tasksRes.data);
            if (membersRes.status === 'success') {
                setStaffList(membersRes.members.filter(m => m.role === 'STAFF'));
            }
            if (rolesRes.status === 'success') {
                setRoles(rolesRes.roles.map(r => r.name));
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError(t('tasks.messages.fetch_error'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleTaskSubmit = async (formData) => {
        try {
            if (selectedTask) {
                // Update existing task
                const res = await updateFacilityTask(selectedTask.id, {
                    ...formData,
                    taskDate: new Date(formData.taskDate).toISOString()
                });
                if (res.status === 'success') {
                    setIsModalOpen(false);
                    setSelectedTask(null);
                    fetchInitialData();
                }
            } else {
                // Create new task
                const res = await createFacilityTask({
                    ...formData,
                    assignedToId: formData.assignedToId || null,
                    taskDate: new Date(formData.taskDate).toISOString()
                });
                if (res.status === 'success') {
                    setIsModalOpen(false);
                    setSelectedTask(null);
                    fetchInitialData();
                }
            }
        } catch (err) {
            console.error('Failed to save task:', err);
            setError(err.response?.data?.message || t('tasks.messages.create_error'));
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm(t('tasks.messages.confirm_delete', 'Are you sure you want to delete this task?'))) return;

        try {
            const res = await deleteFacilityTask(taskId);
            if (res.status === 'success') {
                fetchInitialData();
            }
        } catch (err) {
            console.error('Failed to delete task:', err);
            setError(err.response?.data?.message || t('tasks.messages.delete_error', 'Failed to delete task'));
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = (task.taskDetail || '').toLowerCase().includes(filters.search.toLowerCase()) ||
            (task.location || '').toLowerCase().includes(filters.search.toLowerCase());
        const matchesStatus = filters.status === 'ALL' || task.status === filters.status;
        const matchesRole = filters.role === 'ALL' ||
            (task.assignScope === 'ROLE' && task.targetRole === filters.role);

        return matchesSearch && matchesStatus && matchesRole;
    });

    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const paginatedTasks = filteredTasks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusStyles = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
            case 'IN_PROGRESS': return 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800';
            default: return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-normal">
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {/* Breadcrumb */}
                <nav className="flex mb-5" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 text-sm font-medium md:space-x-2">
                        <li className="inline-flex items-center">
                            <Link to={PATHS.OWNER_DASHBOARD} className="inline-flex items-center text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white transition-colors">
                                <Home className="w-4 h-4 mr-2" />
                                Home
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                <span className="ml-1 text-gray-700 hover:text-indigo-600 md:ml-2 dark:text-gray-300 dark:hover:text-white cursor-default">Operations</span>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                <span className="ml-1 text-gray-400 md:ml-2 dark:text-gray-500" aria-current="page">Tasks</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                            {t('tasks.title')}
                        </h1>
                        <p className="text-sm font-normal text-gray-500 mt-1 dark:text-gray-400">
                            Coordinate and deploy strategic operational directives
                        </p>
                    </div>

                    <button
                        onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none"
                    >
                        <Plus className="w-4 h-4 mr-2" /> {t('tasks.assign_btn')}
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 flex-wrap flex-1">
                        {/* Search */}
                        <div className="relative flex-1 min-w-0 md:max-w-md">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                                type="search"
                                placeholder={t('tasks.search_placeholder', 'Search by detail or location...')}
                                value={filters.search}
                                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                                className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>

                        {/* Filters Container */}
                        <div className="flex gap-3">
                            {/* Status Filter */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </div>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                                    className="block p-2.5 pl-10 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 outline-none appearance-none cursor-pointer min-w-[150px]"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '0.75rem' }}
                                >
                                    <option value="ALL">ALL STATUS</option>
                                    <option value="PENDING">PENDING</option>
                                    <option value="IN_PROGRESS">IN PROGRESS</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                </select>
                            </div>

                            {/* Role Filter */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </div>
                                <select
                                    value={filters.role}
                                    onChange={(e) => setFilters(f => ({ ...f, role: e.target.value }))}
                                    className="block p-2.5 pl-10 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 outline-none appearance-none cursor-pointer min-w-[150px]"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '0.75rem' }}
                                >
                                    <option value="ALL">ALL ROLES</option>
                                    {uniqueRoles.map(role => (
                                        <option key={role} value={role}>{role.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-4 text-sm text-rose-800 rounded-lg bg-rose-50 dark:bg-gray-800 dark:text-rose-400 border border-rose-100 dark:border-rose-900 active-sm animate-pulse flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}
            </div>

            {/* Table Area */}
            <div className="p-4 flex-1">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    {isLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Synchronizing operational data...</span>
                        </div>
                    ) : paginatedTasks.length === 0 ? (
                        <div className="p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 mb-6">
                                <ClipboardList size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('tasks.no_tasks')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">Try adjusting your filters or strategic parameters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">{t('tasks.table.details', 'Details')}</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 w-32">{t('tasks.table.location', 'Location')}</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400 w-32">{t('tasks.table.status', 'Status')}</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 w-48">{t('tasks.table.assigned_to', 'Deployment')}</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 w-40">{t('tasks.table.target_date', 'Timeline')}</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400 w-24">{t('common.actions', 'Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {paginatedTasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                            <td className="p-4">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                                    {task.taskDetail}
                                                </p>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded text-[10px] font-bold uppercase tracking-wider border border-gray-200 dark:border-gray-600">
                                                    <MapPin size={10} />
                                                    {t(`locations.${(task.location || '').toLowerCase().replace(' ', '_')}`)}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center whitespace-nowrap">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${getStatusStyles(task.status)}`}>
                                                    {task.status === 'COMPLETED' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                                    {t(`tasks.status.${(task.status || 'PENDING').toLowerCase()}`)}
                                                </div>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase shadow-sm">
                                                        {task.assignScope === 'ROLE' ? (task.targetRole?.[0] || 'R') : (task.assignedTo?.name?.[0] || 'A')}
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                                            {task.assignScope === 'ROLE' ? `${task.targetRole}` : (task.assignedTo?.name || t('tasks.open_to_staff'))}
                                                        </p>
                                                        <p className="text-[9px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">
                                                            {(task.assignScope || '').toLowerCase()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 num-montserrat">
                                                        {format(new Date(task.taskDate), 'dd MMM yyyy')}
                                                    </span>
                                                    <span className="text-[9px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">
                                                        {format(new Date(task.taskDate), 'HH:mm')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                                                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                        title="Modify Directive"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:text-gray-400 dark:hover:text-rose-400 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                                                        title="Terminate Task"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination footer */}
                    {!isLoading && totalPages > 1 && (
                        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredTasks.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredTasks.length}</span> entries
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

            {/* Global Insight Footer */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 z-10 mx-4 mb-4 rounded-xl shadow-lg">
                <div className="flex items-center justify-between max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Operations</span>
                            <span className="num-montserrat text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                {tasks.filter(t => t.status !== 'COMPLETED').length} <span className="text-xs text-gray-400 font-medium">directives</span>
                            </span>
                        </div>
                        <div className="w-[1px] h-8 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completion Efficiency</span>
                            <span className="num-montserrat text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100) : 0}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AddTaskModal
                key={selectedTask?.id || (isModalOpen ? 'new' : 'closed')}
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedTask(null); }}
                onSubmit={handleTaskSubmit}
                staffList={staffList}
                roles={roles}
                initialData={selectedTask}
            />
        </div>
    );
};

export default ManageTasks;
