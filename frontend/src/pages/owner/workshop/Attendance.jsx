import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Loader2, Clock, X, Check } from 'lucide-react';
import { getMechanics, getAttendances, clockIn, clockOut, createAttendance, deleteAttendance } from '../../../services/api.js';
import { format } from 'date-fns';
import { showError, showSuccess } from '../../../utils/swal.js';

const Attendance = ({ embedded = false }) => {
    const [mechanics, setMechanics] = useState([]);
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedMechanic, setSelectedMechanic] = useState('');
    const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [showManualModal, setShowManualModal] = useState(false);
    const [manualForm, setManualForm] = useState({ mechanicId: '', date: format(new Date(), 'yyyy-MM-dd'), clockIn: '', clockOut: '' });
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [mechRes, attRes] = await Promise.all([
                getMechanics(),
                getAttendances({ mechanicId: selectedMechanic || undefined, month })
            ]);
            setMechanics(mechRes?.data || []);
            setAttendances(attRes?.data || []);
        } catch { showError('Failed to load data'); }
        finally { setLoading(false); }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchData(); }, [selectedMechanic, month]);

    const handleClockIn = async (mechanicId) => {
        setActionLoading(mechanicId + '_in');
        try { await clockIn(mechanicId); showSuccess('Clocked in'); fetchData(); }
        catch (e) { showError(e.response?.data?.message || e.message); }
        finally { setActionLoading(null); }
    };

    const handleClockOut = async (mechanicId) => {
        setActionLoading(mechanicId + '_out');
        try { await clockOut(mechanicId); showSuccess('Clocked out'); fetchData(); }
        catch (e) { showError(e.response?.data?.message || e.message); }
        finally { setActionLoading(null); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this attendance record?')) return;
        setActionLoading(id + '_del');
        try { await deleteAttendance(id); showSuccess('Deleted'); fetchData(); }
        catch { showError('Failed to delete'); }
        finally { setActionLoading(null); }
    };

    const handleManualSave = async (e) => {
        e.preventDefault();
        if (!manualForm.mechanicId || !manualForm.date) { showError('Please fill mechanic and date'); return; }
        setSaving(true);
        try {
            const dateTime = (t) => t ? `${manualForm.date}T${t}:00` : undefined;
            await createAttendance({ ...manualForm, clockIn: dateTime(manualForm.clockIn), clockOut: dateTime(manualForm.clockOut) });
            showSuccess('Attendance recorded'); setShowManualModal(false); fetchData();
        } catch (e) { showError(e.response?.data?.message || e.message); }
        finally { setSaving(false); }
    };

    // Summary stats for selected month
    const totalHours = attendances.reduce((s, a) => s + (a.totalHours || 0), 0);
    const attendanceDays = new Set(attendances.map(a => a.mechanicId + a.date?.split('T')[0])).size;

    // Today attendance for quick clock-in/out
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayAttByMechanic = {};
    attendances.forEach(a => { if (a.date?.split('T')[0] === todayStr) todayAttByMechanic[a.mechanicId] = a; });

    return (
        <div className={embedded ? "p-4" : "bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8"}>
            {/* Header */}
            <div className={`mb-6 flex items-center ${embedded ? 'justify-end' : 'justify-between'}`}>
                {!embedded && (
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg"><Calendar className="w-5 h-5 text-blue-600" /></div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Attendance</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Track mechanic clock-in / clock-out</p>
                        </div>
                    </div>
                )}
                <button onClick={() => setShowManualModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Manual Entry
                </button>
            </div>

            {/* Today Quick Clock-In/Out */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                <h2 className="font-semibold text-gray-900 mb-4 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" /> Today — {format(new Date(), 'dd MMMM yyyy')}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {mechanics.filter(m => m.isActive).map(m => {
                        const rec = todayAttByMechanic[m.id];
                        return (
                            <div key={m.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                                <p className="text-xs text-gray-400 mb-3">{rec?.clockIn ? `In: ${format(new Date(rec.clockIn), 'HH:mm')}` : 'Not in yet'}{rec?.clockOut ? ` · Out: ${format(new Date(rec.clockOut), 'HH:mm')}` : ''}</p>
                                <div className="flex gap-2">
                                    {!rec?.clockIn && (
                                        <button onClick={() => handleClockIn(m.id)} disabled={actionLoading === m.id + '_in'}
                                            className="flex-1 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors disabled:opacity-50">
                                            {actionLoading === m.id + '_in' ? '...' : 'Clock In'}
                                        </button>
                                    )}
                                    {rec?.clockIn && !rec?.clockOut && (
                                        <button onClick={() => handleClockOut(m.id)} disabled={actionLoading === m.id + '_out'}
                                            className="flex-1 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-md transition-colors disabled:opacity-50">
                                            {actionLoading === m.id + '_out' ? '...' : 'Clock Out'}
                                        </button>
                                    )}
                                    {rec?.clockOut && <span className="text-xs text-green-600 font-medium">✓ Done ({rec.totalHours?.toFixed(1)}h)</span>}
                                </div>
                            </div>
                        );
                    })}
                    {mechanics.filter(m => m.isActive).length === 0 && <p className="text-sm text-gray-400 col-span-full">No active mechanics. Add mechanics first.</p>}
                </div>
            </div>

            {/* Filters + Records */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex gap-3">
                        <select value={selectedMechanic} onChange={e => setSelectedMechanic(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">All Mechanics</option>
                            {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="text-right"><p className="text-xs text-gray-400">Days</p><p className="font-bold text-gray-900">{attendanceDays}</p></div>
                        <div className="text-right"><p className="text-xs text-gray-400">Total Hrs</p><p className="font-bold text-gray-900">{totalHours.toFixed(1)}h</p></div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Mechanic</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Clock In</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Clock Out</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Hours</th>
                                <th className="px-6 py-3 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center"><Loader2 className="w-5 h-5 animate-spin text-blue-500 mx-auto" /></td></tr>
                            ) : attendances.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">No attendance records this month</td></tr>
                            ) : attendances.map(a => (
                                <tr key={a.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-medium text-gray-900">{a.mechanic?.name}</td>
                                    <td className="px-6 py-3 text-gray-600">{a.date ? format(new Date(a.date), 'dd MMM yyyy') : '—'}</td>
                                    <td className="px-6 py-3 text-gray-600">{a.clockIn ? format(new Date(a.clockIn), 'HH:mm') : '—'}</td>
                                    <td className="px-6 py-3 text-gray-600">{a.clockOut ? format(new Date(a.clockOut), 'HH:mm') : <span className="text-amber-500 text-xs font-medium">Belum keluar</span>}</td>
                                    <td className="px-6 py-3 font-medium text-gray-900">{a.totalHours != null ? `${a.totalHours}h` : '—'}</td>
                                    <td className="px-6 py-3 text-right">
                                        <button onClick={() => handleDelete(a.id)} disabled={actionLoading === a.id + '_del'} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                            {actionLoading === a.id + '_del' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manual Entry Modal */}
            {showManualModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Manual Attendance Entry</h3>
                            <button onClick={() => setShowManualModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleManualSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mechanic *</label>
                                <select value={manualForm.mechanicId} onChange={e => setManualForm(p => ({ ...p, mechanicId: e.target.value }))}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select mechanic</option>
                                    {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
                                <input type="date" value={manualForm.date} onChange={e => setManualForm(p => ({ ...p, date: e.target.value }))}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Clock In</label>
                                    <input type="time" value={manualForm.clockIn} onChange={e => setManualForm(p => ({ ...p, clockIn: e.target.value }))}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Clock Out</label>
                                    <input type="time" value={manualForm.clockOut} onChange={e => setManualForm(p => ({ ...p, clockOut: e.target.value }))}
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowManualModal(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
