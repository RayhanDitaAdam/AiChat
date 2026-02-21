import React, { useState, useEffect, useCallback } from 'react';
import { createFacilityTask, getFacilityTasks, getStoreMembers } from '../../services/api.js';
import {
    ClipboardList, MapPin, Plus, CheckCircle2, Clock,
    AlertCircle, Search, Filter, MoreVertical, Trash2,
    Edit, User, Calendar as CalendarIcon, ChevronRight
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import AddTaskModal from '../../components/AddTaskModal.jsx';
import Pagination from '../../components/Pagination.jsx';

const ManageTasks = () => {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const [filters, setFilters] = useState({
        search: '',
        status: 'ALL',
        role: 'ALL'
    });

    const uniqueRoles = [...new Set(staffList.map(s => s.position).filter(Boolean))];

    const fetchInitialData = useCallback(async () => {
        try {
            const [tasksRes, membersRes] = await Promise.all([
                getFacilityTasks(),
                getStoreMembers()
            ]);

            if (tasksRes.status === 'success') setTasks(tasksRes.data);
            if (membersRes.status === 'success') {
                setStaffList(membersRes.members.filter(m => m.role === 'STAFF'));
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
        } catch (err) {
            console.error('Failed to save task:', err);
            setError(err.response?.data?.message || t('tasks.messages.create_error'));
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.taskDetail.toLowerCase().includes(filters.search.toLowerCase()) ||
            task.location.toLowerCase().includes(filters.search.toLowerCase());
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

    return (
        <div className="flex flex-col h-full bg-slate-50/30 overflow-hidden">
            <div className="p-4 md:p-6 space-y-6 shrink-0">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="hover:text-slate-600 transition-colors cursor-pointer">{t('common.home', 'Home')}</span>
                    <ChevronRight size={10} />
                    <span className="text-slate-900">{t('tasks.title')}</span>
                </nav>

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 italic uppercase">
                            <ClipboardList className="w-8 h-8 text-indigo-600" />
                            {t('tasks.title')}
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">{t('tasks.subtitle')}</p>
                    </div>
                    <button
                        onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
                        className="bg-slate-900 text-white rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                    >
                        <Plus className="w-4 h-4" />
                        {t('tasks.assign_btn')}
                    </button>
                </header>

                {error && (
                    <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm border border-rose-100">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                )}

                {/* Advanced Filters */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={t('tasks.search_placeholder', 'Search tasks by detail or location...')}
                            value={filters.search}
                            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                            className="w-full h-12 pl-12 pr-6 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/10 transition-all outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                            <Filter size={14} className="text-slate-400" />
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-0 outline-none cursor-pointer"
                            >
                                <option value="ALL">ALL STATUS</option>
                                <option value="PENDING">PENDING</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="COMPLETED">COMPLETED</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                            <User size={14} className="text-slate-400" />
                            <select
                                value={filters.role}
                                onChange={(e) => setFilters(f => ({ ...f, role: e.target.value }))}
                                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-0 outline-none cursor-pointer"
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

            {/* Task Table Content */}
            <div className="flex-1 overflow-hidden px-4 pb-4 md:px-6 md:pb-6">
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white z-10">
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tasks.table.details', 'Details')}</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tasks.table.location', 'Location')}</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tasks.table.status', 'Status')}</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tasks.table.assigned_to', 'Assigned To')}</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tasks.table.target_date', 'Target Date')}</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.actions', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-12 text-center">
                                            <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : paginatedTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-12 text-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300 mb-4">
                                                <ClipboardList className="w-8 h-8" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t('tasks.no_tasks')}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTasks.map((task) => (
                                        <tr key={task.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                                                    {task.taskDetail}
                                                </p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                    <MapPin size={10} />
                                                    {t(`locations.${task.location.toLowerCase().replace(' ', '_')}`)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${task.status === 'COMPLETED'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : task.status === 'IN_PROGRESS'
                                                        ? 'bg-blue-50 text-blue-600'
                                                        : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                    {task.status === 'COMPLETED' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                                    {t(`tasks.status.${task.status.toLowerCase()}`)}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-200 uppercase">
                                                        {task.assignScope === 'ROLE' ? task.targetRole[0] : (task.assignedTo?.name?.[0] || 'A')}
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-slate-900 uppercase italic tracking-tight">
                                                            {task.assignScope === 'ROLE' ? `${t('tasks.role')}: ${task.targetRole}` : (task.assignedTo?.name || t('tasks.open_to_staff'))}
                                                        </p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {task.assignScope.toLowerCase()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-extrabold text-slate-700 num-montserrat">
                                                        {format(new Date(task.taskDate), 'dd MMM yyyy')}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {format(new Date(task.taskDate), 'HH:mm')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                                                        className="p-2 hover:bg-white hover:text-indigo-600 rounded-lg transition-all text-slate-400 border border-transparent hover:border-slate-100 shadow-sm"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all text-slate-400 border border-transparent hover:border-rose-100 shadow-sm">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 shrink-0">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AddTaskModal
                key={selectedTask?.id || (isModalOpen ? 'new' : 'closed')}
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedTask(null); }}
                onSubmit={handleTaskSubmit}
                staffList={staffList}
                initialData={selectedTask}
            />
        </div>
    );
};

export default ManageTasks;
