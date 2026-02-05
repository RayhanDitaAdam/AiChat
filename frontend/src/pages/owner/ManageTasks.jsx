import React, { useState, useEffect } from 'react';
import { createFacilityTask, getFacilityTasks, getStoreMembers } from '../../services/api.js';
import { ClipboardList, Calendar, MapPin, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const locations = ['Toilet', 'Prayer Room', 'Customer Service', 'AED', 'Emergency Phone', 'APAR'];

const ManageTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        location: 'Toilet',
        taskDetail: '',
        taskDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        assignedToId: ''
    });

    const fetchInitialData = async () => {
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
            setError('Gagal memuat data.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await getFacilityTasks();
            if (res.status === 'success') {
                setTasks(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await createFacilityTask({
                ...form,
                assignedToId: form.assignedToId || null,
                taskDate: new Date(form.taskDate).toISOString()
            });
            if (res.status === 'success') {
                setForm({ ...form, taskDetail: '', assignedToId: '' });
                fetchTasks();
            }
        } catch (err) {
            console.error('Failed to create task:', err);
            setError(err.response?.data?.message || 'Gagal membuat tugas.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-4 md:p-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 italic uppercase">
                        <ClipboardList className="w-8 h-8 text-indigo-600" />
                        Facility Management
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Assign and monitor maintenance tasks for store facilities.</p>
                </div>
            </header>

            {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm">
                    <AlertCircle className="w-5 h-5" /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Assignment Form */}
                <Motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
                >
                    <h2 className="text-xl font-black text-slate-900 mb-6 uppercase italic tracking-tight">Assign New Task</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Location
                            </label>
                            <select
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                            >
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ClipboardList className="w-3 h-3" /> Assign To (Optional)
                            </label>
                            <select
                                value={form.assignedToId}
                                onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                            >
                                <option value="">Open to All Staff</option>
                                {staffList.map(staff => (
                                    <option key={staff.id} value={staff.id}>{staff.name} {staff.position ? `(${staff.position})` : ''}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Target Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                value={form.taskDate}
                                onChange={(e) => setForm({ ...form, taskDate: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ClipboardList className="w-3 h-3" /> Task Details
                            </label>
                            <textarea
                                value={form.taskDetail}
                                onChange={(e) => setForm({ ...form, taskDetail: e.target.value })}
                                placeholder="e.g., Ganti brush di toilet, Cek stok sabun..."
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none min-h-[120px] resize-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><Plus className="w-4 h-4" /> Assign Task</>
                            )}
                        </button>
                    </form>
                </Motion.div>

                {/* Task List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-black text-slate-900 mb-6 uppercase italic tracking-tight">Recent Assignments</h2>
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                                <ClipboardList className="w-8 h-8" />
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No tasks assigned yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnimatePresence mode="popLayout">
                                {tasks.map((task) => (
                                    <Motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white rounded-[2rem] p-6 shadow-md shadow-slate-200/50 border border-slate-100 flex flex-col justify-between"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    {task.location}
                                                </div>
                                                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${task.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {task.status === 'COMPLETED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    {task.status}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 leading-tight">{task.taskDetail}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 line-clamp-1">
                                                    {format(new Date(task.taskDate), 'PPp')}
                                                </p>
                                            </div>
                                        </div>

                                        {task.report && (
                                            <div className="mt-4 pt-4 border-t border-slate-50">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Report:</p>
                                                <p className="text-xs font-bold text-slate-600 leading-relaxed italic">"{task.report}"</p>
                                            </div>
                                        )}
                                    </Motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageTasks;
