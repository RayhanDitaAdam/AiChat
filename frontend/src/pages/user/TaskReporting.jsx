import React, { useState, useEffect } from 'react';
import { getFacilityTasks, updateFacilityTaskReport } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ClipboardList, CheckCircle2, Clock, AlertCircle, Send, MessageSquareText } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const TaskReporting = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reportingTask, setReportingTask] = useState(null);
    const [reportText, setReportText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchTasks = async () => {
        try {
            const res = await getFacilityTasks();
            if (res.status === 'success') {
                setTasks(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
            setError('Gagal memuat daftar tugas.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!reportingTask) return;

        setIsSubmitting(true);
        try {
            const res = await updateFacilityTaskReport(reportingTask.id, {
                report: reportText,
                status: 'COMPLETED'
            });
            if (res.status === 'success') {
                setReportingTask(null);
                setReportText('');
                fetchTasks();
            }
        } catch (err) {
            console.error('Failed to update report:', err);
            setError('Gagal mengirim laporan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto p-4 md:p-8">
            <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 italic uppercase">
                    <ClipboardList className="w-8 h-8 text-indigo-600" />
                    Task Reporting
                </h1>
                <p className="text-slate-500 font-medium mt-1">View and report maintenance tasks assigned to your store.</p>
            </header>

            {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm">
                    <AlertCircle className="w-5 h-5" /> {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : tasks.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 text-center space-y-4 shadow-xl shadow-slate-200/20">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">All caught up! No tasks assigned.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <Motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white rounded-[2rem] p-6 shadow-md border ${task.status === 'COMPLETED' ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100'}`}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                                            {task.location}
                                        </span>
                                        <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${task.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {task.status === 'COMPLETED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {task.status}
                                        </span>
                                        {task.assignedToId === user.id && (
                                            <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest leading-none shadow-lg shadow-indigo-200">
                                                Assigned To Me
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-base font-bold text-slate-800">{task.taskDetail}</h3>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        <Clock className="w-3 h-3" /> Due: {format(new Date(task.taskDate), 'PPp')}
                                    </div>
                                </div>

                                {task.status === 'PENDING' && (
                                    <button
                                        onClick={() => setReportingTask(task)}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 shrink-0 self-start md:self-center"
                                    >
                                        <Send className="w-3 h-3" /> Submit Report
                                    </button>
                                )}
                            </div>

                            {task.report && (
                                <div className="mt-4 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                        <MessageSquareText className="w-3 h-3" /> Staff Report
                                    </div>
                                    <p className="text-sm font-bold text-slate-600 bg-slate-50/50 p-4 rounded-xl italic">
                                        "{task.report}"
                                    </p>
                                </div>
                            )}
                        </Motion.div>
                    ))}
                </div>
            )}

            {/* Reporting Modal */}
            <AnimatePresence>
                {reportingTask && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative"
                        >
                            <h2 className="text-xl font-black text-slate-900 mb-2 uppercase italic tracking-tight">Submit Task Report</h2>
                            <p className="text-sm text-slate-500 font-medium mb-6">Describe the completion details for: <span className="font-bold text-indigo-600">{reportingTask.location}</span></p>

                            <form onSubmit={handleReportSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Pekerjaan (Report)</label>
                                    <textarea
                                        autoFocus
                                        value={reportText}
                                        onChange={(e) => setReportText(e.target.value)}
                                        placeholder="Tulis apa yang sudah dikerjakan..."
                                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none min-h-[150px] resize-none"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReportingTask(null);
                                            setReportText('');
                                        }}
                                        className="flex-1 bg-slate-100 text-slate-500 rounded-2xl py-4 font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] bg-indigo-600 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <><CheckCircle2 className="w-4 h-4" /> Finish Task</>
                                        )}
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

export default TaskReporting;
