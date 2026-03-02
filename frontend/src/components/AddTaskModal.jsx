import React, { useState } from 'react';
import { X, MapPin, ClipboardList, Calendar, Plus, Save, User, Shield, ArrowRight } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const locations = ['Toilet', 'Prayer Room', 'Customer Service', 'AED', 'Emergency Phone', 'APAR'];

const AddTaskModal = ({ isOpen, onClose, onSubmit, staffList, roles = [], initialData = null }) => {
    const { t } = useTranslation();
    const [form, setForm] = useState(() => {
        if (initialData) {
            return {
                location: initialData.location || 'Toilet',
                taskDetail: initialData.taskDetail || '',
                taskDate: format(new Date(initialData.taskDate), "yyyy-MM-dd'T'HH:mm"),
                assignedToId: initialData.assignedToId || '',
                assignScope: initialData.assignScope || 'INDIVIDUAL',
                targetRole: initialData.targetRole || ''
            };
        }
        return {
            location: 'Toilet',
            taskDetail: '',
            taskDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            assignedToId: '',
            assignScope: 'INDIVIDUAL',
            targetRole: ''
        };
    });

    const displayRoles = roles.length > 0 ? roles : [...new Set(staffList.map(s => s.position).filter(Boolean))];

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <Motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100/50">
                                <ClipboardList size={24} />
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {initialData ? t('tasks.edit_title') : t('tasks.assign_title')}
                                </h3>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Strategic Operations & Dispatch
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} id="task-dispatch-form" className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('tasks.location')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <select
                                        value={form.location}
                                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                                        className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '0.75rem' }}
                                    >
                                        {locations.map(loc => (
                                            <option key={loc} value={loc}>{t(`locations.${loc.toLowerCase().replace(' ', '_')}`)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('tasks.target_date')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <input
                                        type="datetime-local"
                                        value={form.taskDate}
                                        onChange={(e) => setForm({ ...form, taskDate: e.target.value })}
                                        className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('tasks.assign_type')}</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['INDIVIDUAL', 'ROLE', 'ALL'].map(scope => (
                                    <button
                                        key={scope}
                                        type="button"
                                        onClick={() => setForm({ ...form, assignScope: scope, assignedToId: '', targetRole: '' })}
                                        className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${form.assignScope === scope
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                            : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
                                            }`}
                                    >
                                        {t(`tasks.scope.${scope.toLowerCase()}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {form.assignScope === 'INDIVIDUAL' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('tasks.assign_to')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <select
                                        value={form.assignedToId}
                                        onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
                                        className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '0.75rem' }}
                                    >
                                        <option value="">{t('tasks.open_to_staff')}</option>
                                        {staffList.map(staff => (
                                            <option key={staff.id} value={staff.id}>{staff.name} {staff.position ? `(${staff.position})` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {form.assignScope === 'ROLE' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('tasks.select_role')}</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <select
                                        value={form.targetRole}
                                        onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                                        className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '0.75rem' }}
                                    >
                                        <option value="">{t('tasks.select_role_placeholder')}</option>
                                        {displayRoles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('tasks.details')}</label>
                            <textarea
                                value={form.taskDetail}
                                onChange={(e) => setForm({ ...form, taskDetail: e.target.value })}
                                placeholder={t('tasks.details_placeholder')}
                                className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white outline-none transition-all resize-none shadow-inner min-h-[120px]"
                                required
                            />
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="flex items-center space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <button
                            type="submit"
                            form="task-dispatch-form"
                            className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-bold rounded-xl text-sm px-6 py-3 text-center dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 disabled:opacity-50 inline-flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none"
                        >
                            <span>{initialData ? t('common.save_changes') : t('tasks.assign_btn')}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-indigo-300 rounded-xl border border-gray-200 text-sm font-bold px-6 py-3 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 transition-all active:scale-95"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </Motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddTaskModal;
