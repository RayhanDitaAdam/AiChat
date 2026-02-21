import React, { useState } from 'react';
import { X, MapPin, ClipboardList, Calendar, Plus, Save } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const locations = ['Toilet', 'Prayer Room', 'Customer Service', 'AED', 'Emergency Phone', 'APAR'];

const AddTaskModal = ({ isOpen, onClose, onSubmit, staffList, initialData = null }) => {
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

    const uniqueRoles = [...new Set(staffList.map(s => s.position).filter(Boolean))];

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
                    className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100"
                >
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-indigo-600" />
                                {initialData ? t('tasks.edit_title') : t('tasks.assign_title')}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {initialData ? t('tasks.edit_subtitle') : t('tasks.assign_subtitle')}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <MapPin className="w-3 h-3" /> {t('tasks.location')}
                                </label>
                                <select
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                                >
                                    {locations.map(loc => (
                                        <option key={loc} value={loc}>{t(`locations.${loc.toLowerCase().replace(' ', '_')}`)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-3 h-3" /> {t('tasks.target_date')}
                                </label>
                                <input
                                    type="datetime-local"
                                    value={form.taskDate}
                                    onChange={(e) => setForm({ ...form, taskDate: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ClipboardList className="w-3 h-3" /> {t('tasks.assign_type')}
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {['INDIVIDUAL', 'ROLE', 'ALL'].map(scope => (
                                    <button
                                        key={scope}
                                        type="button"
                                        onClick={() => setForm({ ...form, assignScope: scope, assignedToId: '', targetRole: '' })}
                                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.assignScope === scope
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                            }`}
                                    >
                                        {t(`tasks.scope.${scope.toLowerCase()}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {form.assignScope === 'INDIVIDUAL' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ClipboardList className="w-3 h-3" /> {t('tasks.assign_to')}
                                </label>
                                <select
                                    value={form.assignedToId}
                                    onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                                >
                                    <option value="">{t('tasks.open_to_staff')}</option>
                                    {staffList.map(staff => (
                                        <option key={staff.id} value={staff.id}>{staff.name} {staff.position ? `(${staff.position})` : ''}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {form.assignScope === 'ROLE' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ClipboardList className="w-3 h-3" /> {t('tasks.select_role')}
                                </label>
                                <select
                                    value={form.targetRole}
                                    onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                                >
                                    <option value="">{t('tasks.select_role_placeholder')}</option>
                                    {uniqueRoles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ClipboardList className="w-3 h-3" /> {t('tasks.details')}
                            </label>
                            <textarea
                                value={form.taskDetail}
                                onChange={(e) => setForm({ ...form, taskDetail: e.target.value })}
                                placeholder={t('tasks.details_placeholder')}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none min-h-[100px] resize-none"
                                required
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-slate-100 text-slate-600 rounded-2xl py-4 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all active:scale-95"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-slate-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                            >
                                {initialData ? <Save size={14} /> : <Plus size={14} />}
                                {initialData ? t('common.save_changes') : t('tasks.assign_btn')}
                            </button>
                        </div>
                    </form>
                </Motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddTaskModal;
